import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import storageService from '../services/storage';
import { RootState } from '../store/store';

export type NotificationType = 'success' | 'error' | 'neutral';

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
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [isVisible, setIsVisible] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Track login state to clear notifications on logout
    const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);
    const wasLoggedInRef = useRef(false);

    const showNotifications = useCallback(() => setIsVisible(true), []);
    const hideNotifications = useCallback(() => setIsVisible(false), []);

    // Load notifications from storage on mount
    useEffect(() => {
        const loadNotifications = async () => {
            const stored = await storageService.getNotifications();
            if (stored.length > 0) {
                setNotifications(stored);
            }
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
            storageService.setNotifications([]);
            wasLoggedInRef.current = false; // Reset ref
        }
    }, [isLoggedIn]);

    const addNotification = useCallback((newNotification: Omit<Notification, 'id' | 'timestamp'>) => {
        const id = Math.random().toString(36).substring(2, 9);
        const notificationWithId: Notification = {
            ...newNotification,
            id,
            timestamp: new Date()
        };

        setNotifications(prev => {
            const updated = [notificationWithId, ...prev];
            storageService.setNotifications(updated);
            return updated;
        });
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => {
            const updated = prev.filter(n => n.id !== id);
            storageService.setNotifications(updated);
            return updated;
        });
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
        storageService.setNotifications([]);
    }, []);

    return (
        <NotificationContext.Provider value={{
            isVisible,
            notifications,
            showNotifications,
            hideNotifications,
            addNotification,
            removeNotification,
            clearNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}
