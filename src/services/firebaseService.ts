import { messaging, firebaseAdmin } from '../config/firebase';
import { NotificationRequest, BroadcastNotificationRequest } from '../models';
import * as fs from 'fs';

export const firebaseService = {
  async sendNotification(request: NotificationRequest): Promise<string> {
    const { token, title, body, data } = request;

    if (!token) {
      throw new Error('Device token is required');
    }

    const message = {
      notification: {
        title: title || 'Notification',
        body: body || 'You have a new notification'
      },
      data: data || {},
      token: token
    };

    return await messaging.send(message);
  },

  async sendNotificationToAll(request: BroadcastNotificationRequest, tokens: string[]): Promise<any> {
    const { title, body, data } = request;

    if (tokens.length === 0) {
      return {
        successCount: 0,
        failureCount: 0,
        responses: []
      };
    }

    const message = {
      notification: {
        title: title,
        body: body
      },
      data: data || {},
      tokens: tokens
    };

    return await messaging.sendEachForMulticast(message);
  },

  getProjectId(): string | undefined {
    try {
      const app = firebaseAdmin.app();
      
      // Try app.options.projectId first
      if (app.options.projectId) {
        return app.options.projectId;
      }
      
      // Try environment variable
      if (process.env.FIREBASE_PROJECT_ID) {
        return process.env.FIREBASE_PROJECT_ID;
      }
      
      // Try reading from service account file if GOOGLE_APPLICATION_CREDENTIALS is set
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        try {
          const serviceAccount = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'));
          if (serviceAccount.project_id) {
            return serviceAccount.project_id;
          }
        } catch (error) {
          // File read failed, continue to next option
        }
      }
      
      // Try FIREBASE_SERVICE_ACCOUNT environment variable
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
          const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
          if (serviceAccount.project_id) {
            return serviceAccount.project_id;
          }
        } catch (error) {
          // Parse failed, continue
        }
      }
      
      return undefined;
    } catch (error) {
      return undefined;
    }
  }
};


