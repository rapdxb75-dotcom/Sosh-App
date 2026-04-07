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

export interface RegisterPayload {
  fullName: string;
  userName: string;
  email: string;
  password: string;
  subscription?: string;
  onboardingData?: {
    step1: { brandDescription: string };
    step2: { targetAudienceAge: string[]; idealFollowerDescription: string };
    step3: {
      activePlatforms: Record<
        string,
        { selected: boolean; followerCount: string }
      >;
      primaryGoal: string;
    };
    step4: { brandPersonalityTraits: string[] };
    step5: { contentCategories: string[]; competitiveDifferentiator: string };
    step6: { desiredAudienceFeelings: string[] };
    step7: { brandLanguage: string; avoidedTopics: string };
    step8: {
      monitoredCompetitors: string;
      respectedCompetitorTraits: string;
      userEdgeFactor: string;
    };
    step9: { preferredCaptionLength: string; emojiUsagePreference: string };
    step10: { preferredCTAStyle: string; captionBodyTone: string };
  };
}

// Authentication Service
const authService = {
  /**
   * Register a new user
   * @param payload RegisterPayload
   * @returns Promise<any>
   */
  register: async (payload: RegisterPayload) => {
    try {
      const response = await apiClient.post("/web-register", payload);
      return response.data;
    } catch (error) {
      console.error("Register API Error:", error);
      throw error;
    }
  },

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
