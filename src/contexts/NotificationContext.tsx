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
  const [lastCheckTime, setLastCheckTime] = useState<Date>(new Date());

  // Real-time bildirishnomalar yaratish
  useEffect(() => {
    const checkForNotifications = () => {
      const now = new Date();
      
      // Tugab qolgan mahsulotlar tekshiruvi
      const lowStockProducts = products.filter(p => p.quantity <= p.min_quantity);
      
      // Eski tugab qolgan bildirishnomalarni o'chirish
      setNotifications(prev => prev.filter(n => 
        !(n.type === 'warning' && n.title.includes('Tugab qolgan'))
      ));
      
      // Yangi tugab qolgan mahsulotlar uchun bildirishnoma
      if (lowStockProducts.length > 0) {
        lowStockProducts.forEach(product => {
          const existingNotification = notifications.find(n => 
            n.type === 'warning' && 
            n.title.includes('Tugab qolgan') && 
            n.message.includes(product.name)
          );
          
          if (!existingNotification) {
            addNotification({
              type: 'warning',
              title: 'Tugab qolgan mahsulot',
              message: `${product.name} - ${product.quantity} ta qoldi (min: ${product.min_quantity} ta)`,
              action: {
                label: 'Ko\'rish',
                onClick: () => {
                  // Mahsulotlar sahifasiga o'tish
                  window.location.hash = '#products';
                }
              }
            });
          }
        });
      }

      // Bugungi yangi savdolar uchun bildirishnoma
      const today = new Date().toDateString();
      const todaysSales = sales.filter(sale => 
        new Date(sale.created_at).toDateString() === today
      );

      if (todaysSales.length > 0) {
        const lastNotification = notifications.find(n => 
          n.type === 'success' && 
          n.title.includes('Yangi savdo') &&
          new Date(n.timestamp).toDateString() === today
        );

        if (!lastNotification) {
          addNotification({
            type: 'success',
            title: 'Yangi savdo',
            message: `Bugun ${todaysSales.length} ta savdo amalga oshirildi`,
            action: {
              label: 'Ko\'rish',
              onClick: () => {
                window.location.hash = '#sales';
              }
            }
          });
        }
      }

      // Yangi mijozlar uchun bildirishnoma
      const recentCustomers = customers.filter(customer => {
        const customerDate = new Date(customer.created_at);
        return customerDate > lastCheckTime;
      });

      if (recentCustomers.length > 0) {
        recentCustomers.forEach(customer => {
          addNotification({
            type: 'info',
            title: 'Yangi mijoz',
            message: `${customer.name} ro'yxatga qo'shildi`,
            action: {
              label: 'Ko\'rish',
              onClick: () => {
                window.location.hash = '#customers';
              }
            }
          });
        });
      }

      setLastCheckTime(now);
    };

    // Har 30 soniyada tekshirish
    const interval = setInterval(checkForNotifications, 30000);

    // Dastlabki tekshirish
    checkForNotifications();

    return () => clearInterval(interval);
  }, [products, sales, customers, lastCheckTime]);

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
