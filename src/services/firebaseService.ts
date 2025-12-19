import { messaging, firebaseAdmin } from '../config/firebase';
import { NotificationRequest, BroadcastNotificationRequest } from '../models';

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
      return app.options.projectId || 
        (process.env.FIREBASE_SERVICE_ACCOUNT ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT).project_id : undefined);
    } catch (error) {
      return undefined;
    }
  }
};


