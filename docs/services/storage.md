# Storage Service Documentation

The `storageService` is a localized abstraction strictly managing the persistent key-value store on the user's device via `@react-native-async-storage/async-storage`.

## 1. 🧠 Logic / Business Logic

### Key Dictionary
- Strongly types internal constant keys (e.g., `TOKEN_KEY`, `NOTIFICATIONS_KEY`) to prevent typo-driven bugs across the app.

### JSON Serialization
- Most simple string entries (like tokens or usernames) are stored natively.
- **Complex Objects**: Functions like `setNotifications` stringify arrays to JSON before saving. `getNotifications` parses the JSON and recursively restores `timestamp` strings back into live ECMAScript `Date` objects.

### Lifecycle Management
- **`setHasLaunched`**: A specialized boolean tracker used to determine if the user has completed the initial app onboarding/intro screens.
- **`logout`**: An atomic bulk-deletion routine. Calls `AsyncStorage.multiRemove` on the strict list of session keys (`TOKEN_KEY`, `USERNAME_KEY`, `PROFILE_PICTURE_KEY`, `EMAIL_KEY`, etc.), wiping the user's local footprint.

---

## 2. 🔌 API Integration

*This module only integrates with the OS-level storage APIs via React Native:*
- Maps directly to the iOS `NSUserDefaults` and Android `SharedPreferences` (or SQLite depending on capacity). 

---

## 3. 🎨 UI / User Interface

*Indirectly dictates UI via data availability:*
- If `getToken` returns `null`, the Routing setup will block the user from the `/app/(tabs)` hierarchy and force them to the Auth Screen.
- If `getHasLaunched` is `false`, the user is shown the Splash/Onboarding flow rather than the Login or Home tab.
