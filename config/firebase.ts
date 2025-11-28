import * as admin from 'firebase-admin';

// Get Firebase service account from environment variable (Render) or file (local)
let serviceAccount: admin.ServiceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Read from environment variable (for Render/production deployment)
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (error) {
    console.error('Error parsing FIREBASE_SERVICE_ACCOUNT from environment variable:', error);
    throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT environment variable');
  }
} else {
  // Read from file (for local development)
  serviceAccount = require('../mobile-ai-storage-cleaner-firebase-adminsdk-fbsvc-3dc69c8622.json') as admin.ServiceAccount;
}

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

// Export admin instance and messaging helper
export const firebaseAdmin = admin;
export const messaging = admin.messaging();

