import supabase from '../config/supabase';
import { UserDevice, User, Subscription } from '../models';

// User Device Service
export const userDeviceService = {
  async getAll(): Promise<UserDevice[]> {
    const { data, error } = await supabase
      .from('User_Devices')
      .select('*');

    if (error) {
      throw error;
    }

    return data || [];
  },

  async getById(id: string): Promise<UserDevice> {
    const { data, error } = await supabase
      .from('User_Devices')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async getByUserId(userId: string): Promise<UserDevice[]> {
    const { data, error } = await supabase
      .from('User_Devices')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return data || [];
  },

  async create(deviceData: Partial<UserDevice>): Promise<UserDevice> {
    const { data, error } = await supabase
      .from('User_Devices')
      .insert(deviceData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async update(id: string, deviceData: Partial<UserDevice>): Promise<UserDevice> {
    const { data, error } = await supabase
      .from('User_Devices')
      .update(deviceData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async getFcmTokensByUserIds(userIds: string[]): Promise<string[]> {
    const { data, error } = await supabase
      .from('User_Devices')
      .select('fcm_token')
      .in('user_id', userIds);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data
      .map((device: { fcm_token: string }) => device.fcm_token)
      .filter((token: string): token is string => !!token && token.trim() !== '');
  }
};

// User Service
export const userService = {
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('Users')
      .select('*');

    if (error) {
      throw error;
    }

    return data || [];
  },

  async getById(id: string): Promise<User> {
    const { data, error } = await supabase
      .from('Users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async create(userData: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('Users')
      .insert(userData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async update(id: string, userData: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('Users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async getAllIds(): Promise<string[]> {
    const { data, error } = await supabase
      .from('Users')
      .select('id');

    if (error) {
      throw error;
    }

    return (data || []).map((user: { id: string }) => user.id);
  }
};

// Subscription Service
export const subscriptionService = {
  async getAll(): Promise<Subscription[]> {
    const { data, error } = await supabase
      .from('Subscriptions')
      .select('*');

    if (error) {
      throw error;
    }

    return data || [];
  },

  async getById(id: string): Promise<Subscription> {
    const { data, error } = await supabase
      .from('Subscriptions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async getByUserId(userId: string): Promise<Subscription[]> {
    const { data, error } = await supabase
      .from('Subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return data || [];
  },

  async create(subscriptionData: Partial<Subscription>): Promise<Subscription> {
    const { data, error } = await supabase
      .from('Subscriptions')
      .insert(subscriptionData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
};


