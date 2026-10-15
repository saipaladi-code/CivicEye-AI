import 'dotenv/config';
import crypto from 'node:crypto';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { get as getBlob } from '@vercel/blob';
import { Readable } from 'node:stream';
import cookieParser from 'cookie-parser';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { GridFSBucket, MongoClient, ObjectId } from 'mongodb';
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

const isFieldWorker = (user) => ['worker', 'field_worker'].includes(user?.role);
const isApprovedFieldWorker = (user) => (
  isFieldWorker(user) &&
  (user.approvalStatus === 'APPROVED' || (user.role === 'worker' && !user.approvalStatus))
);
const requireApprovedFieldWorker = (req, res, next) => {
  if (isFieldWorker(req.user) && !isApprovedFieldWorker(req.user)) {
    return res.status(403).json({ error: 'Your field worker account must be approved before accessing this service.' });
  }
  return next();
};

const formatDateTime = (date) => new Date(date).toLocaleString('en-US', {
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hour12: true
});

const serializeComplaint = (complaint, user) => {
  const {
    _id, userId, createdAt, evidenceSubmissions = [], assignmentHistory = [],
    approvedEvidence = [], assignedWorkerId, ...publicComplaint
  } = complaint;
  const userIdText = user?._id?.toString();
  const mayReview = user?.role === 'authority';
  const visibleSubmissions = evidenceSubmissions.filter((submission) => (
    mayReview || (
      isFieldWorker(user) &&
      (submission.workerId?.toString?.() || submission.workerId) === userIdText
    )
  ));
  const toPublicEvidence = (submission) => ({
    id: submission.id,
    note: submission.note,
    submittedAt: submission.submittedAt,
    status: submission.status,
    rejectionReason: submission.rejectionReason || '',
    reviewedAt: submission.reviewedAt || null,
    reviewerName: submission.reviewerName || '',
    workerName: submission.workerName,
    photos: submission.photos.map((photo) => ({
      id: photo.id,
      contentType: photo.contentType,
      size: photo.size,
      url: `/api/workflow/evidence?complaintId=${encodeURIComponent(complaint.id)}&submissionId=${encodeURIComponent(submission.id)}&photoId=${encodeURIComponent(photo.id)}`
    }))
  });
  const visibleApproved = user?.role === 'citizen' && complaint.status !== 'Resolved'
    ? []
    : approvedEvidence;
  return {
    ...publicComplaint,
    ...(user?.role === 'authority' ? { assignedWorkerId: assignedWorkerId?.toString() || '' } : {}),
    ...(user?.role === 'authority' ? { assignmentHistory } : {}),
    ...(mayReview || isFieldWorker(user)
      ? { evidenceSubmissions: visibleSubmissions.map(toPublicEvidence) }
      : {}),
    approvedEvidence: visibleApproved.map(toPublicEvidence)
  };
};
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
    createdAt: new Date(),
    ...(typeof complaintId === 'string' ? { complaintId } : {})
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
  role: user.role,
  ...(isFieldWorker(user) ? {
    department: user.department || '',
    employeeId: user.employeeId || '',
    workLocation: user.workLocation || '',
    approvalStatus: user.approvalStatus || 'APPROVED',
    applicationStatus: user.applicationStatus || 'APPROVED',
    rejectionReason: user.rejectionReason || '',
    adminMessage: user.adminMessage || ''
  } : {})
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
  const {
    fullName, email, mobile = '', password, accountType = 'citizen',
    department, employeeId, workLocation, profileProof
  } = req.body || {};
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const fieldWorkerRegistration = ['worker', 'field_worker'].includes(accountType);

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
  if (!['citizen', 'authority', 'worker', 'field_worker'].includes(accountType)) {
    return res.status(400).json({ error: 'Select a valid account type.' });
  }
  if (accountType === 'authority') {
    return res.status(403).json({
      error: 'Municipal Authority accounts can only be created by an administrator. Contact your CivicEye administrator.'
    });
  }
  const workerDepartments = ['Sanitation', 'Road Maintenance', 'Water Supply', 'Electrical Maintenance', 'Drainage'];
  if (fieldWorkerRegistration) {
    if (
      typeof mobile !== 'string' || !/^[+\d() .-]{7,30}$/.test(mobile.trim()) ||
      typeof department !== 'string' || !workerDepartments.includes(department) ||
      typeof employeeId !== 'string' || employeeId.trim().length < 2 || employeeId.trim().length > 80 ||
      typeof workLocation !== 'string' || workLocation.trim().length < 2 || workLocation.trim().length > 200
    ) {
      return res.status(400).json({ error: 'Enter a valid mobile number, department, employee ID, and work location.' });
    }
    if (profileProof !== undefined && profileProof !== null) {
      const { fileName, contentType, data } = profileProof;
      if (
        typeof fileName !== 'string' || !fileName.trim() || fileName.length > 200 ||
        !['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(contentType) ||
        typeof data !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(data) ||
        data.length > 2800000
      ) {
        return res.status(400).json({ error: 'Upload a supported profile photo or employee ID proof under 2 MB.' });
      }
      const proofBytes = Buffer.from(data, 'base64');
      const validSignature = contentType === 'image/jpeg'
        ? proofBytes[0] === 0xff && proofBytes[1] === 0xd8 && proofBytes[2] === 0xff
        : contentType === 'image/png'
          ? proofBytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
          : contentType === 'image/webp'
            ? proofBytes.toString('ascii', 0, 4) === 'RIFF' && proofBytes.toString('ascii', 8, 12) === 'WEBP'
            : proofBytes.toString('ascii', 0, 5) === '%PDF-';
      if (
        proofBytes.length < 1 || proofBytes.length > 2 * 1024 * 1024 ||
        proofBytes.toString('base64') !== data || !validSignature
      ) {
        return res.status(400).json({ error: 'The profile photo or employee ID proof is invalid or exceeds 2 MB.' });
      }
    }
  } else if (typeof mobile !== 'string' || mobile.length > 30) {
    return res.status(400).json({ error: 'Enter a valid mobile number.' });
  }

  const db = await getDatabase();
  const passwordHash = await bcrypt.hash(password, 12);
  const user = {
    fullName: fullName.trim(),
    email: normalizedEmail,
    mobile: mobile.trim(),
    passwordHash,
    role: fieldWorkerRegistration ? 'field_worker' : 'citizen',
    ...(fieldWorkerRegistration ? {
      department,
      employeeId: employeeId.trim(),
      workLocation: workLocation.trim(),
      approvalStatus: 'PENDING_APPROVAL',
      applicationStatus: 'PENDING_APPROVAL',
      rejectionReason: '',
      adminMessage: '',
      ...(profileProof ? {
        profileProof: {
          fileName: profileProof.fileName.trim(),
          contentType: profileProof.contentType,
          data: profileProof.data
        }
      } : {})
    } : {}),
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

  if (fieldWorkerRegistration) {
    return res.status(201).json({
      approvalStatus: user.approvalStatus,
      message: 'Your application has been submitted and is awaiting administrator approval. You will be able to access your dashboard once your account is approved.'
    });
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
  if (!['citizen', 'authority', 'worker', 'field_worker'].includes(accountType)) {
    return res.status(400).json({ error: 'Select a valid account type.' });
  }

  const db = await getDatabase();
  const user = await db.collection('users').findOne({ email: normalizedEmail });
  const passwordMatches = user
    ? await bcrypt.compare(password, user.passwordHash)
    : await bcrypt.compare(password, await dummyPasswordHash);

  const roleMatches = user && (
    user.role === accountType ||
    (['worker', 'field_worker'].includes(accountType) && isFieldWorker(user))
  );
  if (!user || !passwordMatches || !roleMatches) {
    return res.status(401).json({ error: 'Email, password, or account type is incorrect.' });
  }
  if (isFieldWorker(user) && !isApprovedFieldWorker(user)) {
    if (user.approvalStatus === 'REJECTED') {
      const rejectionReason = user.rejectionReason || 'No reason was provided.';
      return res.status(403).json({
        approvalStatus: 'REJECTED',
        rejectionReason,
        error: `Your application was rejected. Reason: ${rejectionReason} Contact your CivicEye administrator for assistance.`
      });
    }
    if (user.applicationStatus === 'MORE_INFO_REQUIRED' && user.adminMessage) {
      return res.status(403).json({
        approvalStatus: 'PENDING_APPROVAL',
        applicationStatus: 'MORE_INFO_REQUIRED',
        adminMessage: user.adminMessage,
        error: `Your application requires more information: ${user.adminMessage}`
      });
    }
    return res.status(403).json({
      approvalStatus: 'PENDING_APPROVAL',
      error: 'Your application is still under review. Please wait for administrator approval.'
    });
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

app.get('/api/admin/worker-applications', resolveUser, requireAuthenticatedUser, requireAuthority, async (_req, res) => {
  const db = await getDatabase();
  const applications = await db.collection('users')
    .find({ role: 'field_worker' }, {
      projection: {
        passwordHash: 0,
        'profileProof.data': 0
      }
    })
    .sort({ createdAt: -1 })
    .limit(500)
    .toArray();
  return res.json({
    applications: applications.map((application) => ({
      id: application._id.toString(),
      fullName: application.fullName,
      email: application.email,
      mobile: application.mobile || '',
      department: application.department,
      employeeId: application.employeeId,
      workLocation: application.workLocation,
      createdAt: application.createdAt,
      approvalStatus: application.approvalStatus,
      applicationStatus: application.applicationStatus || application.approvalStatus,
      approvedAt: application.approvedAt || null,
      rejectionReason: application.rejectionReason || '',
      adminMessage: application.adminMessage || '',
      hasProfileProof: Boolean(application.profileProof)
    }))
  });
});

app.get('/api/admin/worker-applications/:id', resolveUser, requireAuthenticatedUser, requireAuthority, async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Application ID is invalid.' });
  const application = await (await getDatabase()).collection('users').findOne(
    { _id: new ObjectId(req.params.id), role: 'field_worker' },
    { projection: { passwordHash: 0 } }
  );
  if (!application) return res.status(404).json({ error: 'Field worker application not found.' });
  return res.json({
    application: {
      id: application._id.toString(),
      fullName: application.fullName,
      email: application.email,
      mobile: application.mobile || '',
      department: application.department,
      employeeId: application.employeeId,
      workLocation: application.workLocation,
      createdAt: application.createdAt,
      approvalStatus: application.approvalStatus,
      applicationStatus: application.applicationStatus || application.approvalStatus,
      approvedAt: application.approvedAt || null,
      rejectionReason: application.rejectionReason || '',
      adminMessage: application.adminMessage || '',
      profileProof: application.profileProof
        ? {
            fileName: application.profileProof.fileName,
            contentType: application.profileProof.contentType,
            data: application.profileProof.data
          }
        : null
    }
  });
});

app.patch('/api/admin/worker-applications/:id', requireSameOrigin, resolveUser, requireAuthenticatedUser, requireAuthority, async (req, res) => {
  const { action, message = '' } = req.body || {};
  if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Application ID is invalid.' });
  if (!['approve', 'reject', 'request-info'].includes(action)) {
    return res.status(400).json({ error: 'Select approve, reject, or request more information.' });
  }
  if (
    typeof message !== 'string' ||
    (action !== 'approve' && (message.trim().length < 3 || message.length > 1000))
  ) {
    return res.status(400).json({
      error: action === 'reject'
        ? 'Enter a rejection reason between 3 and 1000 characters.'
        : 'Enter a message between 3 and 1000 characters.'
    });
  }
  const db = await getDatabase();
  const applicationId = new ObjectId(req.params.id);
  const application = await db.collection('users').findOne({
    _id: applicationId,
    role: 'field_worker',
    approvalStatus: 'PENDING_APPROVAL'
  });
  if (!application) return res.status(409).json({ error: 'This application is no longer awaiting a decision.' });

  const now = new Date();
  let update;
  let title;
  let notificationMessage;
  if (action === 'approve') {
    update = {
      $set: {
        approvalStatus: 'APPROVED',
        applicationStatus: 'APPROVED',
        approvedBy: req.user._id,
        approvedAt: now,
        adminMessage: '',
        rejectionReason: ''
      }
    };
    title = 'Field Worker Application Approved';
    notificationMessage = 'Your field worker application has been approved. You can now sign in to access your dashboard.';
  } else if (action === 'reject') {
    update = {
      $set: {
        approvalStatus: 'REJECTED',
        applicationStatus: 'REJECTED',
        rejectionReason: message.trim(),
        adminMessage: ''
      },
      $unset: { approvedBy: '', approvedAt: '' }
    };
    title = 'Field Worker Application Rejected';
    notificationMessage = `Your field worker application was rejected. Reason: ${message.trim()}`;
  } else {
    update = {
      $set: {
        applicationStatus: 'MORE_INFO_REQUIRED',
        adminMessage: message.trim()
      }
    };
    title = 'More Information Required';
    notificationMessage = `Please update your application: ${message.trim()}`;
  }
  const result = await db.collection('users').findOneAndUpdate(
    { _id: applicationId, role: 'field_worker', approvalStatus: 'PENDING_APPROVAL' },
    update,
    { returnDocument: 'after', projection: { passwordHash: 0, 'profileProof.data': 0 } }
  );
  if (!result) return res.status(409).json({ error: 'This application changed before the decision was saved.' });
  await createNotification(db, applicationId, title, notificationMessage);
  return res.json({
    application: {
      id: result._id.toString(),
      fullName: result.fullName,
      email: result.email,
      mobile: result.mobile || '',
      department: result.department,
      employeeId: result.employeeId,
      workLocation: result.workLocation,
      createdAt: result.createdAt,
      approvalStatus: result.approvalStatus,
      applicationStatus: result.applicationStatus,
      approvedAt: result.approvedAt || null,
      rejectionReason: result.rejectionReason || '',
      adminMessage: result.adminMessage || '',
      hasProfileProof: Boolean(result.profileProof)
    }
  });
});

app.get('/api/data/bootstrap', resolveUser, requireAuthenticatedUser, requireApprovedFieldWorker, async (req, res) => {
  const db = await getDatabase();
  const complaintFilter = req.user.role === 'authority'
    ? {}
    : isFieldWorker(req.user)
      ? { assignedWorkerId: req.user._id }
      : { userId: req.user._id };
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
    complaints: complaints.map((complaint) => serializeComplaint(complaint, req.user)),
    notifications: notifications.map(serializeNotification)
  });
});

app.post('/api/data/complaints', requireSameOrigin, resolveUser, requireAuthenticatedUser, requireApprovedFieldWorker, async (req, res) => {
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
  const validImage = (value) => {
    if (value == null) return true;
    if (typeof value !== 'string') return false;

    const maxImageSize = 5 * 1024 * 1024;
    if (/^https:\/\//i.test(value)) {
      return Buffer.byteLength(value, 'utf8') <= maxImageSize;
    }

    const base64Match = value.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,([A-Za-z0-9+/]+={0,2})$/);
    if (base64Match) {
      const encodedImage = base64Match[1];
      const padding = encodedImage.endsWith('==') ? 2 : encodedImage.endsWith('=') ? 1 : 0;
      const decodedSize = Math.floor(encodedImage.length * 3 / 4) - padding;
      return decodedSize <= maxImageSize;
    }

    return /^data:image\/svg\+xml;utf8,/i.test(value) &&
      Buffer.byteLength(value, 'utf8') <= maxImageSize;
  };
  if (!validImage(imageUrl) || !validImage(resolutionImageUrl)) {
    return res.status(400).json({ error: 'Images must be HTTPS URLs or supported image data no larger than 5 MB.' });
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
  const { department, workerId, instructions = '', deadline = '' } = req.body || {};
  if (
    typeof department !== 'string' || !department.trim() || department.length > 100 ||
    typeof workerId !== 'string' || !ObjectId.isValid(workerId) ||
    typeof instructions !== 'string' || instructions.length > 1000 ||
    (deadline !== '' && (typeof deadline !== 'string' || !Number.isFinite(Date.parse(deadline))))
  ) {
    return res.status(400).json({ error: 'Enter a valid department, field worker, instructions, and deadline.' });
  }

  const db = await getDatabase();
  const [complaint, worker] = await Promise.all([
    db.collection('complaints').findOne({ id: req.params.id }),
    db.collection('users').findOne({
      _id: new ObjectId(workerId),
      role: { $in: ['worker', 'field_worker'] },
      $or: [
        { approvalStatus: 'APPROVED' },
        { role: 'worker', approvalStatus: { $exists: false } }
      ]
    })
  ]);
  if (!complaint) return res.status(404).json({ error: 'Complaint not found.' });
  if (!worker) return res.status(400).json({ error: 'Select an existing field worker account.' });
  if ((worker.department || '') !== department.trim()) {
    return res.status(400).json({ error: 'Select a field worker assigned to the selected department.' });
  }
  if (complaint.status === 'Resolved') return res.status(409).json({ error: 'A resolved complaint cannot be reassigned.' });
  if (complaint.workerTaskStatus === 'Evidence Submitted') {
    return res.status(409).json({ error: 'Evidence must be reviewed before this task can be reassigned.' });
  }

  const now = new Date();
  const assignment = {
    workerId: worker._id,
    workerName: worker.fullName,
    department: department.trim(),
    instructions: instructions.trim(),
    deadline: deadline ? new Date(deadline) : null,
    assignedAt: now,
    assignedBy: req.user._id
  };
  const timeline = updateComplaintTimeline(complaint, 'Assigned', `Assigned to ${department.trim()} (${worker.fullName})`);
  const result = await db.collection('complaints').findOneAndUpdate(
    { id: complaint.id, status: { $nin: ['Resolved', 'Evidence Submitted'] } },
    {
      $set: {
        status: 'Assigned',
        workerTaskStatus: 'Assigned',
        assignedWorkerId: worker._id,
        worker: worker.fullName,
        department: department.trim(),
        assignmentInstructions: instructions.trim(),
        assignmentDeadline: deadline ? new Date(deadline) : null,
        assignedAt: now,
        timeline
      },
      $push: { assignmentHistory: assignment }
    },
    { returnDocument: 'after' }
  );
  if (!result) return res.status(409).json({ error: 'The complaint changed before it could be assigned. Refresh and try again.' });

  await Promise.all([
    createNotification(db, worker._id, 'New Field Task Assigned', `${complaint.id}: ${complaint.category} at ${complaint.location}.`, complaint.id),
    createNotification(db, complaint.userId, 'Complaint Assigned', `${complaint.id} has been assigned to ${department} (${worker.fullName}).`, complaint.id)
  ]);
  return res.json({ complaint: serializeComplaint(result, req.user) });
});

app.patch('/api/data/complaints/:id/status', requireSameOrigin, resolveUser, requireAuthenticatedUser, requireAuthority, async (req, res) => {
  const { status } = req.body || {};
  if (!['Submitted', 'Verified'].includes(status)) {
    return res.status(400).json({ error: 'Only Submitted or Verified can be set directly. Assignment and resolution require the field workflow.' });
  }
  const db = await getDatabase();
  const complaint = await db.collection('complaints').findOne({ id: req.params.id });
  if (!complaint) return res.status(404).json({ error: 'Complaint not found.' });
  const timeline = updateComplaintTimeline(complaint, status, `Status updated to ${status}`);
  const result = await db.collection('complaints').findOneAndUpdate(
    { id: complaint.id, status: { $nin: ['Resolved', 'Evidence Submitted'] } },
    { $set: { status, timeline } },
    { returnDocument: 'after' }
  );
  if (!result) return res.status(409).json({ error: 'The complaint cannot be changed in its current status.' });
  await createNotification(db, complaint.userId, 'Status Updated', `${complaint.id} status updated to: ${status.toUpperCase()}.`, complaint.id);
  return res.json({ complaint: serializeComplaint(result, req.user) });
});

app.patch('/api/data/complaints/:id/resolve', requireSameOrigin, resolveUser, requireAuthenticatedUser, requireAuthority, (_req, res) => (
  res.status(403).json({ error: 'Complaints can only be resolved by approving submitted field-worker evidence.' })
));

app.get('/api/workflow/workers', resolveUser, requireAuthenticatedUser, requireAuthority, async (_req, res) => {
  const workers = await (await getDatabase()).collection('users')
    .find({
      role: { $in: ['worker', 'field_worker'] },
      $or: [
        { approvalStatus: 'APPROVED' },
        { role: 'worker', approvalStatus: { $exists: false } }
      ]
    }, { projection: { fullName: 1, email: 1, department: 1 } })
    .sort({ fullName: 1 })
    .limit(500)
    .toArray();
  return res.json({
    workers: workers.map(({ _id, fullName, email, department }) => ({
      id: _id.toString(), fullName, email, department: department || ''
    }))
  });
});

app.get('/api/workflow/evidence', resolveUser, requireAuthenticatedUser, requireApprovedFieldWorker, async (req, res) => {
  const { complaintId, submissionId, photoId } = req.query;
  if ([complaintId, submissionId, photoId].some((value) => typeof value !== 'string' || value.length > 100)) {
    return res.status(400).json({ error: 'Evidence reference is invalid.' });
  }
  const db = await getDatabase();
  const complaint = await db.collection('complaints').findOne({ id: complaintId });
  if (!complaint) return res.status(404).json({ error: 'Complaint not found.' });
  const submission = (complaint.evidenceSubmissions || []).find((item) => item.id === submissionId);
  const photo = submission?.photos?.find((item) => item.id === photoId);
  if (!submission || !photo) return res.status(404).json({ error: 'Evidence photo not found.' });

  const canView = req.user.role === 'authority' ||
    (isFieldWorker(req.user) && submission.workerId?.toString() === req.user._id.toString()) ||
    (req.user.role === 'citizen' && complaint.userId.equals(req.user._id) &&
      complaint.status === 'Resolved' && submission.status === 'Approved');
  if (!canView) return res.status(403).json({ error: 'You are not allowed to view this evidence.' });

  res.set({
    'Content-Type': photo.contentType,
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  if (/^[a-f0-9]{24}$/i.test(photo.pathname)) {
    const bucket = new GridFSBucket(db, { bucketName: 'evidencePhotos' });
    const fileId = new ObjectId(photo.pathname);
    const file = await bucket.find({ _id: fileId }).next();
    if (
      !file ||
      file.metadata?.complaintId !== complaintId ||
      file.metadata?.workerId !== submission.workerId?.toString() ||
      file.metadata?.contentType !== photo.contentType ||
      file.length !== photo.size
    ) {
      return res.status(404).json({ error: 'Evidence photo is unavailable.' });
    }
    const download = bucket.openDownloadStream(fileId);
    download.on('error', (error) => {
      if (!res.headersSent) res.status(500).end();
      else res.destroy(error);
    });
    return download.pipe(res);
  }

  const blob = await getBlob(photo.pathname);
  if (!blob || blob.statusCode !== 200) return res.status(404).json({ error: 'Evidence photo is unavailable.' });
  return Readable.fromWeb(blob.stream).pipe(res);
});

app.post(
  '/api/workflow/upload',
  requireSameOrigin,
  resolveUser,
  requireAuthenticatedUser,
  requireApprovedFieldWorker,
  express.raw({ type: ['image/jpeg', 'image/png', 'image/webp'], limit: '5mb' }),
  async (req, res) => {
    if (!isFieldWorker(req.user)) return res.status(403).json({ error: 'Only field workers can upload task evidence.' });
    const complaintId = req.query.complaintId;
    const contentType = req.headers['content-type'];
    const fileBytes = req.body;
    if (
      typeof complaintId !== 'string' || !/^CE-\d{4}-\d{6}$/.test(complaintId) ||
      !Buffer.isBuffer(fileBytes) || fileBytes.length < 1 || fileBytes.length > 5 * 1024 * 1024 ||
      !['image/jpeg', 'image/png', 'image/webp'].includes(contentType)
    ) {
      return res.status(400).json({ error: 'Upload a JPEG, PNG, or WebP evidence photo no larger than 5 MB.' });
    }

    const signatureIsValid = contentType === 'image/jpeg'
      ? fileBytes[0] === 0xff && fileBytes[1] === 0xd8 && fileBytes[2] === 0xff
      : contentType === 'image/png'
        ? fileBytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
        : fileBytes.toString('ascii', 0, 4) === 'RIFF' && fileBytes.toString('ascii', 8, 12) === 'WEBP';
    if (!signatureIsValid) {
      return res.status(400).json({ error: 'The selected file does not match its image type.' });
    }

    const db = await getDatabase();
    const complaint = await db.collection('complaints').findOne({
      id: complaintId,
      assignedWorkerId: req.user._id,
      workerTaskStatus: { $in: ['In Progress', 'Rework Required'] }
    });
    if (!complaint) return res.status(409).json({ error: 'This task is not assigned to you or is not ready for evidence.' });

    const photoId = crypto.randomUUID();
    const fileId = new ObjectId();
    const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[contentType];
    const bucket = new GridFSBucket(db, { bucketName: 'evidencePhotos' });
    const upload = bucket.openUploadStreamWithId(fileId, `${photoId}.${extension}`, {
      metadata: {
        complaintId,
        workerId: req.user._id.toString(),
        photoId,
        contentType
      }
    });
    const uploadCompleted = new Promise((resolve, reject) => {
      upload.once('finish', resolve);
      upload.once('error', reject);
    });
    upload.end(fileBytes);
    await uploadCompleted;

    const stillAssigned = await db.collection('complaints').findOne({
      id: complaintId,
      assignedWorkerId: req.user._id,
      workerTaskStatus: { $in: ['In Progress', 'Rework Required'] }
    });
    if (!stillAssigned) {
      await bucket.delete(fileId);
      return res.status(409).json({ error: 'Task assignment changed during upload. Refresh before submitting evidence.' });
    }

    return res.status(201).json({
      id: photoId,
      pathname: fileId.toHexString(),
      contentType,
      size: fileBytes.length
    });
  }
);

app.post('/api/workflow/:action', requireSameOrigin, resolveUser, requireAuthenticatedUser, requireApprovedFieldWorker, async (req, res) => {
  const db = await getDatabase();
  const { action } = req.params;

  if (action === 'start') {
    if (!isFieldWorker(req.user)) return res.status(403).json({ error: 'Only field workers can start assigned tasks.' });
    const { complaintId } = req.body || {};
    const complaint = await db.collection('complaints').findOne({
      id: complaintId,
      assignedWorkerId: req.user._id,
      workerTaskStatus: { $in: ['Assigned', 'Rework Required'] }
    });
    if (!complaint) return res.status(409).json({ error: 'This task is not assigned to you or cannot be started.' });
    const now = new Date();
    const timeline = updateComplaintTimeline(complaint, 'In Progress', `Work started by ${req.user.fullName}`);
    const result = await db.collection('complaints').findOneAndUpdate(
      { _id: complaint._id, assignedWorkerId: req.user._id, workerTaskStatus: complaint.workerTaskStatus },
      { $set: { status: 'In Progress', workerTaskStatus: 'In Progress', workStartedAt: now, timeline } },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(409).json({ error: 'Task changed before work could start. Refresh and try again.' });
    await createNotification(db, complaint.userId, 'Work Started', `Work has started on complaint ${complaint.id}.`, complaint.id);
    return res.json({ complaint: serializeComplaint(result, req.user) });
  }

  if (action === 'submit') {
    if (!isFieldWorker(req.user)) return res.status(403).json({ error: 'Only field workers can submit task evidence.' });
    const { complaintId, note, photos } = req.body || {};
    if (typeof complaintId !== 'string' || typeof note !== 'string' || note.trim().length < 3 || note.length > 2000) {
      return res.status(400).json({ error: 'Enter a completion note between 3 and 2000 characters.' });
    }
    if (!Array.isArray(photos) || photos.length < 1 || photos.length > 5) {
      return res.status(400).json({ error: 'Upload between 1 and 5 completion photos.' });
    }
    const uniquePhotoIds = new Set();
    for (const photo of photos) {
      if (
        !photo || typeof photo.pathname !== 'string' || typeof photo.id !== 'string' ||
        !['image/jpeg', 'image/png', 'image/webp'].includes(photo.contentType) ||
        !Number.isInteger(photo.size) || photo.size < 1 || photo.size > 5 * 1024 * 1024 ||
        !/^[a-f0-9]{24}$/i.test(photo.pathname) ||
        !/^[a-f0-9-]{36}$/.test(photo.id) || uniquePhotoIds.has(photo.id)
      ) {
        return res.status(400).json({ error: 'One or more evidence photo references are invalid.' });
      }
      const storedFile = await new GridFSBucket(db, { bucketName: 'evidencePhotos' })
        .find({ _id: new ObjectId(photo.pathname) })
        .next();
      if (
        !storedFile ||
        storedFile.metadata?.complaintId !== complaintId ||
        storedFile.metadata?.workerId !== req.user._id.toString() ||
        storedFile.metadata?.photoId !== photo.id ||
        storedFile.metadata?.contentType !== photo.contentType ||
        storedFile.length !== photo.size
      ) {
        return res.status(400).json({ error: 'One or more evidence photos are missing or do not belong to this task.' });
      }
      uniquePhotoIds.add(photo.id);
    }
    const complaint = await db.collection('complaints').findOne({
      id: complaintId,
      assignedWorkerId: req.user._id,
      workerTaskStatus: { $in: ['In Progress', 'Rework Required'] }
    });
    if (!complaint) return res.status(409).json({ error: 'This task is not assigned to you or is not ready for evidence.' });
    const submittedAt = new Date();
    const submission = {
      id: crypto.randomUUID(),
      workerId: req.user._id,
      workerName: req.user.fullName,
      note: note.trim(),
      photos: photos.map(({ id, pathname, contentType, size }) => ({ id, pathname, contentType, size })),
      submittedAt,
      status: 'Submitted'
    };
    const timeline = [
      ...(complaint.timeline || []),
      { step: 'Evidence Submitted', status: 'completed', timestamp: formatDateTime(submittedAt), note: 'Completion evidence submitted for authority review' },
      { step: 'Resolved', status: 'upcoming', timestamp: '-', note: 'Awaiting authority approval' }
    ];
    const result = await db.collection('complaints').findOneAndUpdate(
      { _id: complaint._id, assignedWorkerId: req.user._id, workerTaskStatus: complaint.workerTaskStatus },
      {
        $set: { status: 'Evidence Submitted', workerTaskStatus: 'Evidence Submitted', timeline },
        $push: { evidenceSubmissions: submission }
      },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(409).json({ error: 'Task status changed before submission. Refresh and try again.' });
    const authorities = await db.collection('users').find({ role: 'authority' }, { projection: { _id: 1 } }).toArray();
    await Promise.all([
      ...authorities.map((authority) => createNotification(db, authority._id, 'Evidence Ready for Review', `${complaint.id} is awaiting completion evidence review.`, complaint.id)),
      createNotification(db, req.user._id, 'Evidence Submitted', `Your evidence for ${complaint.id} was submitted for approval.`, complaint.id)
    ]);
    return res.status(201).json({ complaint: serializeComplaint(result, req.user) });
  }

  if (action === 'review') {
    if (req.user.role !== 'authority') return res.status(403).json({ error: 'Only municipal authorities can review field evidence.' });
    const { complaintId, decision, reason = '' } = req.body || {};
    if (!['approve', 'reject'].includes(decision)) return res.status(400).json({ error: 'Select approve or reject.' });
    if (decision === 'reject' && (typeof reason !== 'string' || reason.trim().length < 3 || reason.length > 1000)) {
      return res.status(400).json({ error: 'Enter a rejection reason between 3 and 1000 characters.' });
    }
    const complaint = await db.collection('complaints').findOne({ id: complaintId, workerTaskStatus: 'Evidence Submitted' });
    if (!complaint) return res.status(409).json({ error: 'No evidence is currently awaiting review for this complaint.' });
    const submission = [...(complaint.evidenceSubmissions || [])].reverse().find((item) => item.status === 'Submitted');
    if (!submission) return res.status(409).json({ error: 'No pending evidence submission was found.' });

    const now = new Date();
    const approved = decision === 'approve';
    const reviewedSubmission = {
      ...submission,
      status: approved ? 'Approved' : 'Rejected',
      reviewedAt: now,
      reviewedBy: req.user._id,
      reviewerName: req.user.fullName,
      rejectionReason: approved ? '' : reason.trim()
    };
    const evidenceSubmissions = (complaint.evidenceSubmissions || []).map((item) => (
      item.id === submission.id ? reviewedSubmission : item
    ));
    const approvedEvidence = approved
      ? [...(complaint.approvedEvidence || []), reviewedSubmission]
      : complaint.approvedEvidence || [];
    const status = approved ? 'Resolved' : 'Rework Required';
    const timestamp = formatDateTime(now);
    const timeline = [
      ...(complaint.timeline || []).filter((item) => item.step !== 'Resolved' && item.step !== 'Rework Required'),
      ...(approved
        ? [{ step: 'Resolved', status: 'completed', timestamp, note: `Evidence approved by ${req.user.fullName}` }]
        : [{ step: 'Rework Required', status: 'current', timestamp, note: reason.trim() }])
    ];
    if (approved) {
      for (const item of timeline) {
        if (item.step !== 'Resolved' && item.status !== 'upcoming') item.status = 'completed';
      }
    }
    const result = await db.collection('complaints').findOneAndUpdate(
      { _id: complaint._id, workerTaskStatus: 'Evidence Submitted' },
      {
        $set: {
          evidenceSubmissions,
          approvedEvidence,
          workerTaskStatus: approved ? 'Approved' : 'Rework Required',
          status,
          timeline,
          ...(approved ? { resolvedAt: now, resolvedDate: timestamp } : {})
        }
      },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(409).json({ error: 'Evidence was reviewed by another authority. Refresh the task.' });
    await Promise.all([
      createNotification(
        db,
        complaint.userId,
        approved ? 'Issue Resolved' : 'Evidence Rejected',
        approved
          ? `${complaint.id} was resolved after municipal review of field evidence.`
          : `Evidence for ${complaint.id} needs rework: ${reason.trim()}`,
        complaint.id
      ),
      createNotification(
        db,
        complaint.assignedWorkerId,
        approved ? 'Evidence Approved' : 'Rework Required',
        approved ? `Your evidence for ${complaint.id} was approved.` : `Resubmit evidence for ${complaint.id}: ${reason.trim()}`,
        complaint.id
      )
    ]);
    return res.json({ complaint: serializeComplaint(result, req.user) });
  }

  return res.status(404).json({ error: 'Workflow action not found.' });
});

app.patch('/api/data/notifications/read-all', requireSameOrigin, resolveUser, requireAuthenticatedUser, requireApprovedFieldWorker, async (req, res) => {
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

if (isProduction && !process.env.VERCEL) {
  app.use(express.static(path.join(here, 'dist')));
  app.get('/{*splat}', (_req, res) => res.sendFile(path.join(here, 'dist', 'index.html')));
} else if (!process.env.VERCEL) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    configFile: path.join(here, 'vite.config.js'),
    server: { middlewareMode: true, allowedHosts: true, hmr: { server: httpServer } },
    appType: 'spa'
  });
  app.use(vite.middlewares);
}

export default app;

if (!process.env.VERCEL) {
  httpServer.listen(port, isProduction ? '0.0.0.0' : '127.0.0.1', () => {
    console.log(`CivicEye is available at http://localhost:${port}`);
  });
}
