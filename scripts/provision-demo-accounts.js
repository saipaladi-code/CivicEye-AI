import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';
import { ensureAuthCollections } from '../db/authSchema.js';
import { calculatePriorityScore } from '../src/utils/priorityEngine.js';

const accountDefinitions = [
  {
    role: 'authority',
    emailKey: 'DEMO_AUTHORITY_EMAIL',
    passwordKey: 'DEMO_AUTHORITY_PASSWORD',
    fullName: 'CivicEye Demo Authority'
  },
  {
    role: 'citizen',
    emailKey: 'DEMO_CITIZEN_EMAIL',
    passwordKey: 'DEMO_CITIZEN_PASSWORD',
    fullName: 'CivicEye Demo Citizen'
  },
  {
    role: 'field_worker',
    emailKey: 'DEMO_FIELD_WORKER_EMAIL',
    passwordKey: 'DEMO_FIELD_WORKER_PASSWORD',
    fullName: 'CivicEye Demo Field Worker'
  }
];
const authorityOnly = process.argv.includes('--authority-only');
const authorityWorkerOnly = process.argv.includes('--authority-worker-only');
const requestedAccounts = authorityOnly
  ? accountDefinitions.filter(({ role }) => role === 'authority')
  : authorityWorkerOnly
    ? accountDefinitions.filter(({ role }) => ['authority', 'field_worker'].includes(role))
    : accountDefinitions;

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri || mongoUri.includes('<') || mongoUri.includes('>')) {
  fail('Set a complete MONGODB_URI in the private server-side .env file before provisioning demo accounts.');
}

const accountInputs = requestedAccounts.map((definition) => ({
  ...definition,
  email: process.env[definition.emailKey]?.trim().toLowerCase(),
  password: process.env[definition.passwordKey]
}));
if (accountInputs.some(({ email, password }) => (
  !email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
  typeof password !== 'string' || password.length < 8 || password.length > 128
))) {
  fail(`Set valid server-side demo emails and passwords (8-128 characters) for the ${requestedAccounts.map(({ role }) => role).join(' and ')} demo role${requestedAccounts.length > 1 ? 's' : ''}.`);
}
if (new Set(accountInputs.map(({ email }) => email)).size !== accountInputs.length) {
  fail('Each demo role must use a different email address.');
}

const client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 15000 });
try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB_NAME || 'civiceye');
  await db.command({ ping: 1 });
  await ensureAuthCollections(db);

  const users = db.collection('users');
  const currentAccounts = await Promise.all(accountInputs.map(({ email }) => users.findOne({ email })));
  const conflictingAccount = currentAccounts.find((existing, index) => (
    existing && (
      !existing.demoAccount ||
      existing.role !== accountInputs[index].role
    )
  ));
  if (conflictingAccount) {
    throw new Error('A configured demo email belongs to a non-demo or different-role account; no account was changed.');
  }

  const provisionAccount = async (definition, extraFields = {}) => {
    const { email, password, role, fullName } = definition;
    const existing = await users.findOne({ email });
    if (existing && (!existing.demoAccount || existing.role !== role)) {
      throw new Error(`The configured ${role} demo email belongs to a non-demo or different-role account; no account was changed.`);
    }

    const now = new Date();
    const fields = {
      fullName,
      email,
      mobile: '',
      passwordHash: await bcrypt.hash(password, 12),
      role,
      demoAccount: true,
      ...extraFields
    };
    const unsetFields = role === 'field_worker'
      ? {}
      : {
          department: '',
          employeeId: '',
          workLocation: '',
          approvalStatus: '',
          applicationStatus: '',
          approvedBy: '',
          approvedAt: '',
          rejectionReason: '',
          adminMessage: '',
          profileProof: ''
        };
    const result = await users.updateOne(
      { email },
      {
        $set: fields,
        $setOnInsert: { createdAt: now },
        ...(Object.keys(unsetFields).length ? { $unset: unsetFields } : {})
      },
      { upsert: true }
    );
    const user = await users.findOne({ email }, { projection: { _id: 1 } });
    if (!user?._id || (!result.matchedCount && !result.upsertedCount)) {
      throw new Error(`Could not provision the ${role} demo account.`);
    }
    return user;
  };

  const authority = await provisionAccount(accountInputs[0], {
    authorityApprovedAt: new Date()
  });
  if (authorityOnly) {
    console.log('Authority demo account provisioned. Run npm run demo:setup after configuring citizen and field-worker credentials to add the sample workflow.');
  } else if (authorityWorkerOnly) {
    const workerDefinition = accountInputs.find(({ role }) => role === 'field_worker');
    await provisionAccount(workerDefinition, {
      department: 'Road Maintenance',
      employeeId: 'DEMO-WORKER-001',
      workLocation: 'CivicEye Demo Zone',
      approvalStatus: 'APPROVED',
      applicationStatus: 'APPROVED',
      approvedBy: authority._id,
      approvedAt: new Date(),
      authorityApprovedAt: new Date(),
      rejectionReason: '',
      adminMessage: ''
    });
    console.log('Authority and approved field-worker demo accounts provisioned. Run npm run demo:setup after configuring an unused citizen demo email to seed the sample complaint.');
  } else {
    const citizen = await provisionAccount(accountInputs.find(({ role }) => role === 'citizen'));
    const worker = await provisionAccount(accountInputs.find(({ role }) => role === 'field_worker'), {
      department: 'Road Maintenance',
      employeeId: 'DEMO-WORKER-001',
      workLocation: 'CivicEye Demo Zone',
      approvalStatus: 'APPROVED',
      applicationStatus: 'APPROVED',
      approvedBy: authority._id,
      approvedAt: new Date(),
      authorityApprovedAt: new Date(),
      rejectionReason: '',
      adminMessage: ''
    });

    const complaints = db.collection('complaints');
    const now = new Date();
    const dateText = now.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    const priority = calculatePriorityScore({
      severity: 'High',
      duplicateCount: 0,
      publicImpact: 'High',
      isHighTraffic: true
    });
    const existingComplaint = await complaints.findOne({ demoSeedKey: 'civiceye-demo-assigned-complaint-v1' });
    if (existingComplaint && (
      existingComplaint.demoData !== true ||
      !existingComplaint.userId.equals(citizen._id) ||
      !existingComplaint.assignedWorkerId?.equals(worker._id)
    )) {
      throw new Error('The demo seed key is attached to a different complaint; no complaint was changed.');
    }
    let complaintId = existingComplaint?.id;
    if (!complaintId) {
      const sequence = await db.collection('counters').findOneAndUpdate(
        { _id: 'complaints' },
        { $inc: { value: 1 } },
        { upsert: true, returnDocument: 'after' }
      );
      complaintId = `CE-${now.getFullYear()}-${String(sequence.value).padStart(6, '0')}`;
    }

    const assignmentInstructions = 'DEMO SAMPLE: Inspect the marked road section and review the evidence workflow.';
    const assignmentDeadline = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    await complaints.updateOne(
      { demoSeedKey: 'civiceye-demo-assigned-complaint-v1' },
      {
        $set: {
          id: complaintId,
          demoSeedKey: 'civiceye-demo-assigned-complaint-v1',
          demoData: true,
          userId: citizen._id,
          citizenName: 'CivicEye Demo Citizen',
          category: 'Pothole',
          imageUrl: '',
          resolutionImageUrl: null,
          location: 'Demo Zone - Central Avenue',
          coordinates: { lat: 12.9716, lng: 77.5946 },
          description: 'DEMO SAMPLE: A simulated pothole report for exploring citizen tracking, field assignment, and authority review.',
          severity: 'High',
          confidence: 96,
          duplicateCount: 0,
          priorityScore: priority.total,
          status: 'Assigned',
          department: 'Road Maintenance',
          worker: 'CivicEye Demo Field Worker',
          createdDate: dateText,
          expectedResolution: '3 days',
          resolvedDate: null,
          publicImpact: 'High',
          isHighTraffic: true,
          breakdown: priority.breakdown,
          assignedWorkerId: worker._id,
          assignmentInstructions,
          assignmentDeadline,
          assignedAt: now,
          workerTaskStatus: 'Assigned',
          evidenceSubmissions: [],
          approvedEvidence: [],
          assignmentHistory: [{
            workerId: worker._id,
            workerName: 'CivicEye Demo Field Worker',
            department: 'Road Maintenance',
            instructions: assignmentInstructions,
            deadline: assignmentDeadline,
            assignedAt: now,
            assignedBy: authority._id
          }],
          timeline: [
            { step: 'Report Submitted', status: 'completed', timestamp: dateText, note: 'DEMO SAMPLE: Simulated complaint created.' },
            { step: 'AI Verified', status: 'completed', timestamp: dateText, note: 'Demo sample classification.' },
            { step: 'Priority Generated', status: 'completed', timestamp: dateText, note: `Score: ${priority.total}/100 (${priority.level})` },
            { step: 'Assigned', status: 'completed', timestamp: dateText, note: 'Assigned to the approved demo field worker.' },
            { step: 'In Progress', status: 'upcoming', timestamp: '-', note: '-' },
            { step: 'Resolved', status: 'upcoming', timestamp: '-', note: 'Awaiting demo workflow actions.' }
          ],
          createdAt: existingComplaint?.createdAt || now
        },
        $unset: { resolvedAt: '', workStartedAt: '' }
      },
      { upsert: true }
    );

    console.log('Demo citizen, approved field worker, scoped authority, and assigned sample complaint are ready.');
  }
} catch (error) {
  console.error(`Could not provision demo accounts (${error.name || 'Error'}). Check server-side MongoDB settings and demo account configuration.`);
  process.exitCode = 1;
} finally {
  await client.close();
}
