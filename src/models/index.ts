// Type definitions

export interface UserDevice {
  id?: string;                    // Optional: nil when creating, database generates it
  user_id: string;                // Required: foreign key to Users table
  platform: string;               // Required: "iOS", "Android", etc.
  fcm_token: string;              // Required: Firebase Cloud Messaging token (implies permission granted)
  created_at?: string;            // Optional: nil when creating, database sets it
  updated_at?: string;            // Optional: nil when creating, database sets it
}

export interface User {
  id: string;                      // Required: UUID
  created_at?: string;              // Optional: nil when creating, database sets it
  updated_at?: string;              // Optional: nil when creating, database sets it
  push_notifications_enabled: boolean; // Required: Default to false (opt-in)
}

export interface Subscription {
  id?: string;                     // Optional: nil when creating, database generates it
  user_id: string;                 // Required: foreign key to Users table
  entitlement_id?: string;          // Optional: RevenueCat entitlement identifier (e.g., "pro", "premium")
  renews_at?: string;              // Optional: When subscription auto-renews
  canceled_at?: string;            // Optional: When subscription was canceled (nil if active)
  created_at?: string;             // Optional: nil when creating, database sets it
  updated_at?: string;             // Optional: nil when creating, database sets it
  device_id?: string;              // Optional: foreign key to User_Devices table
  is_subscribed: boolean;          // Required: Quick check for active subscription
  expires_at?: string;             // Optional: When subscription expires
}

export interface NotificationRequest {
  token: string;
  title?: string;
  body?: string;
  data?: Record<string, string>;
}

export interface BroadcastNotificationRequest {
  title: string;
  body: string;
  data?: Record<string, string>;
  onlyEnabled?: boolean;
}


