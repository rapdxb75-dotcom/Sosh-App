import { createContext, ReactNode, useContext, useState } from 'react';

interface NotificationContextType {
    isVisible: boolean;
    showNotifications: () => void;
    hideNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [isVisible, setIsVisible] = useState(false);

    const showNotifications = () => setIsVisible(true);
    const hideNotifications = () => setIsVisible(false);

    return (
        <NotificationContext.Provider value={{ isVisible, showNotifications, hideNotifications }}>
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
