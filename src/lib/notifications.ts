import { supabase } from '@/integrations/supabase/client';

export interface NotificationData {
  id?: string;
  user_id?: string;
  applicant_id?: string;
  title: string;
  message: string;
  type: 'application' | 'interview' | 'hiring' | 'status_update';
  is_read?: boolean;
  created_at?: string;
}

/**
 * Create a notification for a user
 */
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: 'application' | 'interview' | 'hiring' | 'status_update',
  applicantId?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      applicant_id: applicantId || null,
      title,
      message,
      type,
    });

    if (error) {
      console.error('Failed to create notification:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error creating notification:', err);
    return false;
  }
};

/**
 * Get unread notifications for a user
 */
export const getUnreadNotifications = async (): Promise<NotificationData[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch unread notifications:', error);
      return [];
    }

    return (data || []) as unknown as NotificationData[];
  } catch (err) {
    console.error('Error fetching notifications:', err);
    return [];
  }
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error marking notification as read:', err);
    return false;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false);

    if (error) {
      console.error('Failed to mark all notifications as read:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    return false;
  }
};

/**
 * Get all notifications for a user
 */
export const getAllNotifications = async (): Promise<NotificationData[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }

    return (data || []) as unknown as NotificationData[];
  } catch (err) {
    console.error('Error fetching notifications:', err);
    return [];
  }
};
