import axios from "axios";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { store } from "../../store/store";
import { clearUserData } from "../../store/userSlice";
import storageService from "../storage";

// Base URL for API requests
// Note: In production, consider moving this to an environment variable.
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const apiClient = axios.create({
  baseURL: BASE_URL,
  // timeout: 120000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for tokens
apiClient.interceptors.request.use(
  async (config) => {
    // Skip adding token for login endpoint
    if (config.url === "/app-login") {
      return config;
    }

    const token = await storageService.getToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    console.log("[API Full URL]:", `${config.baseURL}${config.url}`);
    console.log("[API Payload]:", JSON.stringify(config.data, null, 2));
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor for session handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle session expiry (403 Forbidden - used as expiry here)
    // Check if it's NOT a workflow error (n8n workflow errors often have a 'hint' or 'message' about webhooks)
    const isWorkflowError =
      error.response?.data?.hint ||
      (error.response?.data?.message &&
        error.response.data.message.includes("webhook"));

    if (error.response && error.response.status === 403 && !isWorkflowError) {
      Toast.show({
        type: "error",
        text1: "Session Expired",
        text2: "Please login again to continue.",
      });
      await storageService.logout();
      store.dispatch(clearUserData());
      router.replace("/login");
    }

    if (isWorkflowError) {
      const errorMessage =
        error.response?.data?.hint || error.response?.data?.message;
      Toast.show({
        type: "error",
        text1: "Workflow Error",
        text2: errorMessage || "An error occurred in the workflow.",
      });
    }

    return Promise.reject(error);
  },
);

export default apiClient;
