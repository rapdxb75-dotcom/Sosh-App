import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "user_token";
const USERNAME_KEY = "user_name";
const PROFILE_PICTURE_KEY = "profile_picture";
const NOTIFICATIONS_KEY = "app_notifications";
const UNREAD_NOTIFICATIONS_COUNT_KEY = "app_unread_notifications_count";
const EMAIL_KEY = "user_email";
const HAS_LAUNCHED_KEY = "has_launched";
const SUBSCRIPTION_KEY = "subscription"; // Matching the string user uses in userSlice.ts

const storageService = {
  /**
   * Save token to storage
   */
  setToken: async (token: string) => {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error("Error saving token", error);
    }
  },

  /**
   * Get token from storage
   */
  getToken: async () => {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error("Error getting token", error);
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
      console.error("Error saving username", error);
    }
  },

  /**
   * Get username from storage
   */
  getUsername: async () => {
    try {
      return await AsyncStorage.getItem(USERNAME_KEY);
    } catch (error) {
      console.error("Error getting username", error);
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
      console.error("Error saving profile picture", error);
    }
  },

  /**
   * Get profile picture from storage
   */
  getProfilePicture: async () => {
    try {
      return await AsyncStorage.getItem(PROFILE_PICTURE_KEY);
    } catch (error) {
      console.error("Error getting profile picture", error);
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
      console.error("Error saving email", error);
    }
  },

  /**
   * Get email from storage
   */
  getEmail: async () => {
    try {
      return await AsyncStorage.getItem(EMAIL_KEY);
    } catch (error) {
      console.error("Error getting email", error);
      return null;
    }
  },

  /**
   * Save notifications to storage
   */
  setNotifications: async (notifications: any[]) => {
    try {
      await AsyncStorage.setItem(
        NOTIFICATIONS_KEY,
        JSON.stringify(notifications),
      );
    } catch (error) {
      console.error("Error saving notifications", error);
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
        timestamp: new Date(notif.timestamp),
      }));
    } catch (error) {
      console.error("Error getting notifications", error);
      return [];
    }
  },

  /**
   * Save unread count to storage
   */
  setUnreadCount: async (count: number) => {
    try {
      await AsyncStorage.setItem(
        UNREAD_NOTIFICATIONS_COUNT_KEY,
        count.toString(),
      );
    } catch (error) {
      console.error("Error saving unread count", error);
    }
  },

  /**
   * Get unread count from storage
   */
  getUnreadCount: async () => {
    try {
      const count = await AsyncStorage.getItem(UNREAD_NOTIFICATIONS_COUNT_KEY);
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      console.error("Error getting unread count", error);
      return 0;
    }
  },

  /**
   * Set if the app has launched before
   */
  setHasLaunched: async (value: boolean) => {
    try {
      await AsyncStorage.setItem(HAS_LAUNCHED_KEY, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving launch status", error);
    }
  },

  /**
   * Get if the app has launched before
   */
  getHasLaunched: async () => {
    try {
      const value = await AsyncStorage.getItem(HAS_LAUNCHED_KEY);
      return value !== null ? JSON.parse(value) : false;
    } catch (error) {
      console.error("Error getting launch status", error);
      return false;
    }
  },

  /**
   * Set a value in storage
   */
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error saving ${key}`, error);
    }
  },

  /**
   * Get a value from storage
   */
  getItem: async (key: string) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting ${key}`, error);
      return null;
    }
  },

  /**
   * Remove everything from storage (logout)
   */
  logout: async () => {
    try {
      await AsyncStorage.multiRemove([
        TOKEN_KEY,
        USERNAME_KEY,
        PROFILE_PICTURE_KEY,
        NOTIFICATIONS_KEY,
        UNREAD_NOTIFICATIONS_COUNT_KEY,
        EMAIL_KEY,
        SUBSCRIPTION_KEY,
      ]);
    } catch (error) {
      console.error("Error removing auth data", error);
    }
  },

  SUBSCRIPTION_KEY,
};

export default storageService;
