import storageService from "../storage";
import apiClient from "./client";

export interface UpdateProfilePayload {
  userName?: string;
  profilePicture?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message?: string;
  user?: any;
}

export interface SocialMediaConnectResponse {
  url: string;
}

const userService = {
  /**
   * Update user FCM token with the backend
   * @param fcmToken FCM token to sync
   */
  updateFcmToken: async (fcmToken: string) => {
    try {
      const response = await apiClient.post("/updateFcmToken", { fcmToken });
      return response.data;
    } catch (error) {
      console.error("Update FCM Token API Error:", error);
      throw error;
    }
  },

  /**
   * Update user profile details
   * @param payload UpdateProfilePayload
   * @returns Promise<UpdateProfileResponse>
   */
  updateProfile: async (payload: UpdateProfilePayload) => {
    try {
      const token = await storageService.getToken();
      const response = await apiClient.post<UpdateProfileResponse>(
        "/updateUserDetail",
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (error) {
      console.error("Update Profile API Error:", error);
      throw error;
    }
  },

  /**
   * Connect social media platform
   * @param email User email
   * @param token JWT token
   * @param platform Platform name (instagram, facebook, tiktok, etc.)
   * @returns Promise<SocialMediaConnectResponse>
   */
  connectSocialMedia: async (
    email: string,
    token: string,
    platform: string,
  ) => {
    try {
      const storedToken = await storageService.getToken();
      const response = await apiClient.post<SocialMediaConnectResponse>(
        "/socialMedia",
        { email, token, platform },
        { headers: { Authorization: `Bearer ${storedToken || token}` } },
      );
      return response.data;
    } catch (error) {
      console.error("Social Media Connect API Error:", error);
      throw error;
    }
  },

  /**
   * Disconnect social media platform
   * @param email User email
   * @param platform Platform key (instagram, facebook, etc.)
   * @returns Promise with success response
   */
  disconnectSocialMedia: async (email: string, platform: string) => {
    try {
      const response = await apiClient.delete("/disconnect", {
        data: { email, platform },
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Disconnect Social Media API Error:", error);
      throw error;
    }
  },
};

export default userService;
