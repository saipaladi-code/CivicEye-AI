import 'dotenv/config';
import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';
import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';
import { ensureAuthCollections } from '../db/authSchema.js';

const askHidden = (prompt) => new Promise((resolve, reject) => {
  if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') {
    reject(new Error('Run this command in an interactive terminal so the password can be hidden.'));
    return;
  }

  stdout.write(prompt);
  stdin.setRawMode(true);
  stdin.resume();
  let value = '';
  const restoreTerminal = () => {
    stdin.setRawMode(false);
    stdin.pause();
    stdin.removeListener('data', onData);
    stdout.write('\n');
  };
  const onData = (chunk) => {
    const input = chunk.toString('utf8');
    if (input === '\u0003') {
      restoreTerminal();
      reject(new Error('Authority provisioning cancelled.'));
      return;
    }
    if (input === '\r' || input === '\n') {
      restoreTerminal();
      resolve(value);
      return;
    }
    if (input === '\u007f' || input === '\b') {
      value = value.slice(0, -1);
      return;
    }
    if (input.length === 1 && input >= ' ') value += input;
  };
  stdin.on('data', onData);
});

const uri = process.env.MONGODB_URI;
const role = process.argv.includes('--worker') ? 'worker' : 'authority';
const roleLabel = role === 'worker' ? 'field worker' : 'municipal officer';
if (!uri) {
  console.error('MONGODB_URI is not configured. Add it to the private server-side .env file first.');
  process.exit(1);
}

const prompt = createInterface({ input: stdin, output: stdout });
let fullName;
let email;
let department = '';
try {
  fullName = (await prompt.question(`Approved ${roleLabel} full name: `)).trim();
  email = (await prompt.question(`Approved ${roleLabel} email address: `)).trim().toLowerCase();
  if (role === 'worker') {
    department = (await prompt.question('Worker department: ')).trim();
  }
} finally {
  prompt.close();
}

if (
  fullName.length < 2 || fullName.length > 100 ||
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
  (role === 'worker' && (!department || department.length > 100))
) {
  console.error(`Enter a valid full name, ${roleLabel} email, and department if required.`);
  process.exit(1);
}

let password;
let passwordConfirmation;
try {
  password = await askHidden('Set the initial password (hidden): ');
  passwordConfirmation = await askHidden('Confirm the initial password (hidden): ');
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

if (password.length < 8 || password.length > 128 || password !== passwordConfirmation) {
  console.error('Passwords must match and be between 8 and 128 characters.');
  process.exit(1);
}

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB_NAME || 'civiceye');
  await ensureAuthCollections(db);
  const users = db.collection('users');
  const emailIndex = (await users.listIndexes().toArray()).find((index) => (
    Object.keys(index.key).length === 1 && index.key.email === 1
  ));
  if (!emailIndex) {
    await users.createIndex({ email: 1 }, { name: 'email_1', unique: true });
  } else if (!emailIndex.unique) {
    throw new Error('The users email index must enforce unique email addresses.');
  }
  await users.updateOne(
    { email },
    {
      $set: {
        fullName,
        email,
        mobile: '',
        passwordHash: await bcrypt.hash(password, 12),
        role,
        ...(role === 'authority'
          ? { authorityApprovedAt: new Date() }
          : { department })
      },
      ...(role === 'authority' ? { $unset: { department: '' } } : {}),
      $setOnInsert: { createdAt: new Date() }
    },
    { upsert: true }
  );
  console.log(`${roleLabel[0].toUpperCase()}${roleLabel.slice(1)} account provisioned for ${email}.`);
} catch (error) {
  console.error(`Could not provision the ${roleLabel} account (${error.name || 'Error'}). Check MongoDB configuration and access.`);
  process.exitCode = 1;
} finally {
  await client.close();
  password = '';
  passwordConfirmation = '';
}
