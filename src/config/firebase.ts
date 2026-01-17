import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

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
  const serviceAccountPath = path.join(__dirname, '../../config/clean-sweep-ai-31cac-firebase-adminsdk-fbsvc-48072db267.json');
  
  if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = require(serviceAccountPath) as admin.ServiceAccount;
  } else {
    throw new Error(
      'Firebase service account not found. ' +
      'Provide FIREBASE_SERVICE_ACCOUNT environment variable ' +
      'or place the JSON file in the root directory.'
    );
  }
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

