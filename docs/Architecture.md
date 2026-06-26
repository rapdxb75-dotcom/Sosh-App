# Application Architecture

This document provides a high-level overview of the core architectural patterns and systems used in the Sosh-App. 

## 1. State Management (Redux)
The application uses **Redux Toolkit** for predictable state management across the app.

- **Store Configuration**: Located in `store/store.ts`. It configures the main Redux store and exports `RootState` and `AppDispatch` types for TypeScript integration.
- **Slices**:
  - `userSlice.ts`: Manages global user state, including authentication status, user profile data, and subscription plan status.
  - `previewStore.ts`: Manages the state related to the post creation and preview flow.

## 2. Authentication & Data Storage (Firebase)
Sosh uses **Firebase** for backend services, specifically Authentication and Firestore.

- **Initialization**: Firebase is initialized in `services/firebase.ts`. It handles both the native Firebase SDK (`@react-native-firebase/app`) for push notifications and the JavaScript SDK for Firestore interactions.
- **User Data (Firestore)**: 
  - User profiles are stored in the `users` collection.
  - The document ID is typically the normalized user email.
  - Key fields tracked include `aiChatCount`, `purchasedAt`, `subscription`, `postCaptionCount`, and `onboardingData`.
- **Real-time Listeners**: The app uses `onSnapshot` (via `listenToUserData`) to sync user data in real-time, meaning subscription updates or token usage immediately reflect in the UI.

## 3. In-App Purchases (IAP)
Subscription handling is critical for gating access to Pro and Business features.

- **Library**: `react-native-iap` is used to communicate with Apple's App Store and Google Play billing.
- **Hooks**:
  - `useIAP.ts`: A custom hook that wraps the underlying IAP library, handling product fetching, purchase flows, and restoring purchases.
  - `usePlanStatus.ts`: Calculates the user's active plan based on the Firestore `subscription` data and `purchasedAt` timestamps, enforcing 30-day limits.
- **Lifecycle**: Upon a successful purchase, `updateSubscriptionStatus` in `firebase.ts` is called to sync the receipt with the cloud.

## 4. AI & Services Integration
The app relies on external AI services to generate captions and content.

- **Integrations**: The app utilizes Anthropic (Claude) and a custom Poppy AI endpoint.
- **Credits System**: 
  - Token usage is tracked cumulatively in Firestore (`poppyToken`).
  - Monthly AI chat limits are enforced (`checkAndResetMonthlyLimit`), resetting the `aiChatCount` every 30 days for subscribed users.

## 5. Navigation (Expo Router)
The app uses **Expo Router** for file-based navigation, located in the `app/` directory.

- **Authentication Flow**: Screens like `login.tsx`, `signup.tsx`, and `forgot-password.tsx` handle unauthenticated states.
- **Onboarding Flow**: `onboarding.tsx` captures initial user preferences and saves them via `updateUserOnboardingData`.
- **Main App**: The `(tabs)` directory contains the primary bottom-tab navigation for authenticated users.

## 6. Push Notifications
Push notifications are handled via `@react-native-firebase/messaging`.
- **Token Management**: Handled in `firebase.ts` (`getFCMToken`, `initializeFCM`).
- **Foreground Handling**: Handled via `setupForegroundMessageListener`, which displays a toast notification using `react-native-toast-message` when the app is active.

*(For detailed setup and deployment, see [GETTING_STARTED.md](./GETTING_STARTED.md))*
