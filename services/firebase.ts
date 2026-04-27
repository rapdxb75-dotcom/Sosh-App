import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApps as getNativeApps, initializeApp as initializeNativeApp } from "@react-native-firebase/app";
import messaging from "@react-native-firebase/messaging";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  increment,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { Platform } from "react-native";
import { checkNotifications } from "react-native-permissions";
import Toast from "react-native-toast-message";
import userService from "./api/user";

// Firebase Configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  databaseURL: `https://${process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
};

// Initialize Native Firebase if not already done by Expo plugin
try {
  const nativeApps = getNativeApps();
  if (nativeApps.length === 0) {
    // Provide a complete config for cases where auto-init is missing
    initializeNativeApp(firebaseConfig);
  }
} catch (error) {
  console.warn("Native Firebase initialization warning:", error);
}

// Initialize Firebase App
let app: any = null;
let db: any = null;

export const initializeFirebase = () => {
  if (!app) {
    const jsApps = getApps();
    // Use a named app for the JS SDK to avoid clashing with the native [DEFAULT] app
    // initialized by @react-native-firebase/app via the Expo plugin.
    if (jsApps.length === 0) {
      app = initializeApp(firebaseConfig, "SOSH_JS_SDK");
    } else {
      app = jsApps.find((a) => a.name === "SOSH_JS_SDK") || jsApps[0];
    }
    db = getFirestore(app, "test"); // Using 'test' database
  }
  return { app, db };
};

// --- FCM & Push Notifications ---

export const checkNotificationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await checkNotifications();
    const granted =
      status === "granted" || (status as string) === "provisional";
    return granted;
  } catch (error) {
    console.error("Error checking notification permission:", error);
    return false;
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    const alreadyGranted = await checkNotificationPermission();

    if (Platform.OS === "ios") {
      try {
      } catch (error) {
        console.error("❌ [iOS] Failed to register device:", error);
      }
    }

    if (alreadyGranted) return true;

    const authStatus = await messaging().requestPermission({
      sound: true,
      badge: true,
      alert: true,
      announcement: true,
    });

    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
};

export const getFCMToken = async (retryCount = 0): Promise<string | null> => {
  try {
    // 1. iOS: Explicitly register device for remote messages before anything else
    if (Platform.OS === "ios") {
      try {
        await messaging().registerDeviceForRemoteMessages();
        console.log("✅ [iOS] Device registered for remote messages");
        // Wait for registration to propagate
        if (retryCount === 0) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      } catch (regError) {
        console.error("❌ [iOS] Failed to register device:", regError);
      }
    }

    // 2. Request/Check permissions
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      return null;
    }

    // 3. Enable auto-init
    await messaging().setAutoInitEnabled(true);

    // 4. Get the token
    try {
      const token = await messaging().getToken();

      if (token) {
        await AsyncStorage.setItem("fcm_token", token);
        // Sync token with local backend/webhook
        await syncFCMTokenWithBackend(token);
        return token;
      } else {
        console.error("❌ [FCM] Received null or empty token.");
        throw new Error("Received null or empty token.");
      }
    } catch (tokenError) {
      console.warn("⚠️ [FCM] messaging().getToken() error:", tokenError);

      if (retryCount < 2) {
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Sometimes deleting the existing token clears up bad state on network switches
        try {
          await messaging().deleteToken();
        } catch (e) {
          // Ignore deleteToken errors
        }

        return await getFCMToken(retryCount + 1);
      }

      console.error("❌ [FCM] Failed to get FCM token after retries.");
      return null;
    }
  } catch (error) {
    console.error("❌ [FCM] Error in getFCMToken flow:", error);
    return null;
  }
};

export const setupForegroundMessageListener = () => {
  return messaging().onMessage(async (remoteMessage) => {

    const title =
      remoteMessage.notification?.title ||
      remoteMessage.data?.title ||
      "Notification";
    const body =
      remoteMessage.notification?.body ||
      remoteMessage.data?.body ||
      remoteMessage.data?.message ||
      remoteMessage.data?.text ||
      "";

    if (title || body) {
      const isSuccess = remoteMessage.data?.success !== "false";
      const type = isSuccess ? "success" : "error";

      Toast.show({
        type,
        text1: title,
        text2: body,
        position: "top",
        visibilityTime: 6000,
        autoHide: true,
      });
    }
  });
};

export const setupTokenRefreshListener = () => {
  return messaging().onTokenRefresh(async (token) => {
    await AsyncStorage.setItem("fcm_token", token);
    await syncFCMTokenWithBackend(token);
  });
};

/**
 * Synchronizes the FCM token with the backend using userService.
 */
export const syncFCMTokenWithBackend = async (fcmToken: string) => {
  try {
    await userService.updateFcmToken(fcmToken);
  } catch (error) {
    console.error("❌ Error syncing FCM token with backend:", error);
  }
};

export const initializeFCM = async () => {
  try {

    // Ensure Firebase is initialized
    initializeFirebase();

    setupForegroundMessageListener();
    setupTokenRefreshListener();

    return await getFCMToken();
  } catch (error) {
    console.error("❌ FCM initialization failed:", error);
    return null;
  }
};

// --- Firestore Data Methods ---

// Get Current User's Document Data
export const getCurrentUserData = async (userEmail: string) => {
  try {
    if (!userEmail) {
      return null;
    }

    const { db } = initializeFirebase();

    // Try to get user by email as document ID
    const userDocRef = doc(db, "users", userEmail);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const { profilePicture, ...userData } = userDoc.data();
      const userDataWithId = {
        id: userDoc.id,
        ...userData,
      };


      return userDataWithId;
    } else {
      // If not found by document ID, try querying by email field
      const usersCollection = collection(db, "users");
      const q = query(usersCollection, where("email", "==", userEmail));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const { profilePicture, ...userData } = userDoc.data();
        const userDataWithId = {
          id: userDoc.id,
          ...userData,
        };


        return userDataWithId;
      } else {
        return null;
      }
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

// Real-time listener for user data
export const listenToUserData = (
  userEmail: string,
  onUpdate: (userData: any) => void,
  onError?: (error: Error) => void,
) => {
  if (!userEmail) {
    return () => { }; // Return empty unsubscribe function
  }

  const { db } = initializeFirebase();
  const userDocRef = doc(db, "users", userEmail);

  // Set up real-time listener
  const unsubscribe = onSnapshot(
    userDocRef,
    (docSnapshot) => {
      if (docSnapshot.exists()) {
        const { profilePicture, ...userData } = docSnapshot.data();
        const userDataWithId = {
          id: docSnapshot.id,
          ...userData,
        };
        onUpdate(userDataWithId);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      console.error("Error in real-time listener:", error);
      if (onError) {
        onError(error);
      }
    },
  );

  return unsubscribe; // Return unsubscribe function to stop listening
};

// Update Poppy Token Credits (Cumulative)
export const updatePoppyTokenCredits = async (
  userEmail: string,
  creditsUsed: number,
) => {
  try {
    if (!userEmail || typeof creditsUsed !== "number" || creditsUsed <= 0) {
      return false;
    }

    const { db } = initializeFirebase();
    const userDocRef = doc(db, "users", userEmail);

    // Use increment to add credits to existing value
    await updateDoc(userDocRef, {
      poppyToken: increment(creditsUsed),
    });

    return true;
  } catch (error: any) {
    // If document doesn't exist or field doesn't exist, create it
    if (error.code === "not-found") {
      try {
        const { db } = initializeFirebase();
        const userDocRef = doc(db, "users", userEmail);
        await setDoc(userDocRef, { poppyToken: creditsUsed }, { merge: true });
        return true;
      } catch (setError) {
        console.error("Error creating poppyToken field:", setError);
        return false;
      }
    }
    console.error("Error updating poppyToken:", error);
    return false;
  }
};

// Increment AI Chat Count
export const incrementAIChatCount = async (userEmail: string) => {
  try {
    if (!userEmail) return false;

    const { db } = initializeFirebase();
    const userDocRef = doc(db, "users", userEmail);

    await setDoc(
      userDocRef,
      {
        aiChatCount: increment(1),
      },
      { merge: true },
    );

    return true;
  } catch (error: any) {
    console.error("Error incrementing aiChatCount:", error);
    return false;
  }
};

// Increment Post Caption Count
export const incrementPostCaptionCount = async (userEmail: string) => {
  try {
    if (!userEmail) return false;
    const { db } = initializeFirebase();
    const userDocRef = doc(db, "users", userEmail);
    await setDoc(userDocRef, { postCaptionCount: increment(1) }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error incrementing postCaptionCount:", error);
    return false;
  }
};

// Increment Reel Caption Count
export const incrementReelCaptionCount = async (userEmail: string) => {
  try {
    if (!userEmail) return false;
    const { db } = initializeFirebase();
    const userDocRef = doc(db, "users", userEmail);
    await setDoc(userDocRef, { reelCaptionCount: increment(1) }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error incrementing reelCaptionCount:", error);
    return false;
  }
};

export { app, db };
