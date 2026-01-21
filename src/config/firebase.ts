import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

// Initialize Firebase Admin
if (!admin.apps.length) {
  let credential: admin.credential.Credential;
  let projectId: string | undefined;
  let serviceAccount: admin.ServiceAccount;
  
  // Priority 1: FIREBASE_SERVICE_ACCOUNT environment variable (for Render/production)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccountData = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      serviceAccount = serviceAccountData as admin.ServiceAccount;
      credential = admin.credential.cert(serviceAccount);
      // Handle both projectId (camelCase) and project_id (snake_case)
      projectId = (serviceAccountData as any).project_id || serviceAccount.projectId || process.env.FIREBASE_PROJECT_ID;
      console.log('[Firebase] Initialized using FIREBASE_SERVICE_ACCOUNT environment variable');
    } catch (error) {
      console.error('[Firebase] Error parsing FIREBASE_SERVICE_ACCOUNT:', error);
      throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT environment variable');
    }
  }
  // Priority 2: GOOGLE_APPLICATION_CREDENTIALS file path
  else if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    const serviceAccountData = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    serviceAccount = serviceAccountData as admin.ServiceAccount;
    credential = admin.credential.cert(serviceAccount);
    // Handle both projectId (camelCase) and project_id (snake_case)
    projectId = (serviceAccountData as any).project_id || serviceAccount.projectId || process.env.FIREBASE_PROJECT_ID;
    console.log('[Firebase] Initialized using service account file from GOOGLE_APPLICATION_CREDENTIALS');
  } 
  // Priority 3: Fallback to local service account file (for local development)
  else {
    const serviceAccountPath = path.join(__dirname, '../../config/clean-sweep-ai-31cac-firebase-adminsdk-fbsvc-48072db267.json');
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccountData = require(serviceAccountPath);
      serviceAccount = serviceAccountData as admin.ServiceAccount;
      credential = admin.credential.cert(serviceAccount);
      // Handle both projectId (camelCase) and project_id (snake_case)
      projectId = (serviceAccountData as any).project_id || serviceAccount.projectId || process.env.FIREBASE_PROJECT_ID;
      console.log('[Firebase] Initialized using local service account file');
    } else {
      throw new Error(
        'Firebase service account not found. ' +
        'Provide FIREBASE_SERVICE_ACCOUNT environment variable ' +
        'or place the JSON file in the config directory.'
      );
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

