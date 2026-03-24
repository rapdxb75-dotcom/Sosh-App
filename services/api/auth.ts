import apiClient from "./client";

// Define the response type (adjust based on actual API response)
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    // add other fields as needed
  };
}

// Define the request payload type
export interface LoginPayload {
  email: string;
  password: string;
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
      const response = await apiClient.post<LoginResponse>(
        "/app-login",
        payload,
      );
      return response.data;
    } catch (error) {
      console.error("Login API Error:", error);
      throw error;
    }
  },

  /**
   * Request a password reset link
   * @param email string
   * @returns Promise<any>
   */
  forgotPassword: async (email: string) => {
    try {
      const response = await apiClient.post(
        `/sentOtp?email=${encodeURIComponent(email)}`,
      );
      return response.data;
    } catch (error) {
      console.error("Forgot Password API Error:", error);
      throw error;
    }
  },

  /**
   * Reset password with verification code
   * @param payload {email: string, otp: number, newPassword: string, cnfPassword: string}
   * @returns Promise<any>
   */
  resetPassword: async (payload: {
    email: string;
    otp: number;
    newPassword: string;
    cnfPassword: string;
  }) => {
    try {
      const response = await apiClient.post("/verifyOtp", payload);
      return response.data;
    } catch (error) {
      console.error("Reset Password API Error:", error);
      throw error;
    }
  },
};

export default authService;
