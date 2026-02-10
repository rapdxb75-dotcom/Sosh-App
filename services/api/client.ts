import axios from 'axios';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { store } from '../../store/store';
import { clearUserData } from '../../store/userSlice';
import storageService from '../storage';

// Base URL for API requests
// Note: In production, consider moving this to an environment variable.
const BASE_URL = 'https://n8n-production-0558.up.railway.app/webhook';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor for tokens
apiClient.interceptors.request.use(
    async (config) => {
        // Skip adding token for login endpoint
        if (config.url === '/app-login') {
            return config;
        }

        const token = await storageService.getToken();
        if (token && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for session handling
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        // Handle session expiry (403 Forbidden - used as expiry here)
        if (error.response && error.response.status === 403) {
            Toast.show({
                type: 'error',
                text1: 'Session Expired',
                text2: 'Please login again to continue.'
            });
            await storageService.logout();
            store.dispatch(clearUserData());
            router.replace('/login');
        }

        // Log errors or implement global error handling
        console.error('API Error:', error?.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default apiClient;
