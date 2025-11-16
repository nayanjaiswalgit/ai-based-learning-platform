'use client';

import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth'; // Assume this hook provides user authentication

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  data?: any;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAuth(); // Get current user

  // Initialize Socket.io connection
  useEffect(() => {
    if (!user?.id) return;

    const newSocket = io(process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL || 'http://localhost:3005', {
      path: '/notifications',
      auth: {
        userId: user.id,
      },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to notification server');
    });

    newSocket.on('connected', (data) => {
      console.log('🔔 Notification connection established:', data);
    });

    newSocket.on('new-notification', (notification: Notification) => {
      console.log('📨 New notification received:', notification);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show browser notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/icon-192x192.png',
        });
      }
    });

    newSocket.on('unread-count-updated', ({ unreadCount: newCount }) => {
      console.log('📊 Unread count updated:', newCount);
      setUnreadCount(newCount);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from notification server');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?.id]);

  // Fetch initial notifications
  useEffect(() => {
    if (!user?.id) return;

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/notifications/user/${user.id}?limit=50`,
        );
        const data = await response.json();

        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user?.id]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!user?.id) return;

      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/notifications/${notificationId}/read/${user.id}`,
          {
            method: 'PATCH',
          },
        );

        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n,
          ),
        );
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    },
    [user?.id],
  );

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/mark-all-read/${user.id}`,
        {
          method: 'PATCH',
        },
      );

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true })),
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, [user?.id]);

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      if (!user?.id) return;

      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/notifications/${notificationId}/${user.id}`,
          {
            method: 'DELETE',
          },
        );

        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      } catch (error) {
        console.error('Failed to delete notification:', error);
      }
    },
    [user?.id],
  );

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    socket,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    requestNotificationPermission,
  };
}
