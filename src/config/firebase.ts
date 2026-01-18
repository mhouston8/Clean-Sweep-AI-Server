import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

// Initialize Firebase Admin
if (!admin.apps.length) {
  let credential: admin.credential.Credential;
  let projectId: string | undefined;
  
  // Try GOOGLE_APPLICATION_CREDENTIALS first
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    credential = admin.credential.cert(serviceAccount);
    projectId = serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID;
    console.log('[Firebase] Initialized using service account file from GOOGLE_APPLICATION_CREDENTIALS');
  } 
  // Fallback to local service account file
  else {
    const serviceAccountPath = path.join(__dirname, '../../config/clean-sweep-ai-31cac-firebase-adminsdk-fbsvc-48072db267.json');
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = require(serviceAccountPath);
      credential = admin.credential.cert(serviceAccount);
      projectId = serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID;
      console.log('[Firebase] Initialized using local service account file');
    } else {
      throw new Error('Firebase service account file not found');
    }
  }
  
  admin.initializeApp({
    credential: credential,
    projectId: projectId,
  });
  console.log('[Firebase] Project ID:', projectId || 'Not set');
}

// Export admin instance and messaging helper
export const firebaseAdmin = admin;
export const messaging = admin.messaging();

