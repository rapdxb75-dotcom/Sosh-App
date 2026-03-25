import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { useSelector } from "react-redux";
import storageService from "../services/storage";
import { RootState } from "../store/store";

export type NotificationType = "success" | "error" | "neutral";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
}

interface NotificationContextType {
  isVisible: boolean;
  notifications: Notification[];
  showNotifications: () => void;
  hideNotifications: () => void;
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp">,
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  markAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Track login state to clear notifications on logout
  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);
  const wasLoggedInRef = useRef(false);

  const showNotifications = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hideNotifications = useCallback(() => setIsVisible(false), []);

  // Load notifications from storage on mount
  useEffect(() => {
    const loadNotifications = async () => {
      const stored = await storageService.getNotifications();
      if (stored.length > 0) {
        setNotifications(stored);
      }
      const storedUnread = await storageService.getUnreadCount();
      setUnreadCount(storedUnread || 0);
    };
    loadNotifications();
  }, []);

  // Clear notifications when user logs out
  useEffect(() => {
    if (isLoggedIn) {
      wasLoggedInRef.current = true;
    } else if (wasLoggedInRef.current) {
      // User was logged in and is now logged out
      setNotifications([]);
      setUnreadCount(0);
      storageService.setNotifications([]);
      storageService.setUnreadCount(0);
      wasLoggedInRef.current = false; // Reset ref
    }
  }, [isLoggedIn]);

  const addNotification = useCallback(
    (newNotification: Omit<Notification, "id" | "timestamp">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const notificationWithId: Notification = {
        ...newNotification,
        id,
        timestamp: new Date(),
      };

      setNotifications((prev) => {
        const updated = [notificationWithId, ...prev];
        storageService.setNotifications(updated);
        return updated;
      });

      setUnreadCount((count) => {
        const updated = count + 1;
        storageService.setUnreadCount(updated);
        return updated;
      });
    },
    [],
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      storageService.setNotifications(updated);
      return updated;
    });
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    storageService.setNotifications([]);
    storageService.setUnreadCount(0);
  }, []);

  const markAsRead = useCallback(() => {
    setUnreadCount(0);
    storageService.setUnreadCount(0);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        isVisible,
        notifications,
        unreadCount,
        showNotifications,
        hideNotifications,
        addNotification,
        removeNotification,
        clearNotifications,
        markAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
}
