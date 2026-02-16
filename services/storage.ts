import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'user_token';
const USERNAME_KEY = 'user_name';
const PROFILE_PICTURE_KEY = 'profile_picture';
const NOTIFICATIONS_KEY = 'app_notifications';
const EMAIL_KEY = 'user_email';

const storageService = {
    /**
     * Save token to storage
     */
    setToken: async (token: string) => {
        try {
            await AsyncStorage.setItem(TOKEN_KEY, token);
        } catch (error) {
            console.error('Error saving token', error);
        }
    },

    /**
     * Get token from storage
     */
    getToken: async () => {
        try {
            return await AsyncStorage.getItem(TOKEN_KEY);
        } catch (error) {
            console.error('Error getting token', error);
            return null;
        }
    },

    /**
     * Save username to storage
     */
    setUsername: async (username: string) => {
        try {
            await AsyncStorage.setItem(USERNAME_KEY, username);
        } catch (error) {
            console.error('Error saving username', error);
        }
    },

    /**
     * Get username from storage
     */
    getUsername: async () => {
        try {
            return await AsyncStorage.getItem(USERNAME_KEY);
        } catch (error) {
            console.error('Error getting username', error);
            return null;
        }
    },

    /**
     * Save profile picture to storage
     */
    setProfilePicture: async (base64: string) => {
        try {
            await AsyncStorage.setItem(PROFILE_PICTURE_KEY, base64);
        } catch (error) {
            console.error('Error saving profile picture', error);
        }
    },

    /**
     * Get profile picture from storage
     */
    getProfilePicture: async () => {
        try {
            return await AsyncStorage.getItem(PROFILE_PICTURE_KEY);
        } catch (error) {
            console.error('Error getting profile picture', error);
            return null;
        }
    },

    /**
     * Save email to storage
     */
    setEmail: async (email: string) => {
        try {
            await AsyncStorage.setItem(EMAIL_KEY, email);
        } catch (error) {
            console.error('Error saving email', error);
        }
    },

    /**
     * Get email from storage
     */
    getEmail: async () => {
        try {
            return await AsyncStorage.getItem(EMAIL_KEY);
        } catch (error) {
            console.error('Error getting email', error);
            return null;
        }
    },

    /**
     * Save notifications to storage
     */
    setNotifications: async (notifications: any[]) => {
        try {
            await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
        } catch (error) {
            console.error('Error saving notifications', error);
        }
    },

    /**
     * Get notifications from storage
     */
    getNotifications: async () => {
        try {
            const data = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
            if (!data) return [];
            const parsed = JSON.parse(data);
            // Convert timestamp strings back to Date objects
            return parsed.map((notif: any) => ({
                ...notif,
                timestamp: new Date(notif.timestamp)
            }));
        } catch (error) {
            console.error('Error getting notifications', error);
            return [];
        }
    },

    /**
     * Remove everything from storage (logout)
     */
    logout: async () => {
        try {
            await AsyncStorage.multiRemove([TOKEN_KEY, USERNAME_KEY, PROFILE_PICTURE_KEY, NOTIFICATIONS_KEY]);
        } catch (error) {
            console.error('Error removing auth data', error);
        }
    }
};

export default storageService;
