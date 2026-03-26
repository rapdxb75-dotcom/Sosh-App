# Firebase Service Documentation

The Firebase service acts as the bridge between the application and Google Firebase services, specifically handling Firestore (Database) and FCM (Push Notifications).

## 1. 🧠 Logic / Business Logic

### Initialization
- **`initializeFirebase`**: A singleton pattern that ensures `initializeApp` and `getFirestore` are only called once. It targets the `test` database instance.
- **`initializeFCM`**: Orchestrates the setup of listeners and token retrieval.

### Push Notification logic
- **FCM Token Flow**:
    1. Register device for remote messages (iOS specific requirement).
    2. Check/Request user permissions.
    3. Retrieve the unique `FCM Token`.
    4. Persist token to `AsyncStorage` and sync with the backend via `userService`.
- **Listeners**:
    - **Foreground**: `onMessage` displays a `Toast` notification using the app's internal styling.
    - **Refresh**: `onTokenRefresh` ensures the backend always has the current valid token.

---

## 2. 🔌 API Integration

### Firestore Methods
| Method | Description |
| :--- | :--- |
| `getCurrentUserData(email)` | Fetches a user document by ID or by email field query. |
| `listenToUserData(email, callback)` | Establishes a real-time `onSnapshot` listener for a user doc. |
| `updatePoppyTokenCredits(email, amount)` | Atomically increments the `poppyToken` field for usage tracking. |

### Permissions & Device Registration
- Uses `react-native-permissions` for cross-platform status checking.
- Uses `@react-native-firebase/messaging` for core communication.

---

## 3. 🎨 UI / User Interface

*This service has no UI elements of its own but directly triggers UI feedback:*

### Interaction Points
- **Toast Notifications**: When a message is received in the foreground, `setupForegroundMessageListener` triggers a `Toast.show` with a 6-second timeout.
- **Loading Guards**: `listenToUserData` returns an `unsubscribe` function, which is critical for lifecycle management in React components like `Home.tsx` to prevent memory leaks.

### Configuration (Sensitive Info)
- **Project ID**: `rapdxb-app`
- **Database ID**: `test`
- **Region/Sender ID**: `459898012419`
