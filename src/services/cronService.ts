import * as cron from 'node-cron';
import { userService } from './supabaseService';
import { userDeviceService } from './supabaseService';
import { firebaseService } from './firebaseService';
import * as https from 'https';
import * as http from 'http';

/**
 * Send push notifications to all non-subscribed users
 */
async function sendNotificationToNonSubscribedUsers(): Promise<void> {
  try {
    console.log('[Cron Job] Starting notification to non-subscribed users...');
    
    // Get all non-subscribed users
    const nonSubscribedUsers = await userService.getNotSubscribed();
    
    if (nonSubscribedUsers.length === 0) {
      console.log('[Cron Job] No non-subscribed users found');
      return;
    }

    console.log(`[Cron Job] Found ${nonSubscribedUsers.length} non-subscribed users`);

    // Get user IDs
    const userIds = nonSubscribedUsers.map(user => user.id);

    // Get all device tokens for these users
    const tokens = await userDeviceService.getFcmTokensByUserIds(userIds);

    if (tokens.length === 0) {
      console.log('[Cron Job] No valid device tokens found for non-subscribed users');
      return;
    }

    console.log(`[Cron Job] Sending notifications to ${tokens.length} devices`);

    // Send notifications
    const title = 'Upgrade to Premium';
    const body = 'Unlock premium features and get the most out of the app!';
    const data = {
      type: 'subscription_prompt',
      action: 'upgrade'
    };

    const response = await firebaseService.sendNotificationToAll(
      { title, body, data },
      tokens
    );

    console.log(`[Cron Job] Notifications sent - Success: ${response.successCount}, Failed: ${response.failureCount}`);
  } catch (error: any) {
    console.error('[Cron Job] Error sending notifications to non-subscribed users:', error);
  }
}

/**
 * Ping health endpoint to keep the service alive (prevent Render from sleeping)
 */
async function pingHealthEndpoint(): Promise<void> {
  try {
    // Get the service URL from environment variable or construct it
    const serviceUrl = process.env.RENDER_SERVICE_URL || 
                       process.env.SERVICE_URL || 
                       `http://localhost:${process.env.PORT || 3000}`;
    
    const healthUrl = `${serviceUrl}/health`;
    
    console.log(`[Health Ping] Pinging ${healthUrl}...`);
    
    const url = new URL(healthUrl);
    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.get(healthUrl, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`[Health Ping] Success - Status: ${res.statusCode}`);
      });
    });
    
    req.on('error', (error) => {
      console.error('[Health Ping] Error:', error.message);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      console.error('[Health Ping] Request timeout');
    });
  } catch (error: any) {
    console.error('[Health Ping] Error pinging health endpoint:', error.message);
  }
}

/**
 * Initialize and start all cron jobs
 */
export function startCronJobs(): void {
  // Schedule: Run every 30 minutes
  // Format: second minute hour day month day-of-week
  // '0 */30 * * * *' = Every 30 minutes (at :00 and :30)
  cron.schedule('0 */30 * * * *', async () => {
    await sendNotificationToNonSubscribedUsers();
  });

  // Schedule: Ping health endpoint every 10 minutes to keep service alive
  // This prevents Render free tier from sleeping
  cron.schedule('*/10 * * * *', async () => {
    await pingHealthEndpoint();
  });

  console.log('[Cron Jobs] Scheduled: Notification to non-subscribed users every 30 minutes');
  console.log('[Cron Jobs] Scheduled: Health ping every 10 minutes');
}

