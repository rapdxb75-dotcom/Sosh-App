# 🔔 Push Notifications — Implementation Guide

> **Covers:** Current mobile (React Native / Expo) implementation **+** step-by-step web integration guide.

---

## Table of Contents

1. [Mobile Implementation (Current)](#1-mobile-implementation-current)
   - [Architecture Overview](#11-architecture-overview)
   - [Dependencies](#12-dependencies)
   - [app.json / Config Plugin Setup](#13-appjson--config-plugin-setup)
   - [Permission Flow](#14-permission-flow)
   - [FCM Token Lifecycle](#15-fcm-token-lifecycle)
   - [Message Handling (Foreground)](#16-message-handling-foreground)
   - [Token Refresh Listener](#17-token-refresh-listener)
   - [Backend Sync — `/updateFcmToken`](#18-backend-sync--updatefcmtoken)
   - [Local Storage Layer](#19-local-storage-layer)
   - [App Startup Wiring (_layout.tsx)](#110-app-startup-wiring-_layouttsx)
   - [iOS-Specific Notes](#111-ios-specific-notes)
   - [Android-Specific Notes](#112-android-specific-notes)
   - [Data Flow Diagram](#113-data-flow-diagram)
2. [Web Push Notifications — Integration Guide](#2-web-push-notifications--integration-guide)
   - [How Web Push Differs from Mobile](#21-how-web-push-differs-from-mobile)
   - [Prerequisites](#22-prerequisites)
   - [Step 1 — Enable Web Push in Firebase Console](#23-step-1--enable-web-push-in-firebase-console)
   - [Step 2 — Install Firebase Web SDK](#24-step-2--install-firebase-web-sdk)
   - [Step 3 — Create firebase.ts (Web)](#25-step-3--create-firebasets-web)
   - [Step 4 — Create the Service Worker](#26-step-4--create-the-service-worker)
   - [Step 5 — Request Permission & Get Token](#27-step-5--request-permission--get-token)
   - [Step 6 — Handle Foreground Messages](#28-step-6--handle-foreground-messages)
   - [Step 7 — Sync Token to Backend](#29-step-7--sync-token-to-backend)
   - [Step 8 — Send Notifications from Backend](#210-step-8--send-notifications-from-backend)
   - [Step 9 — Sending from Firebase Console (Testing)](#211-step-9--sending-from-firebase-console-testing)
   - [Environment Variables](#212-environment-variables)
   - [Web vs Mobile Token Storage](#213-web-vs-mobile-token-storage)
   - [Troubleshooting](#214-troubleshooting)

---

## 1. Mobile Implementation (Current)

### 1.1 Architecture Overview

The Sosh mobile app uses **Firebase Cloud Messaging (FCM)** via `@react-native-firebase/messaging` to deliver push notifications on both iOS and Android. All notification logic is centralised in `services/firebase.ts`.

```
App Launch (_layout.tsx)
    │
    ├─ initializeFirebase()          ← init JS SDK + Firestore
    │
    ├─ requestPermissionsOnStartup() ← one-time permission prompt (first launch only)
    │
    └─ FirebaseDataFetcher (on login)
         │
         └─ initializeFCM()
              ├─ setupForegroundMessageListener()   ← onMessage → Toast
              ├─ setupTokenRefreshListener()         ← onTokenRefresh → sync backend
              └─ getFCMToken()                       ← register + get token → AsyncStorage + backend
```

---

### 1.2 Dependencies

| Package | Purpose |
|---|---|
| `@react-native-firebase/app` | Core Firebase native SDK |
| `@react-native-firebase/messaging` | FCM token & message handling |
| `react-native-permissions` | Cross-platform permission status check |
| `react-native-toast-message` | Foreground notification UI |
| `@react-native-async-storage/async-storage` | Persisting FCM token locally |

---

### 1.3 app.json / Config Plugin Setup

The following config plugins in `app.json` are **required** for push notifications to work:

```json
{
  "plugins": [
    "@react-native-firebase/app",
    "@react-native-firebase/messaging",
    [
      "react-native-permissions",
      {
        "iosPermissions": ["Notifications"]
      }
    ]
  ],
  "ios": {
    "googleServicesFile": "./GoogleService-Info.plist",
    "entitlements": {
      "aps-environment": "development"
    }
  },
  "android": {
    "googleServicesFile": "./google-services.json"
  }
}
```

> [!IMPORTANT]
> `aps-environment` must be set to `"production"` before submitting to the App Store. Change it in `app.json` and rebuild via EAS.

---

### 1.4 Permission Flow

**File:** `services/firebase.ts` → `checkNotificationPermission` / `requestNotificationPermission`

```
App First Launch
      │
      ▼
AsyncStorage.getItem("push_permission_requested")
      │
      ├─ "true" → skip (already prompted before)
      │
      └─ null → requestNotificationPermission()
                      │
                      ├─ checkNotifications()  ← react-native-permissions
                      │     ├─ "granted" or "provisional" → return true
                      │     └─ otherwise → messaging().requestPermission({ sound, badge, alert })
                      │
                      └─ Set "push_permission_requested" = "true" in AsyncStorage
```

**Key Statuses:**
- `granted` — Full notification delivery.
- `provisional` (iOS only) — Silent delivery to Notification Centre without an explicit prompt.
- `denied` — Cannot receive notifications; user must re-enable via device Settings.

---

### 1.5 FCM Token Lifecycle

**File:** `services/firebase.ts` → `getFCMToken(retryCount)`

```typescript
// Step-by-step inside getFCMToken()

// 1. iOS only: register device for remote messages FIRST
await messaging().registerDeviceForRemoteMessages();
await sleep(1500); // Wait for APNs registration

// 2. Check/request permission
const hasPermission = await requestNotificationPermission();
if (!hasPermission) return null;

// 3. Enable FCM auto-init
await messaging().setAutoInitEnabled(true);

// 4. Get the token (with retry on failure)
const token = await messaging().getToken();

// 5. Persist locally
await AsyncStorage.setItem("fcm_token", token);

// 6. Sync to backend
await syncFCMTokenWithBackend(token);
```

**Retry Logic:**
- Up to **2 retries** with a 3-second delay between attempts.
- On retry, `messaging().deleteToken()` is called first to clear stale token state.

---

### 1.6 Message Handling (Foreground)

**File:** `services/firebase.ts` → `setupForegroundMessageListener`

When the app is **open and in the foreground**, `messaging().onMessage()` intercepts incoming FCM messages. The app does **not** show a native OS notification banner in this case — instead it shows a `react-native-toast-message` toast.

```typescript
messaging().onMessage(async (remoteMessage) => {
  const title = remoteMessage.notification?.title ?? remoteMessage.data?.title ?? "Notification";
  const body  = remoteMessage.notification?.body  ?? remoteMessage.data?.body  ?? "";
  const type  = remoteMessage.data?.success !== "false" ? "success" : "error";

  Toast.show({ type, text1: title, text2: body, visibilityTime: 6000 });
});
```

**Background / Killed State:**
- When the app is in the background or killed, the **native OS** handles the notification display automatically via FCM data delivered to the device.
- No additional code is needed for basic background delivery.

---

### 1.7 Token Refresh Listener

**File:** `services/firebase.ts` → `setupTokenRefreshListener`

FCM tokens can change (e.g., after app reinstall, or token rotation). The refresh listener ensures the backend always has the latest valid token:

```typescript
messaging().onTokenRefresh(async (newToken) => {
  await AsyncStorage.setItem("fcm_token", newToken);
  await syncFCMTokenWithBackend(newToken);
});
```

---

### 1.8 Backend Sync — `/updateFcmToken`

**File:** `services/api/user.ts` → `userService.updateFcmToken`

```typescript
updateFcmToken: async (fcmToken: string) => {
  const response = await apiClient.post("/updateFcmToken", { fcmToken });
  return response.data;
}
```

The backend `/updateFcmToken` endpoint should:
1. Authenticate the request (JWT bearer token via `apiClient` interceptor).
2. Find the user record by JWT identity.
3. Update the stored `fcmToken` field on the user document.

This token is later used by the backend (or admin panel) to call `firebase-admin`'s `messaging.send()` to push a notification to a specific device.

---

### 1.9 Local Storage Layer

**File:** `services/storage.ts`

Notifications and unread counts are cached in `AsyncStorage` for offline access and badge management:

| Key | Type | Description |
|---|---|---|
| `fcm_token` | `string` | The raw FCM device token (set in `firebase.ts`) |
| `app_notifications` | `JSON[]` | Array of cached notification objects |
| `app_unread_notifications_count` | `number` | Unread badge counter |
| `push_permission_requested` | `"true"` | Guard flag — prevents re-prompting on subsequent launches |

---

### 1.10 App Startup Wiring (`_layout.tsx`)

The notification system is bootstrapped at **two points** during app startup:

**Point 1 — On first load (before login):**
```typescript
// In useEffect on mount — requestPermissionsOnStartup()
const hasRequestedBefore = await AsyncStorage.getItem("push_permission_requested");
if (!hasRequestedBefore) {
  await requestNotificationPermission();
  await AsyncStorage.setItem("push_permission_requested", "true");
}
```

**Point 2 — After login (inside `FirebaseDataFetcher`):**
```typescript
// Triggered when Redux state changes to isLoggedIn === true
const token = await initializeFCM();
// initializeFCM() calls:
//   setupForegroundMessageListener()
//   setupTokenRefreshListener()
//   getFCMToken()  → stores + syncs to backend
```

---

### 1.11 iOS-Specific Notes

- `messaging().registerDeviceForRemoteMessages()` **must** be called before `getToken()` on iOS; otherwise APNs registration hasn't happened and the call will fail.
- A 1.5-second delay after registration is intentional — APNs registration propagation is async.
- The `aps-environment` entitlement in `app.json` controls whether notifications use Apple's **sandbox** (development) or **production** APNs gateway.
- iOS `provisional` permission allows *silent* notifications (delivered to Notification Centre) without an explicit user prompt.

---

### 1.12 Android-Specific Notes

- `google-services.json` is required in the project root and referenced in `app.json`.
- Android 13+ (API 33+) requires a runtime `POST_NOTIFICATIONS` permission. `@react-native-firebase/messaging`'s `requestPermission()` handles this automatically.
- No device registration step is needed on Android — `getToken()` works directly.

---

### 1.13 Data Flow Diagram

```
Device (iOS / Android)
        │
        │  1. App launches → requestPermissionsOnStartup()
        │  2. User logs in → initializeFCM()
        │
        ▼
@react-native-firebase/messaging
        │
        │  registerDeviceForRemoteMessages() [iOS only]
        │  getToken()
        │
        ▼
    FCM Token
        │
        ├──────────────────────────────────────┐
        ▼                                      ▼
AsyncStorage                           Backend API
"fcm_token"                          POST /updateFcmToken
                                            │
                                            ▼
                                    Stored on user record (DB)
                                            │
                              ┌─────────────┘
                              │ When notification needs sending:
                              ▼
                    firebase-admin.messaging.send({
                      token: storedFcmToken,
                      notification: { title, body }
                    })
                              │
                              ▼
                 FCM Servers → Device
                              │
                    ┌─────────┴────────────┐
                    ▼                      ▼
            Foreground?              Background/Killed?
         Toast.show(...)         OS shows native banner
```

---

## 2. Web Push Notifications — Integration Guide

### 2.1 How Web Push Differs from Mobile

| Aspect | Mobile (current) | Web (to add) |
|---|---|---|
| SDK | `@react-native-firebase/messaging` | `firebase/messaging` (JS SDK) |
| Token type | APNs/FCM device token | FCM **web** token (different per browser) |
| Permission API | `messaging().requestPermission()` | `Notification.requestPermission()` (browser API) |
| Background handler | Native OS / FCM | **Service Worker** (`firebase-messaging-sw.js`) |
| Key requirement | `GoogleService-Info.plist` / `google-services.json` | **VAPID public key** |
| Token storage | `AsyncStorage` | `localStorage` or your DB |

> [!NOTE]
> The **same Firebase project** is used. Web tokens are simply a different device channel that FCM manages. Your existing backend send logic requires only adding `web` tokens to the send targets.

---

### 2.2 Prerequisites

- Existing Firebase project (already set up for mobile)
- A web app (React / Next.js / Vite / plain HTML)
- HTTPS (push notifications **require** a secure origin; `localhost` is an exception for development)
- Node.js backend with `firebase-admin` (already used for mobile sends)

---

### 2.3 Step 1 — Enable Web Push in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com) → your project.
2. Navigate to **Project Settings** → **Cloud Messaging** tab.
3. Scroll to **Web Push certificates**.
4. Click **Generate key pair** — this gives you a **VAPID Public Key**.
5. Copy and save this key — you'll use it as `NEXT_PUBLIC_VAPID_KEY` (or equivalent env var).

---

### 2.4 Step 2 — Install Firebase Web SDK

```bash
npm install firebase
```

> [!NOTE]
> Your mobile app already uses `firebase` (JS SDK) for Firestore. The same package also contains the web messaging module. You may already have it installed.

---

### 2.5 Step 3 — Create `firebase.ts` (Web)

Create or extend your web app's firebase config file:

```typescript
// src/lib/firebase.ts  (web app)

import { initializeApp, getApps } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Singleton pattern — same as mobile
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

// getMessaging is only available in browsers (not SSR)
export const getFirebaseMessaging = async () => {
  const supported = await isSupported();
  if (!supported) return null;
  return getMessaging(app);
};

export default app;
```

---

### 2.6 Step 4 — Create the Service Worker

The service worker handles **background** notifications (when the browser tab is closed or unfocused).

Create the file at `public/firebase-messaging-sw.js` (must be at the root of your web app):

```javascript
// public/firebase-messaging-sw.js

importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_AUTH_DOMAIN",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Background message received:", payload);

  const { title = "Sosh", body = "" } = payload.notification ?? {};

  self.registration.showNotification(title, {
    body,
    icon: "/icon-192x192.png",   // update to your app icon path
    badge: "/badge-72x72.png",
  });
});
```

> [!IMPORTANT]
> The service worker file **must be served from the same origin** as your web app and **must be at `/firebase-messaging-sw.js`** (the root). In Next.js, this means placing it in `/public/`. In Vite/CRA, also in `/public/`.

> [!WARNING]
> Do NOT put secret keys in the service worker — it runs in the browser and is publicly accessible. The Firebase config values here (apiKey, projectId, etc.) are safe to expose; they identify your project, not grant admin access.

---

### 2.7 Step 5 — Request Permission & Get Token

Create a hook `useWebPushNotifications.ts` in your web app:

```typescript
// src/hooks/useWebPushNotifications.ts

import { useEffect, useState } from "react";
import { getToken } from "firebase/messaging";
import { getFirebaseMessaging } from "../lib/firebase";

const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_KEY!;
const WEB_FCM_TOKEN_KEY = "web_fcm_token";

export const useWebPushNotifications = () => {
  const [token, setToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>("default");

  const requestAndGetToken = async () => {
    // 1. Check browser support
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications.");
      return null;
    }

    // 2. Request permission
    const permission = await Notification.requestPermission();
    setPermissionStatus(permission);

    if (permission !== "granted") {
      console.warn("Notification permission denied.");
      return null;
    }

    // 3. Get Firebase messaging instance
    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      console.warn("Firebase messaging not supported in this browser.");
      return null;
    }

    try {
      // 4. Get FCM token — this also registers the service worker
      const fcmToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        ),
      });

      if (fcmToken) {
        localStorage.setItem(WEB_FCM_TOKEN_KEY, fcmToken);
        setToken(fcmToken);
        return fcmToken;
      }
    } catch (err) {
      console.error("Error getting web FCM token:", err);
    }
    return null;
  };

  useEffect(() => {
    // Restore cached token on mount
    const cached = localStorage.getItem(WEB_FCM_TOKEN_KEY);
    if (cached) setToken(cached);
  }, []);

  return { token, permissionStatus, requestAndGetToken };
};
```

---

### 2.8 Step 6 — Handle Foreground Messages

When the web tab is **open**, FCM messages are delivered to `onMessage()` (not the service worker). Handle them like the mobile toast system:

```typescript
// src/lib/webNotificationListener.ts

import { onMessage } from "firebase/messaging";
import { getFirebaseMessaging } from "./firebase";

export const setupWebForegroundListener = async () => {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return () => {};

  const unsubscribe = onMessage(messaging, (payload) => {
    console.log("[Web] Foreground message:", payload);

    const title = payload.notification?.title ?? "Sosh";
    const body  = payload.notification?.body  ?? "";

    // Option A: Use browser Notification API
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: "/icon-192x192.png" });
    }

    // Option B: Show a toast using your UI library
    // toast.success(`${title}: ${body}`);
  });

  return unsubscribe; // call this to stop listening
};
```

Call `setupWebForegroundListener()` in your root layout component after the user logs in (same pattern as mobile's `initializeFCM()`).

---

### 2.9 Step 7 — Sync Token to Backend

After getting the web FCM token, sync it to the same backend endpoint used by mobile:

```typescript
// In your web app — after calling requestAndGetToken()

const syncWebTokenToBackend = async (fcmToken: string) => {
  await fetch(`${API_BASE_URL}/updateFcmToken`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userJwt}`,
    },
    body: JSON.stringify({ fcmToken }),
  });
};
```

> [!TIP]
> The backend `/updateFcmToken` endpoint already exists and works the same way for web tokens. No backend changes are needed — FCM handles both mobile and web tokens identically from the server's perspective.

**Recommended: store both mobile and web tokens** per user (a user might be on both platforms). Update the backend user model if needed:

```js
// Backend user schema suggestion
{
  fcmToken: "...",          // latest mobile token (current)
  webFcmToken: "...",       // latest web token (new)
  // OR store an array:
  fcmTokens: ["token1", "token2"],  // all active tokens
}
```

---

### 2.10 Step 8 — Send Notifications from Backend

The backend already uses `firebase-admin` for mobile sends. Web sends work identically — just use the web FCM token:

```javascript
// backend/notifications.js  (Node.js with firebase-admin)

const admin = require("firebase-admin");

const sendPushNotification = async ({ token, title, body, data = {} }) => {
  const message = {
    token,                         // works for both mobile AND web tokens
    notification: { title, body },
    data,                          // optional key-value payload
    // Web-specific display options:
    webpush: {
      notification: {
        title,
        body,
        icon: "https://yourapp.com/icon-192x192.png",
        click_action: "https://yourapp.com/dashboard",
      },
    },
  };

  const response = await admin.messaging().send(message);
  console.log("Notification sent:", response);
  return response;
};

// To send to BOTH mobile and web simultaneously:
const sendToAllUserTokens = async (user, title, body) => {
  const tokens = [user.fcmToken, user.webFcmToken].filter(Boolean);
  if (!tokens.length) return;

  const response = await admin.messaging().sendEachForMulticast({
    tokens,
    notification: { title, body },
  });
  return response;
};
```

---

### 2.11 Step 9 — Sending from Firebase Console (Testing)

You can test web push without backend changes using the Firebase Console:

1. Go to **Firebase Console** → **Engage** → **Messaging**.
2. Click **New campaign** → **Notification**.
3. Fill in title and body.
4. Under **Target**, choose **FCM registration token**.
5. Paste the web FCM token printed in your browser console.
6. Click **Review** → **Publish**.

---

### 2.12 Environment Variables

Add these to your web app's `.env` file:

```env
# Firebase config — same values as your mobile .env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=459898012419
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# VAPID key from Firebase Console → Project Settings → Cloud Messaging
NEXT_PUBLIC_VAPID_KEY=your_vapid_public_key_here
```

---

### 2.13 Web vs Mobile Token Storage

| | Mobile | Web |
|---|---|---|
| Storage | `AsyncStorage` ("fcm_token") | `localStorage` ("web_fcm_token") |
| Scope | Per device | Per browser per origin |
| Lifetime | Until app uninstall / token rotation | Until browser data cleared / token rotation |
| Refresh listener | `onTokenRefresh()` | Re-call `getToken()` on each session |

> [!TIP]
> For web, call `getToken()` on every login (not just first launch) to catch any token rotation. Cache the result in `localStorage` and skip the permission prompt if already granted.

---

### 2.14 Troubleshooting

| Problem | Solution |
|---|---|
| `getToken()` returns null on web | Ensure the service worker is registered and VAPID key is correct |
| Notifications work in dev but not production | Check HTTPS on production; ensure `firebase-messaging-sw.js` is publicly accessible at `/` |
| Background notifications not showing | Verify service worker is active (`chrome://serviceworker-internals`); check `importScripts` version matches your SDK |
| Token not updating after user logs in on new browser | Call `requestAndGetToken()` on every login; don't rely solely on cached token |
| iOS Safari not supported | Web push on iOS requires **iOS 16.4+** and the web app must be added to the Home Screen (PWA) |
| "Messaging: This browser doesn't support the API's required to use..." | Browser too old or in a private/incognito window (some browsers block service workers in private mode) |
| Duplicate notifications (both foreground and background) | `onMessage()` handler only fires when the tab is active — the service worker only fires when the tab is inactive. They are mutually exclusive; no deduplication needed |
