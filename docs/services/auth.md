# Auth Service Documentation

The `authService` handles all user authentication flows including registration, login, and password management by interacting with the backend API.

## 1. 🧠 Logic / Business Logic

### Authentication Types
- **Login (`LoginPayload`)**: Requires standard `email` and `password`.
- **Registration (`RegisterPayload`)**: Designed for a complex onboarding flow. It supports detailed `onboardingData` containing 10 steps of information such as brand description, target audience, and content strategies.
- **Password Reset**: Split into two steps:
  1. `forgotPassword`: Sends an OTP to the user's email.
  2. `resetPassword`: Validates the OTP and updates the password.

### Error Handling
- Wraps API calls in standard `try...catch` blocks to surface errors back to the caller for UI feedback.

---

## 2. 🔌 API Integration

### API Client
- This service primarily builds on top of `apiClient` (`client.ts`), a pre-configured Axios instance.

### Endpoints
| Method | Endpoint | HTTP | Description |
| :--- | :--- | :--- | :--- |
| `register` | `/web-register` | POST | Creates a new user record. |
| `login` | `/app-login` | POST | Authenticates and returns a `LoginResponse` with token. |
| `forgotPassword` | `/sentOtp?email=...` | POST | Generates and sends reset OTP. |
| `resetPassword` | `/verifyOtp` | POST | Confirms OTP and changes password. |

---

## 3. 🎨 UI / User Interface

*This module provides raw data and logic to Authentication screens:*
- Its `onboardingData` strict typing directly maps to the multi-step `SignupForm` state in the application, ensuring data integrity before sending to the server.
- The thrown errors are typically caught and rendered in the UI via `CustomToast` or `NotificationModal`.
