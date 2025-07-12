import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '@/services/api';
import { toast } from '@/hooks/use-toast';
import ENV from '@/utils/env';

interface Notification {
  id: string;
  type: 'answer' | 'comment' | 'vote' | 'accept';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
  relatedType?: 'question' | 'answer';
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io(ENV.WS_URL, {
        auth: {
          token: localStorage.getItem('auth_token'), // Use consistent key with API service
        },
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('Connected to notification server');
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Disconnected from notification server');
      });

      newSocket.on('notification', (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
        
        // Show toast for new notifications
        toast({
          title: notification.title,
          description: notification.message,
        });
      });

      setSocket(newSocket);
      
      // Load existing notifications
      refreshNotifications();

      return () => {
        newSocket.close();
      };
    } else {
      // Clear notifications when logged out
      setNotifications([]);
      setIsConnected(false);
    }
  }, [isAuthenticated, user]);

  const refreshNotifications = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await api.notifications.getAll();
      const { notifications: notificationsData, unreadCount: count } = response.data;
      setNotifications(notificationsData || []);
      // Note: unreadCount is calculated from the notifications array
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.notifications.markAsRead(id);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};