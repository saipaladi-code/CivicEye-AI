import 'dotenv/config';
import crypto from 'node:crypto';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { MongoClient } from 'mongodb';
import nodemailer from 'nodemailer';
import analyzeHandler from './api/analyze.js';
import { ensureAuthCollections } from './db/authSchema.js';
import { checkForDuplicates } from './src/utils/duplicateChecker.js';
import { calculatePriorityScore } from './src/utils/priorityEngine.js';

const app = express();
const port = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';
const sessionCookie = 'civiceye_session';
const defaultSessionDays = 7;
const persistentSessionDays = 30;
const here = path.dirname(fileURLToPath(import.meta.url));
const dummyPasswordHash = bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12);

let databasePromise;

const getDatabase = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not configured on the server.');
  }
  if (!databasePromise) {
    databasePromise = (async () => {
      const client = await new MongoClient(uri).connect();
      const db = client.db(process.env.MONGODB_DB_NAME || 'civiceye');
      await ensureAuthCollections(db);
      return db;
    })().catch((error) => {
      databasePromise = undefined;
      throw error;
    });
  }
  return databasePromise;
};

const requireAuthenticatedUser = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Please sign in to continue.' });
  return next();
};

const requireAuthority = (req, res, next) => {
  if (req.user?.role !== 'authority') {
    return res.status(403).json({ error: 'Municipal Authority access is required.' });
  }
  return next();
};

const formatDateTime = (date) => new Date(date).toLocaleString('en-US', {
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hour12: true
});

const serializeComplaint = ({ _id, userId, createdAt, ...complaint }) => complaint;
const serializeNotification = ({ _id, userId, createdAt, ...notification }) => ({
  ...notification,
  id: _id.toString(),
  time: new Date(createdAt).toLocaleString()
});

const createNotification = async (db, userId, title, message, complaintId) => {
  await db.collection('notifications').insertOne({
    userId,
    title,
    message,
    read: false,
    complaintId,
    createdAt: new Date()
  });
};

const updateComplaintTimeline = (complaint, newStatus, note) => {
  const timestamp = formatDateTime(new Date());
  return complaint.timeline.map((item) => {
    if (item.step === newStatus) {
      return { ...item, status: 'completed', timestamp, note };
    }
    if (newStatus === 'Assigned' && item.step === 'Assigned') {
      return { ...item, status: 'completed', timestamp, note };
    }
    if (newStatus === 'In Progress' && item.step === 'In Progress') {
      return { ...item, status: 'current', timestamp, note };
    }
    return item;
  });
};

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const cookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  path: '/',
  maxAge
});

const setSessionCookie = (res, token, maxAge) => {
  res.cookie(sessionCookie, token, cookieOptions(maxAge));
};

const clearSessionCookie = (res) => {
  res.clearCookie(sessionCookie, cookieOptions(0));
};

const requireSameOrigin = (req, res, next) => {
  const origin = req.get('origin');
  if (origin) {
    try {
      if (new URL(origin).host !== req.get('host')) {
        return res.status(403).json({ error: 'Cross-origin requests are not allowed.' });
      }
    } catch {
      return res.status(403).json({ error: 'Cross-origin requests are not allowed.' });
    }
  }
  return next();
};

const emailIsValid = (email) => (
  typeof email === 'string' &&
  email.length <= 254 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
);
const recoveryIsConfigured = () => Boolean(
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASSWORD &&
  process.env.SMTP_FROM &&
  process.env.APP_BASE_URL
);

const transporter = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

const createSession = async (user, remember, res) => {
  const sessionDays = remember ? persistentSessionDays : defaultSessionDays;
  const expiresAt = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000);
  const token = crypto.randomBytes(32).toString('base64url');
  const db = await getDatabase();

  await db.collection('sessions').insertOne({
    tokenHash: hashToken(token),
    userId: user._id,
    expiresAt,
    createdAt: new Date()
  });

  setSessionCookie(res, token, sessionDays * 24 * 60 * 60 * 1000);
};

const publicUser = (user) => ({
  id: user._id.toString(),
  fullName: user.fullName,
  email: user.email,
  mobile: user.mobile || '',
  role: user.role
});

const resolveUser = async (req, res, next) => {
  const token = req.cookies[sessionCookie];
  if (!token) {
    req.user = null;
    return next();
  }

  const db = await getDatabase();
  const session = await db.collection('sessions').findOne({
    tokenHash: hashToken(token),
    expiresAt: { $gt: new Date() }
  });
  if (!session) {
    clearSessionCookie(res);
    req.user = null;
    return next();
  }

  const user = await db.collection('users').findOne({ _id: session.userId });
  if (!user) {
    await db.collection('sessions').deleteOne({ _id: session._id });
    clearSessionCookie(res);
    req.user = null;
    return next();
  }

  req.user = user;
  return next();
};

const httpServer = createServer(app);

app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '12mb' }));
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again in a few minutes.' }
});

app.post('/api/auth/register', requireSameOrigin, authLimiter, async (req, res) => {
  const { fullName, email, mobile = '', password, accountType = 'citizen' } = req.body || {};
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (typeof fullName !== 'string' || fullName.trim().length < 2 || fullName.trim().length > 100) {
    return res.status(400).json({ error: 'Enter your full name (2–100 characters).' });
  }
  if (!emailIsValid(normalizedEmail)) {
    return res.status(400).json({ error: 'Enter a valid email address.' });
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    return res.status(400).json({ error: 'Password must be between 8 and 128 characters.' });
  }
  if (typeof mobile !== 'string' || mobile.length > 30) {
    return res.status(400).json({ error: 'Enter a valid mobile number.' });
  }
  if (!['citizen', 'authority'].includes(accountType)) {
    return res.status(400).json({ error: 'Select a valid account type.' });
  }
  if (accountType === 'authority') {
    return res.status(403).json({
      error: 'Municipal Authority accounts can only be created by an administrator. Contact your CivicEye administrator.'
    });
  }

  const db = await getDatabase();
  const passwordHash = await bcrypt.hash(password, 12);
  const user = {
    fullName: fullName.trim(),
    email: normalizedEmail,
    mobile: mobile.trim(),
    passwordHash,
    role: accountType,
    createdAt: new Date()
  };

  try {
    const result = await db.collection('users').insertOne(user);
    user._id = result.insertedId;
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    throw error;
  }

  await createSession(user, false, res);
  return res.status(201).json({ user: publicUser(user) });
});

app.post('/api/auth/login', requireSameOrigin, authLimiter, async (req, res) => {
  const { email, password, remember = false, accountType = 'citizen' } = req.body || {};
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!emailIsValid(normalizedEmail) || typeof password !== 'string' || password.length > 128) {
    return res.status(400).json({ error: 'Enter a valid email address and password.' });
  }
  if (!['citizen', 'authority'].includes(accountType)) {
    return res.status(400).json({ error: 'Select a valid account type.' });
  }

  const db = await getDatabase();
  const user = await db.collection('users').findOne({ email: normalizedEmail });
  const passwordMatches = user
    ? await bcrypt.compare(password, user.passwordHash)
    : await bcrypt.compare(password, await dummyPasswordHash);

  if (!user || !passwordMatches || user.role !== accountType) {
    return res.status(401).json({ error: 'Email, password, or account type is incorrect.' });
  }

  await createSession(user, remember === true, res);
  return res.status(200).json({ user: publicUser(user) });
});

app.get('/api/auth/me', resolveUser, (req, res) => {
  res.json({ user: req.user ? publicUser(req.user) : null });
});

app.post('/api/auth/logout', requireSameOrigin, async (req, res) => {
  const token = req.cookies[sessionCookie];
  if (token) {
    const db = await getDatabase();
    await db.collection('sessions').deleteOne({ tokenHash: hashToken(token) });
  }
  clearSessionCookie(res);
  res.status(200).json({ ok: true });
});

app.post('/api/auth/forgot-password', requireSameOrigin, authLimiter, async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  if (!emailIsValid(email)) {
    return res.status(400).json({ error: 'Enter a valid email address.' });
  }
  if (!recoveryIsConfigured()) {
    return res.status(503).json({
      error: 'Password recovery is not configured yet. Configure the SMTP settings before requesting a reset.'
    });
  }

  const db = await getDatabase();
  const user = await db.collection('users').findOne({ email });
  if (user) {
    const token = crypto.randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await db.collection('passwordResets').deleteMany({ userId: user._id });
    await db.collection('passwordResets').insertOne({
      userId: user._id,
      tokenHash: hashToken(token),
      expiresAt,
      createdAt: new Date()
    });

    const resetUrl = new URL('/', process.env.APP_BASE_URL);
    if (isProduction && resetUrl.protocol !== 'https:') {
      throw new Error('APP_BASE_URL must use HTTPS in production.');
    }
    resetUrl.searchParams.set('resetToken', token);
    const emailUrl = resetUrl.toString()
      .replaceAll('&', '&amp;')
      .replaceAll('"', '&quot;')
      .replaceAll('<', '&lt;');
    await transporter().sendMail({
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: 'Reset your CivicEye password',
      text: `Use this link within 1 hour to reset your CivicEye password:\n\n${resetUrl.toString()}\n\nIf you did not request this, ignore this message.`,
      html: `<p>Use this link within 1 hour to reset your CivicEye password:</p><p><a href="${emailUrl}">Reset password</a></p><p>If you did not request this, ignore this message.</p>`
    });
  }
  return res.status(200).json({
    message: 'If an account exists for this email, password recovery instructions have been sent.'
  });
});

app.post('/api/auth/reset-password', requireSameOrigin, authLimiter, async (req, res) => {
  const { token, password } = req.body || {};
  if (typeof token !== 'string' || token.length < 32 || token.length > 200) {
    return res.status(400).json({ error: 'This password reset link is invalid or has expired.' });
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    return res.status(400).json({ error: 'Password must be between 8 and 128 characters.' });
  }

  const db = await getDatabase();
  const reset = await db.collection('passwordResets').findOne({
    tokenHash: hashToken(token),
    expiresAt: { $gt: new Date() }
  });
  if (!reset) {
    return res.status(400).json({ error: 'This password reset link is invalid or has expired.' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.collection('users').updateOne(
    { _id: reset.userId },
    { $set: { passwordHash, passwordUpdatedAt: new Date() } }
  );
  await Promise.all([
    db.collection('passwordResets').deleteMany({ userId: reset.userId }),
    db.collection('sessions').deleteMany({ userId: reset.userId })
  ]);
  clearSessionCookie(res);
  return res.status(200).json({ message: 'Your password was reset. Sign in with your new password.' });
});

app.get('/api/data/bootstrap', resolveUser, requireAuthenticatedUser, async (req, res) => {
  const db = await getDatabase();
  const complaintFilter = req.user.role === 'authority' ? {} : { userId: req.user._id };
  const [complaints, notifications] = await Promise.all([
    db.collection('complaints')
      .find(complaintFilter)
      .sort({ createdAt: -1 })
      .limit(1000)
      .toArray(),
    db.collection('notifications')
      .find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray()
  ]);
  res.json({
    complaints: complaints.map(serializeComplaint),
    notifications: notifications.map(serializeNotification)
  });
});

app.post('/api/data/complaints', requireSameOrigin, resolveUser, requireAuthenticatedUser, async (req, res) => {
  const {
    category, imageUrl, resolutionImageUrl, location, coordinates,
    description, severity, confidence, publicImpact
  } = req.body || {};
  const stringIsValid = (value, maxLength, required = true) => (
    typeof value === 'string' &&
    (!required || value.trim().length > 0) &&
    value.length <= maxLength
  );
  if (!stringIsValid(category, 80) || !stringIsValid(location, 300) || !stringIsValid(description, 4000)) {
    return res.status(400).json({ error: 'Enter a category, location, and description within the allowed length.' });
  }
  if (!['High', 'Medium', 'Low'].includes(severity) || !['High', 'Medium', 'Low'].includes(publicImpact)) {
    return res.status(400).json({ error: 'Select a valid severity and public impact.' });
  }
  if (confidence !== undefined && (!Number.isFinite(confidence) || confidence < 0 || confidence > 100)) {
    return res.status(400).json({ error: 'Invalid AI confidence value.' });
  }
  if (
    !coordinates ||
    !Number.isFinite(coordinates.lat) || coordinates.lat < -90 || coordinates.lat > 90 ||
    !Number.isFinite(coordinates.lng) || coordinates.lng < -180 || coordinates.lng > 180
  ) {
    return res.status(400).json({ error: 'Enter valid map coordinates.' });
  }
  const validImage = (value) => value == null || (
    typeof value === 'string' &&
    value.length <= 5 * 1024 * 1024 &&
    (
      /^https:\/\//i.test(value) ||
      /^data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+$/.test(value) ||
      /^data:image\/svg\+xml;utf8,/i.test(value)
    )
  );
  if (!validImage(imageUrl) || !validImage(resolutionImageUrl)) {
    return res.status(400).json({ error: 'Images must be HTTPS URLs or supported image data under 5 MB.' });
  }

  const db = await getDatabase();
  const matchingComplaints = await db.collection('complaints')
    .find({ category: category.trim() }, { projection: { category: 1, location: 1 } })
    .toArray();
  const duplicateResult = checkForDuplicates(category.trim(), location.trim(), matchingComplaints);
  const verifiedDuplicateCount = duplicateResult.count;
  const sequence = await db.collection('counters').findOneAndUpdate(
    { _id: 'complaints' },
    { $inc: { value: 1 } },
    { upsert: true, returnDocument: 'after' }
  );
  const now = new Date();
  const nowText = formatDateTime(now);
  const priority = calculatePriorityScore({
    severity,
    duplicateCount: verifiedDuplicateCount,
    publicImpact,
    isHighTraffic: true
  });
  const id = `CE-${now.getFullYear()}-${String(sequence.value).padStart(6, '0')}`;
  const complaint = {
    id,
    citizenName: req.user.fullName,
    category: category.trim(),
    imageUrl: imageUrl || '',
    resolutionImageUrl: resolutionImageUrl || null,
    location: location.trim(),
    coordinates,
    description: description.trim(),
    severity,
    confidence: confidence ?? 94,
    duplicateCount: verifiedDuplicateCount,
    priorityScore: priority.total,
    status: 'Submitted',
    department: 'Road Maintenance',
    worker: 'Unassigned',
    createdDate: nowText,
    expectedResolution: '',
    resolvedDate: null,
    publicImpact,
    isHighTraffic: true,
    breakdown: priority.breakdown,
    timeline: [
      { step: 'Report Submitted', status: 'completed', timestamp: nowText, note: 'Complaint created' },
      { step: 'AI Verified', status: 'completed', timestamp: nowText, note: `Detected: ${category} (${confidence ?? 94}%)` },
      { step: 'Priority Generated', status: 'completed', timestamp: nowText, note: `Score: ${priority.total}/100 (${priority.level})` },
      { step: 'Assigned', status: 'upcoming', timestamp: '-', note: 'Pending department dispatch' },
      { step: 'In Progress', status: 'upcoming', timestamp: '-', note: '-' },
      { step: 'Resolved', status: 'upcoming', timestamp: '-', note: '-' }
    ]
  };
  await db.collection('complaints').insertOne({
    ...complaint,
    userId: req.user._id,
    createdAt: now
  });
  await createNotification(
    db,
    req.user._id,
    'Complaint Submitted',
    `Your complaint ${id} has been logged & scored by AI (${priority.total}/100).`,
    id
  );
  return res.status(201).json({ complaint });
});

app.patch('/api/data/complaints/:id/assignment', requireSameOrigin, resolveUser, requireAuthenticatedUser, requireAuthority, async (req, res) => {
  const { department, worker } = req.body || {};
  if (
    typeof department !== 'string' || !department.trim() || department.length > 100 ||
    typeof worker !== 'string' || !worker.trim() || worker.length > 100
  ) {
    return res.status(400).json({ error: 'Enter a valid department and assigned worker.' });
  }
  const db = await getDatabase();
  const complaint = await db.collection('complaints').findOne({ id: req.params.id });
  if (!complaint) return res.status(404).json({ error: 'Complaint not found.' });

  const now = new Date();
  const timeline = updateComplaintTimeline(
    complaint,
    'Assigned',
    `Assigned to ${department.trim()} (${worker.trim()})`
  ).map((item) => item.step === 'In Progress'
    ? { ...item, status: 'current', timestamp: formatDateTime(now), note: 'Work crew assigned' }
    : item);
  const result = await db.collection('complaints').findOneAndUpdate(
    { id: complaint.id },
    { $set: { status: 'Assigned', department: department.trim(), worker: worker.trim(), timeline } },
    { returnDocument: 'after' }
  );
  await createNotification(
    db,
    complaint.userId,
    'Complaint Assigned',
    `Your complaint ${complaint.id} has been assigned to ${department} (${worker}).`,
    complaint.id
  );
  return res.json({ complaint: serializeComplaint(result) });
});

app.patch('/api/data/complaints/:id/status', requireSameOrigin, resolveUser, requireAuthenticatedUser, requireAuthority, async (req, res) => {
  const { status } = req.body || {};
  if (!['Submitted', 'Verified', 'Assigned', 'In Progress', 'Resolved'].includes(status)) {
    return res.status(400).json({ error: 'Select a valid complaint status.' });
  }
  const db = await getDatabase();
  const complaint = await db.collection('complaints').findOne({ id: req.params.id });
  if (!complaint) return res.status(404).json({ error: 'Complaint not found.' });
  const timeline = updateComplaintTimeline(complaint, status, `Status updated to ${status}`);
  const result = await db.collection('complaints').findOneAndUpdate(
    { id: complaint.id },
    { $set: { status, timeline } },
    { returnDocument: 'after' }
  );
  await createNotification(
    db,
    complaint.userId,
    'Status Updated',
    `Complaint ${complaint.id} status updated to: ${status.toUpperCase()}.`,
    complaint.id
  );
  return res.json({ complaint: serializeComplaint(result) });
});

app.patch('/api/data/complaints/:id/resolve', requireSameOrigin, resolveUser, requireAuthenticatedUser, requireAuthority, async (req, res) => {
  const { resolutionImageUrl } = req.body || {};
  if (resolutionImageUrl !== undefined && (
    typeof resolutionImageUrl !== 'string' ||
    resolutionImageUrl.length > 5 * 1024 * 1024 ||
    (
      !/^https:\/\//i.test(resolutionImageUrl) &&
      !/^data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+$/.test(resolutionImageUrl) &&
      !/^data:image\/svg\+xml;utf8,/i.test(resolutionImageUrl)
    )
  )) {
    return res.status(400).json({ error: 'Resolution image must be an HTTPS URL or supported image data under 5 MB.' });
  }
  const db = await getDatabase();
  const complaint = await db.collection('complaints').findOne({ id: req.params.id });
  if (!complaint) return res.status(404).json({ error: 'Complaint not found.' });
  const now = new Date();
  const nowText = formatDateTime(now);
  const timeline = complaint.timeline.map((item) => ({
    ...item,
    status: 'completed',
    timestamp: item.timestamp === '-' ? nowText : item.timestamp
  }));
  const result = await db.collection('complaints').findOneAndUpdate(
    { id: complaint.id },
    {
      $set: {
        status: 'Resolved',
        resolvedDate: nowText,
        resolutionImageUrl: resolutionImageUrl || complaint.resolutionImageUrl,
        timeline
      }
    },
    { returnDocument: 'after' }
  );
  await createNotification(
    db,
    complaint.userId,
    'Issue Resolved!',
    `Your complaint ${complaint.id} has been fully resolved with verified after-fix evidence.`,
    complaint.id
  );
  return res.json({ complaint: serializeComplaint(result) });
});

app.patch('/api/data/notifications/read-all', requireSameOrigin, resolveUser, requireAuthenticatedUser, async (req, res) => {
  const db = await getDatabase();
  await db.collection('notifications').updateMany(
    { userId: req.user._id, read: false },
    { $set: { read: true } }
  );
  return res.json({ ok: true });
});

app.all('/api/analyze', analyzeHandler);

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found.' });
});

app.use((error, _req, res, _next) => {
  console.error('CivicEye server request failed:', error.name || 'Error');
  if (res.headersSent) return;
  const message = error.message === 'MONGODB_URI is not configured on the server.'
    ? 'MongoDB is not configured. Add MONGODB_URI to the private .env file and restart the server.'
    : 'The authentication service could not complete the request. Check server configuration and try again.';
  res.status(500).json({
    error: message
  });
});

if (isProduction) {
  app.use(express.static(path.join(here, 'dist')));
  app.get('/{*splat}', (_req, res) => res.sendFile(path.join(here, 'dist', 'index.html')));
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    configFile: path.join(here, 'vite.config.js'),
    server: { middlewareMode: true, allowedHosts: true, hmr: { server: httpServer } },
    appType: 'spa'
  });
  app.use(vite.middlewares);
}

httpServer.listen(port, isProduction ? '0.0.0.0' : '127.0.0.1', () => {
  console.log(`CivicEye is available at http://localhost:${port}`);
});
