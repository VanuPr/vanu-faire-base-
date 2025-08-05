import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Helper function to parse the private key
function parsePrivateKey(key?: string) {
    if (!key) {
        return undefined;
    }
    // Vercel escapes newlines in environment variables, so we need to replace them back
    return key.replace(/\\n/g, '\n');
}

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: parsePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
};

let adminApp: App;

if (!getApps().length) {
  if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
    try {
        adminApp = initializeApp({
          credential: cert(serviceAccount)
        });
    } catch (error: any) {
        // Throw a more specific error if parsing fails
        if (error.code === 'app/invalid-credential' || error.message.includes('PEM')) {
            console.error('Failed to parse private key. Please ensure FIREBASE_PRIVATE_KEY in your .env file is correct and properly formatted.');
            throw new Error('Failed to parse private key. Please ensure FIREBASE_PRIVATE_KEY in your .env file is correct and properly formatted.');
        }
        throw error;
    }
  } else {
    console.warn("Firebase Admin SDK credentials are not fully configured in .env file. Server-side features will not work.");
  }
} else {
  adminApp = getApps()[0];
}

const auth = adminApp! ? getAuth(adminApp) : null;
const db = adminApp! ? getFirestore(adminApp) : null;

export { adminApp, auth, db };
