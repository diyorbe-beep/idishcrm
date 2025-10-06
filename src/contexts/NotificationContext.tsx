import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useData } from './DataContext';

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { products, sales, customers } = useData();

  // Real-time bildirishnomalar yaratish - soddalashtirilgan versiya
  useEffect(() => {
    const checkForNotifications = () => {
      // Tugab qolgan mahsulotlar tekshiruvi
      const lowStockProducts = products.filter(p => p.quantity <= p.min_quantity);
      
      if (lowStockProducts.length > 0) {
        setNotifications(prev => {
          const existingLowStock = prev.filter(n => 
            n.type === 'warning' && n.title.includes('Tugab qolgan')
          );
          
          if (existingLowStock.length === 0) {
            return [...prev, {
              id: 'low-stock-' + Date.now(),
              type: 'warning' as const,
              title: 'Tugab qolgan mahsulotlar',
              message: `${lowStockProducts.length} ta mahsulot tugab qolgan`,
              timestamp: new Date(),
              read: false,
              action: {
                label: 'Ko\'rish',
                onClick: () => {
                  window.location.hash = '#products';
                }
              }
            }];
          }
          return prev;
        });
      }

      // Bugungi savdolar uchun bildirishnoma
      const today = new Date().toDateString();
      const todaysSales = sales.filter(sale => 
        new Date(sale.created_at).toDateString() === today
      );

      if (todaysSales.length > 0) {
        setNotifications(prev => {
          const existingSales = prev.find(n => 
            n.type === 'success' && n.title.includes('Yangi savdo')
          );
          
          if (!existingSales) {
            return [...prev, {
              id: 'todays-sales-' + Date.now(),
              type: 'success' as const,
              title: 'Yangi savdo',
              message: `Bugun ${todaysSales.length} ta savdo amalga oshirildi`,
              timestamp: new Date(),
              read: false,
              action: {
                label: 'Ko\'rish',
                onClick: () => {
                  window.location.hash = '#sales';
                }
              }
            }];
          }
          return prev;
        });
      }
    };

    // Har 60 soniyada tekshirish (kamroq tez-tez)
    const interval = setInterval(checkForNotifications, 60000);

    // Dastlabki tekshirish
    checkForNotifications();

    return () => clearInterval(interval);
  }, [products, sales, customers]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Maksimal 50 ta bildirishnoma
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      addNotification,
      removeNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
