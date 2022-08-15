import { createContext, ReactNode, useContext, useState } from 'react';
import { Notification } from 'src/shared/interfaces';

interface ContextState {
  notifications: Notification[];
  add: (notification: Omit<Notification, 'id'>) => void;
}

const NotificationContext = createContext({} as ContextState);

const NotificationContextProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const add = (notification: Omit<Notification, 'id'>) => {
    const id = new Date().toISOString();
    setNotifications((prev) => [{ ...notification, id }, ...prev]);
    setTimeout(() => {
      setNotifications((prev) =>
        prev.filter((n) => !(n.id === id && n.type === notification.type && n.text === notification.text)),
      );
    }, 3300);
  };

  return <NotificationContext.Provider value={{ notifications, add }}>{children}</NotificationContext.Provider>;
};

export const useNotificationContext = () => useContext(NotificationContext);

export default NotificationContextProvider;
