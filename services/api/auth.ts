import apiClient from './client';

// Define the response type (adjust based on actual API response)
export interface LoginResponse {
    token: string;
    user: {
        id: string;
        email: string;
        name: string;
        // add other fields as needed
    };
    message?: string;
    success?: boolean;
}

// Define the request payload type
export interface LoginPayload {
    email: string;
    password: string;
}

export interface UpdateProfilePayload {
    userName?: string;
    profilePicture?: string;
}

export interface UpdateProfileResponse {
    success: boolean;
    message?: string;
    user?: any;
}

// Authentication Service
const authService = {
    /**
     * Login user with email and password
     * @param payload LoginPayload
     * @returns Promise<LoginResponse>
     */
    login: async (payload: LoginPayload) => {
        try {
            const response = await apiClient.post<LoginResponse>('/app-login', payload);
            return response.data;
        } catch (error) {
            console.error("Login API Error:", error);
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
            const response = await apiClient.post<UpdateProfileResponse>('/updateUserDetail', payload);
            return response.data;
        } catch (error) {
            console.error("Update Profile API Error:", error);
            throw error;
        }
    },

    // Add other auth methods here (register, logout, etc.)
};

export default authService;
