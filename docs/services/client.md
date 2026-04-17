# API Client Documentation

The `apiClient` service provides a globally configured Axios instance for making API requests to the backend. It centralizes request and response handling, including authentication and session management.

## 1. 🧠 Logic / Business Logic

### Core Configuration
- **Base URL**: Extracted from environment variables (`EXPO_PUBLIC_API_BASE_URL`).
- **Default Headers**: Automatically sets `Content-Type: application/json` for all requests.

### Interceptors
- **Request Interceptor**:
    - Skips token injection for the `/app-login` endpoint.
    - Dynamically retrieves the auth token via `storageService.getToken()` and attaches it to the `Authorization` header as a Bearer token.
    - Logs detailed request information (URL, method, payload) for debugging.
- **Response Interceptor**:
    - **Session Expiry**: Catches `403 Forbidden` responses. If the error is not a workflow-related error hook from `n8n`, it assumes the JWT is expired. It then automatically:
        - Displays a `Session Expired` error Toast.
        - Triggers a full logout (`storageService.logout()`, Redux `clearUserData()`).
        - Redirects the user to the `/login` route.
    - **Workflow Errors**: Extracts stringed messages or `hints` to show friendly `CustomToast` alerts to the user.

---

## 2. 🔌 API Integration

*This module does not make specific API calls itself, but it powers all other API services (like `authService`, `chatService`, etc).*

---

## 3. 🎨 UI / User Interface

*The client affects the UI layer via side effects:*
- Uses `react-native-toast-message` to show `Toast.show` overlays automatically for backend errors.
- Forces routing using `expo-router`'s `router.replace("/login")` when authentication tokens are invalidated by the server.
