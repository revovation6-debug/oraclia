import React, { useState, useEffect } from 'react';
import type { Notification } from '../types';
import { InfoIcon, AlertTriangleIcon, XIcon } from './Icons';

interface NotificationToastProps {
  notification: Notification;
  onDismiss: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Allow time for fade-out animation before calling onDismiss
      setTimeout(onDismiss, 300);
    }, 4700); // Slightly less than the parent timeout to ensure it fades out

    return () => clearTimeout(timer);
  }, [onDismiss]);
  
  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  const icons = {
    info: <InfoIcon className="w-6 h-6 text-blue-500" />,
    warning: <AlertTriangleIcon className="w-6 h-6 text-yellow-500" />,
  };

  const borderColors = {
      info: 'border-blue-500',
      warning: 'border-yellow-500',
  }

  return (
    <div
      className={`relative w-full max-w-sm p-4 my-2 overflow-hidden rounded-lg shadow-lg bg-brand-bg-white dark:bg-dark-bg-secondary border-l-4 ${borderColors[notification.type]} transform transition-all duration-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {icons[notification.type]}
        </div>
        <div className="ml-3 w-0 flex-1 pt-0.5">
          <p className="text-sm font-medium text-brand-text-dark dark:text-dark-text-primary">
            {notification.message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button onClick={handleDismiss} className="inline-flex text-gray-400 dark:text-dark-text-secondary rounded-md hover:text-brand-text-dark dark:hover:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg-white dark:focus:ring-offset-dark-bg-secondary focus:ring-brand-primary">
            <span className="sr-only">Close</span>
            <XIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};


interface NotificationContainerProps {
    notifications: Notification[];
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications }) => {
    const [notificationList, setNotificationList] = useState<Notification[]>([]);

    useEffect(() => {
        setNotificationList(notifications);
    }, [notifications]);
    
    const handleDismiss = (id: number) => {
        setNotificationList(current => current.filter(n => n.id !== id));
    };
    
    return (
        <div className="fixed inset-0 flex items-end justify-end px-4 py-6 pointer-events-none sm:p-6 z-[100]">
            <div className="w-full max-w-sm">
                {notificationList.map((notification) => (
                    <NotificationToast 
                        key={notification.id}
                        notification={notification}
                        onDismiss={() => handleDismiss(notification.id)}
                    />
                ))}
            </div>
        </div>
    );
};