import { MongoClient, type Collection, type Db } from "mongodb";

import { ensureMongoDbSchema } from "./mongodb-schema.server";

const globalForMongo = globalThis as typeof globalThis & {
  __mongoClientPromise?: Promise<MongoClient>;
};

export function isMongoConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI?.trim());
}

export function getMongoDbName(): string {
  return process.env.MONGODB_DB?.trim() || "inta_portal";
}

function getClientPromise(): Promise<MongoClient> | null {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) return null;
  if (!globalForMongo.__mongoClientPromise) {
    const client = new MongoClient(uri);
    globalForMongo.__mongoClientPromise = client.connect();
  }
  return globalForMongo.__mongoClientPromise;
}

export async function getMongoDb(): Promise<Db | null> {
  const p = getClientPromise();
  if (!p) return null;
  const client = await p;
  const db = client.db(getMongoDbName());
  await ensureMongoDbSchema(db);
  return db;
}

export async function getCollection<T extends object>(
  name: string,
): Promise<Collection<T> | null> {
  const db = await getMongoDb();
  return db ? db.collection<T>(name) : null;
}
