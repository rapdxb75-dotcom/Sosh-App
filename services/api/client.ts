import axios from "axios";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { store } from "../../store/store";
import { clearUserData } from "../../store/userSlice";
import storageService from "../storage";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    if (config.url === "/app-login") {
      return config;
    }

    const token = await storageService.getToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
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

    console.error("API Error:", error?.response?.data || error.message);
    return Promise.reject(error);
  },
);

export default apiClient;
