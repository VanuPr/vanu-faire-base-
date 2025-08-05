'use server';

import { auth, db } from '@/lib/firebase-admin';

async function getUserProfile(uid: string, email?: string) {
    if (!db || !email) return null;

    let collectionName = '';
    if (email.endsWith('@distvanu.in')) {
        collectionName = 'district_coordinators';
    } else if (email.endsWith('@blckvanu.in')) {
        collectionName = 'block_coordinators';
    } else if (email.endsWith('@panvanu.in')) {
        collectionName = 'panchayat_coordinators';
    }

    if (!collectionName) return null;

    try {
        const docRef = db.collection(collectionName).doc(uid);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            return docSnap.data();
        }
        return null;
    } catch (error) {
        console.error(`Error fetching profile for user ${uid} from ${collectionName}:`, error);
        return null;
    }
}


export async function listAllUsers() {
  if (!auth) {
    console.error('Firebase Admin SDK not initialized.');
    throw new Error('Firebase Admin SDK is not configured. Please check your .env file.');
  }
  try {
    const userRecords = await auth.listUsers();
    
    const usersWithProfiles = await Promise.all(
        userRecords.users.map(async (user) => {
            const profile = await getUserProfile(user.uid, user.email);
            return {
                uid: user.uid,
                email: user.email,
                name: (profile as any)?.name || user.email?.split('@')[0] || 'N/A',
                disabled: user.disabled,
                lastSignInTime: user.metadata.lastSignInTime,
                creationTime: user.metadata.creationTime,
            };
        })
    );

    return usersWithProfiles;
  } catch (error) {
    console.error('Error listing users:', error);
    if ((error as any).code === 'auth/invalid-credential') {
        throw new Error('Firebase Admin SDK credentials are invalid. Please check your .env file.');
    }
    if ((error as any).message?.includes('PEM')) {
        throw new Error('Failed to parse private key from Firebase Admin SDK. Please ensure FIREBASE_PRIVATE_KEY in your .env file is correct.');
    }
    throw new Error('Failed to list users from Firebase Authentication.');
  }
}

export async function updateUserStatus(uid: string, disabled: boolean) {
    if (!auth) {
      console.error('Firebase Admin SDK not initialized.');
      throw new Error('Failed to update user status. Admin SDK not configured.');
    }
    try {
        await auth.updateUser(uid, { disabled });
        return { success: true };
    } catch (error) {
        console.error('Error updating user status:', error);
        throw new Error('Failed to update user status.');
    }
}

export async function deleteUser(uid: string) {
    if (!auth) {
        console.error('Firebase Admin SDK not initialized.');
        throw new Error('Failed to delete user. Admin SDK not configured.');
    }
    try {
        await auth.deleteUser(uid);
        return { success: true };
    } catch (error) {
        console.error('Error deleting user:', error);
        throw new Error('Failed to delete user.');
    }
}
