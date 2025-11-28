import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { messaging, firebaseAdmin } from './config/firebase';
import supabase from './config/supabase';

const app = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

// Type definitions
interface UserDevice {
  id: string;
  user_id: string;
  platform: string;
  fcm_token: string;
  updated_at: string;
  created_at: string;
}

interface User {
  id: string;
  push_notifications_enabled?: boolean;
  [key: string]: any;
}

interface NotificationRequest {
  token: string;
  title?: string;
  body?: string;
  data?: Record<string, string>;
}

interface BroadcastNotificationRequest {
  title: string;
  body: string;
  data?: Record<string, string>;
  onlyEnabled?: boolean;
}

// Simple function to fetch all User_Devices
async function getAllUserDevices(): Promise<UserDevice[]> {
  try {
    const { data, error } = await supabase
      .from('User_Devices')
      .select('*');

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching user devices:', error);
    throw error;
  }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Express server is running!' });
});

// Test Firebase connection
app.get('/test/firebase', (req: Request, res: Response) => {
  try {
    // Get project info from Firebase Admin
    const app = firebaseAdmin.app();
    const projectId = app.options.projectId || 
      (process.env.FIREBASE_SERVICE_ACCOUNT ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT).project_id : 'Not available');
    
    res.json({ 
      success: true, 
      message: 'Firebase Admin is initialized',
      projectId: projectId
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      error: 'Firebase not properly initialized',
      details: error.message 
    });
  }
});

// Push notification endpoint (single device)
app.post('/send-notification', async (req: Request<{}, {}, NotificationRequest>, res: Response) => {
  try {
    const { token, title, body, data } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Device token is required' });
    }

    const message = {
      notification: {
        title: title || 'Notification',
        body: body || 'You have a new notification'
      },
      data: data || {},
      token: token
    };

    const response = await messaging.send(message);
    res.json({ success: true, messageId: response });
  } catch (error: any) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification', details: error.message });
  }
});

// Send notification to all users
app.post('/send-notification/all', async (req: Request<{}, {}, BroadcastNotificationRequest>, res: Response) => {
  try {
    const { title, body, data } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    // Get all users with push notifications enabled (if onlyEnabled is true)
    let usersQuery = supabase.from('Users').select('id');

    const { data: users, error: usersError } = await usersQuery;

    if (usersError) {
      throw usersError;
    }

    if (!users || users.length === 0) {
      return res.json({ 
        success: true, 
        message: 'No users found to send notifications to',
        sentCount: 0 
      });
    }

    const userIds = users.map((user: User) => user.id);

    // Get all device tokens for these users
    const { data: devices, error: devicesError } = await supabase
      .from('User_Devices')
      .select('fcm_token')
      .in('user_id', userIds);

    if (devicesError) {
      throw devicesError;
    }

    if (!devices || devices.length === 0) {
      return res.json({ 
        success: true, 
        message: 'No device tokens found',
        sentCount: 0 
      });
    }

    // Extract tokens from fcm_token field
    const tokens: string[] = devices
      .map((device: { fcm_token: string }) => device.fcm_token)
      .filter((token: string): token is string => !!token && token.trim() !== '');

    if (tokens.length === 0) {
      return res.json({ 
        success: true, 
        message: 'No valid device tokens found',
        sentCount: 0 
      });
    }

    // Send notifications to all tokens using multicast
    const message = {
      notification: {
        title: title,
        body: body
      },
      data: data || {},
      tokens: tokens
    };

    const response = await messaging.sendEachForMulticast(message);
    
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
});

// ==================== USERS ENDPOINTS ====================

// Get all users
app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('Users')
      .select('*');

    if (error) {
      throw error;
    }

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('Users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user', details: error.message });
  }
});

// Create new user
app.post('/api/users', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('Users')
      .insert(req.body)
      .select();

    if (error) {
      throw error;
    }

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user', details: error.message });
  }
});

// Update user
app.put('/api/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('Users')
      .update(req.body)
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user', details: error.message });
  }
});

// ==================== SUBSCRIPTIONS ENDPOINTS ====================

// Get all subscriptions
app.get('/api/subscriptions', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('Subscriptions')
      .select('*');

    if (error) {
      throw error;
    }

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions', details: error.message });
  }
});

// Get subscription by ID
app.get('/api/subscriptions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('Subscriptions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription', details: error.message });
  }
});

// Get subscriptions by user ID
app.get('/api/subscriptions/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('Subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching user subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch user subscriptions', details: error.message });
  }
});

// Create new subscription
app.post('/api/subscriptions', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('Subscriptions')
      .insert(req.body)
      .select();

    if (error) {
      throw error;
    }

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription', details: error.message });
  }
});

// ==================== USER_DEVICES ENDPOINTS ====================

// Get all user devices
app.get('/api/user-devices', async (req: Request, res: Response) => {
  try {
    const data = await getAllUserDevices();
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching user devices:', error);
    res.status(500).json({ error: 'Failed to fetch user devices', details: error.message });
  }
});

// Get device by ID
app.get('/api/user-devices/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('User_Devices')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching device:', error);
    res.status(500).json({ error: 'Failed to fetch device', details: error.message });
  }
});

// Get devices by user ID
app.get('/api/user-devices/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('User_Devices')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching user devices:', error);
    res.status(500).json({ error: 'Failed to fetch user devices', details: error.message });
  }
});

// Create new user device
app.post('/api/user-devices', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('User_Devices')
      .insert(req.body)
      .select();

    if (error) {
      throw error;
    }

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error creating user device:', error);
    res.status(500).json({ error: 'Failed to create user device', details: error.message });
  }
});

// Update user device
app.put('/api/user-devices/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('User_Devices')
      .update(req.body)
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error updating user device:', error);
    res.status(500).json({ error: 'Failed to update user device', details: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

