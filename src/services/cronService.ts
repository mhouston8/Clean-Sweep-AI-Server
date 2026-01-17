import * as cron from 'node-cron';
import { userService } from './supabaseService';
import { userDeviceService } from './supabaseService';
import { firebaseService } from './firebaseService';

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
 * Initialize and start all cron jobs
 */
export function startCronJobs(): void {
  // Schedule: Run every 5 seconds
  // Format: second minute hour day month day-of-week
  // '*/5 * * * * *' = Every 5 seconds
  cron.schedule('*/5 * * * * *', async () => {
    await sendNotificationToNonSubscribedUsers();
  });

  console.log('[Cron Jobs] Scheduled: Notification to non-subscribed users every 5 seconds');
}

