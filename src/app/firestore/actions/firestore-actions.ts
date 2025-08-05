'use server';

import { db } from '@/lib/firebase-admin';

export async function listRootCollections() {
  if (!db) {
    console.error('Firebase Admin SDK not initialized.');
    throw new Error('Firebase Admin SDK is not configured. Please check your .env file.');
  }
  try {
    const collections = await db.listCollections();
    const collectionIds = collections.map(col => col.id);
    return collectionIds;
  } catch (error) {
    console.error('Error listing collections:', error);
    throw new Error('Failed to list Firestore collections.');
  }
}
