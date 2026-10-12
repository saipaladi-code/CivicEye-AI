import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { ensureAuthCollections } from '../db/authSchema.js';

const uri = process.env.MONGODB_URI;
if (!uri || uri.includes('<') || uri.includes('>')) {
  console.error('Set a complete MONGODB_URI in the private .env file before setting up Atlas.');
  process.exit(1);
}

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });
try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB_NAME || 'civiceye');
  await db.command({ ping: 1 });
  const collections = await ensureAuthCollections(db);
  console.log(`MongoDB authentication collections are ready in database "${db.databaseName}":`);
  for (const collection of collections) {
    console.log(`- ${collection.name}: ${collection.indexes.join(', ')}`);
  }
} catch (error) {
  console.error(`Could not create authentication collections (${error.name || 'Error'}). Check Atlas access and database configuration.`);
  process.exitCode = 1;
} finally {
  await client.close();
}
