'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: string;
  createdAt: Date;
  isEdited: boolean;
  attachments?: any[];
  replyTo?: any;
}

interface TypingUser {
  userId: string;
  name: string;
}

export function useMessaging(conversationId: string, userId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const { user } = useAuth();

  // Initialize Socket.io connection for messaging
  useEffect(() => {
    if (!userId) return;

    const newSocket = io(
      process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL || 'http://localhost:3005',
      {
        path: '/messaging',
        auth: {
          userId,
        },
        transports: ['websocket', 'polling'],
      }
    );

    newSocket.on('connect', () => {
      console.log('✅ Connected to messaging server');
      // Join conversation room
      newSocket.emit('join-conversation', { conversationId });
    });

    newSocket.on('new-message', (message: Message) => {
      console.log('📨 New message received:', message);
      if (message.conversationId === conversationId) {
        setMessages((prev) => [...prev, message]);

        // Mark as read if user is active
        if (document.hasFocus() && message.senderId !== userId) {
          markAsRead(message.id);
        }
      }
    });

    newSocket.on('message-edited', (message: Message) => {
      console.log('✏️ Message edited:', message);
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? message : m))
      );
    });

    newSocket.on('message-deleted', ({ messageId }) => {
      console.log('🗑️ Message deleted:', messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    });

    newSocket.on('user-typing', ({ userId: typingUserId, userName }) => {
      console.log('⌨️ User typing:', userName);
      setTypingUsers((prev) => {
        if (prev.some((u) => u.userId === typingUserId)) return prev;
        return [...prev, { userId: typingUserId, name: userName }];
      });
    });

    newSocket.on('user-stopped-typing', ({ userId: typingUserId }) => {
      console.log('⏸️ User stopped typing');
      setTypingUsers((prev) => prev.filter((u) => u.userId !== typingUserId));
    });

    newSocket.on('message-read', ({ messageId, userId: readerId }) => {
      console.log('👁️ Message read by:', readerId);
      // Update read status in UI if needed
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave-conversation', { conversationId });
      newSocket.disconnect();
    };
  }, [conversationId, userId]);

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/messaging/conversations/${conversationId}/messages?limit=100`
        );
        const data = await response.json();
        setMessages(data.reverse()); // Reverse to show oldest first
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId]);

  const sendMessage = useCallback(
    async (data: {
      content: string;
      replyToId?: string;
      attachments?: any[];
    }) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/messaging/messages`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              conversationId,
              senderId: userId,
              content: data.content,
              replyToId: data.replyToId,
              attachments: data.attachments,
            }),
          }
        );

        const message = await response.json();
        return message;
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    },
    [conversationId, userId]
  );

  const editMessage = useCallback(
    async (messageId: string, newContent: string) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/messaging/messages/${messageId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId,
              content: newContent,
            }),
          }
        );

        return await response.json();
      } catch (error) {
        console.error('Failed to edit message:', error);
      }
    },
    [userId]
  );

  const deleteMessage = useCallback(
    async (messageId: string) => {
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/messaging/messages/${messageId}/${userId}`,
          {
            method: 'DELETE',
          }
        );
      } catch (error) {
        console.error('Failed to delete message:', error);
      }
    },
    [userId]
  );

  const markAsRead = useCallback(
    async (messageId: string) => {
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/messaging/messages/${messageId}/read`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
          }
        );
      } catch (error) {
        console.error('Failed to mark message as read:', error);
      }
    },
    [userId]
  );

  const startTyping = useCallback(() => {
    if (socket) {
      socket.emit('typing-start', {
        conversationId,
        userId,
        userName: user?.name || 'User',
      });
    }
  }, [socket, conversationId, userId, user]);

  const stopTyping = useCallback(() => {
    if (socket) {
      socket.emit('typing-stop', {
        conversationId,
        userId,
      });
    }
  }, [socket, conversationId, userId]);

  return {
    messages,
    unreadCount,
    loading,
    socket,
    typingUsers,
    sendMessage,
    editMessage,
    deleteMessage,
    markAsRead,
    startTyping,
    stopTyping,
  };
}
