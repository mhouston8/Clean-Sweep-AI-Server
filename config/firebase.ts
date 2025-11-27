import * as admin from 'firebase-admin';
import serviceAccount from '../mobile-ai-storage-cleaner-firebase-adminsdk-fbsvc-3dc69c8622.json';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
  });
}

// Export admin instance and messaging helper
export const firebaseAdmin = admin;
export const messaging = admin.messaging();

