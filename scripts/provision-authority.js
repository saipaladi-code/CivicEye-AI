import 'dotenv/config';
import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';
import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';

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
if (!uri) {
  console.error('MONGODB_URI is not configured. Add it to the private server-side .env file first.');
  process.exit(1);
}

const prompt = createInterface({ input: stdin, output: stdout });
let fullName;
let email;
try {
  fullName = (await prompt.question('Approved municipal officer full name: ')).trim();
  email = (await prompt.question('Approved municipal email address: ')).trim().toLowerCase();
} finally {
  prompt.close();
}

if (fullName.length < 2 || fullName.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Enter a valid full name and email address.');
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
  const users = db.collection('users');
  await users.createIndex({ email: 1 }, { unique: true });
  await users.updateOne(
    { email },
    {
      $set: {
        fullName,
        email,
        mobile: '',
        passwordHash: await bcrypt.hash(password, 12),
        role: 'authority',
        authorityApprovedAt: new Date()
      },
      $setOnInsert: { createdAt: new Date() }
    },
    { upsert: true }
  );
  console.log(`Authority account provisioned for ${email}.`);
} catch (error) {
  console.error(`Could not provision the authority account (${error.name || 'Error'}). Check MongoDB configuration and access.`);
  process.exitCode = 1;
} finally {
  await client.close();
  password = '';
  passwordConfirmation = '';
}
