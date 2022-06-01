import { createContext, ReactNode, useContext, useRef, useState } from 'react';
import { Notification } from 'src/shared/interfaces';

interface ContextState {
  notifications: Notification[];
  add: (notification: Omit<Notification, 'id'>) => void;
}

const NotificationContext = createContext({} as ContextState);

const NotificationContextProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationsRef = useRef<Notification[]>([]);

  const add = (notification: Omit<Notification, 'id'>) => {
    const id = new Date().toISOString();
    notificationsRef.current = [{ ...notification, id }, ...notificationsRef.current];
    setNotifications([...notificationsRef.current]);
    setTimeout(() => {
      notificationsRef.current = [
        ...notificationsRef.current.filter(
          (n) => !(n.id === id && n.type === notification.type && n.text === notification.text),
        ),
      ];
      setNotifications([...notificationsRef.current]);
    }, 3300);
  };
  return <NotificationContext.Provider value={{ notifications, add }}>{children}</NotificationContext.Provider>;
};

export const useNotificationContext = () => useContext(NotificationContext);

export default NotificationContextProvider;
