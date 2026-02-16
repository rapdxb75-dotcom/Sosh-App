import storageService from '../storage';
import apiClient from './client';

export interface UpdateProfilePayload {
    userName?: string;
    profilePicture?: string;
}

export interface UpdateProfileResponse {
    success: boolean;
    message?: string;
    user?: any;
}

export interface InstagramConnectResponse {
    authUrl: string;
}

const userService = {
    /**
     * Update user profile details
     * @param payload UpdateProfilePayload
     * @returns Promise<UpdateProfileResponse>
     */
    updateProfile: async (payload: UpdateProfilePayload) => {
        try {
            const token = await storageService.getToken();
            const response = await apiClient.post<UpdateProfileResponse>(
                '/updateUserDetail',
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            console.error("Update Profile API Error:", error);
            throw error;
        }
    },

    /**
     * Connect Instagram account
     * @param email User email
     * @param token JWT token
     * @returns Promise<InstagramConnectResponse>
     */
    connectInstagram: async (email: string, token: string) => {
        try {
            // Using the token passed in argument, but also ensuring headers set correctly if needed
            // The argument `token` seems to be the auth token already? 
            // Based on previous code: connectInstagram: async (email: string, token: string) => ... { email, token }
            // It seems it was sending token in BODY. User requested Authorization header.
            // I'll keep body token for backward compat if needed, but also add Header.

            const storedToken = await storageService.getToken();
            const response = await apiClient.post<InstagramConnectResponse>(
                '/instagram',
                { email, token },
                { headers: { Authorization: `Bearer ${storedToken || token}` } }
            );
            return response.data;
        } catch (error) {
            console.error("Instagram Connect API Error:", error);
            throw error;
        }
    },
};

export default userService;
