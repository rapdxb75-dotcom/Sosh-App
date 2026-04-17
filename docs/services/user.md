# User Service Documentation

The `userService` handles the management of user-oriented profile information, device registrations, and social media integrations.

## 1. 🧠 Logic / Business Logic

### Profile Data
- **`updateProfile`**: Updates core account identity aspects (like Username and Profile Picture) within the platform's backend database.

### FCM Tokens
- **`updateFcmToken`**: Syncs the device's Firebase Cloud Messaging push-token to the remote backend. Critical for resolving push notifications cross-platform.

### Platform Authorization Logic
- **`connectSocialMedia`**: Used mostly as a webhook receiver or initialization to log third-party OAuth access tokens (Instagram, Facebook, Tiktok).
- **`disconnectSocialMedia`**: Issues a raw DELETE request with the `{ email, platform }` key mapping to physically wipe the connection configuration from the user's environment in the SaaS backend.

---

## 2. 🔌 API Integration

### Core Endpoints
| Method | Endpoint | HTTP | Description |
| :--- | :--- | :--- | :--- |
| `updateFcmToken` | `/updateFcmToken` | POST | Records the device token. |
| `updateProfile`| `/updateUserDetail`| POST | Used to synchronize Redux state with backend state. |
| `connectSocialMedia`| `/socialMedia`| POST | Links an OAuth access chain. |
| `disconnectSocialMedia`| `/disconnect`| DELETE | Breaks an OAuth access chain. |

---

## 3. 🎨 UI / User Interface

*Tightly coupled to the User Profile View:*
- `connectSocialMedia` and `disconnectSocialMedia` functions directly resolve the frontend UI states within `profile.tsx`, causing the UI badges for "Connected Platforms" to immediately update or gray out.
