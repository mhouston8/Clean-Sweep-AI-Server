import { Request, Response } from 'express';
import { NotificationRequest, BroadcastNotificationRequest } from '../models';
import { firebaseService } from '../services/firebaseService';
import { userService } from '../services/supabaseService';
import { userDeviceService } from '../services/supabaseService';

export const notificationController = {
  // Test Firebase connection
  testFirebase: (req: Request, res: Response) => {
    try {
      const projectId = firebaseService.getProjectId();
      
      res.json({ 
        success: true, 
        message: 'Firebase Admin is initialized',
        projectId: projectId || 'Not available'
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: 'Firebase not properly initialized',
        details: error.message 
      });
    }
  },

  // Send notification to single device
  sendNotification: async (req: Request<{}, {}, NotificationRequest>, res: Response) => {
    try {
      const messageId = await firebaseService.sendNotification(req.body);
      res.json({ success: true, messageId });
    } catch (error: any) {
      console.error('Error sending notification:', error);
      res.status(500).json({ error: 'Failed to send notification', details: error.message });
    }
  },

  // Send notification to all users
  sendNotificationToAll: async (req: Request<{}, {}, BroadcastNotificationRequest>, res: Response) => {
    try {
      const { title, body, data } = req.body;

      if (!title || !body) {
        return res.status(400).json({ error: 'Title and body are required' });
      }

      // Get all user IDs
      const userIds = await userService.getAllIds();

      if (userIds.length === 0) {
        return res.json({ 
          success: true, 
          message: 'No users found to send notifications to',
          sentCount: 0 
        });
      }

      // Get all device tokens for these users
      const tokens = await userDeviceService.getFcmTokensByUserIds(userIds);

      if (tokens.length === 0) {
        return res.json({ 
          success: true, 
          message: 'No valid device tokens found',
          sentCount: 0 
        });
      }

      // Send notifications
      const response = await firebaseService.sendNotificationToAll({ title, body, data }, tokens);
      
      res.json({ 
        success: true, 
        sentCount: response.successCount,
        failedCount: response.failureCount,
        totalTokens: tokens.length,
        responses: response.responses
      });
    } catch (error: any) {
      console.error('Error sending notifications to all users:', error);
      res.status(500).json({ error: 'Failed to send notifications', details: error.message });
    }
  }
};


