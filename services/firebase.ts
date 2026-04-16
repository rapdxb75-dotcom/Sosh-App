import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";
import { initializeApp } from "firebase/app";
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
};

// Initialize Firebase App
let app: any = null;
let db: any = null;

export const initializeFirebase = () => {
  if (!app) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app, "test"); // Using 'test' database
    console.log("Firebase initialized successfully");
    console.log("Firebase DB Name:", firebaseConfig.projectId);
    console.log("Firebase Database ID: test");
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
        console.log("📱 [iOS] Registering device for remote messages...");
        await messaging().registerDeviceForRemoteMessages();
        console.log("✅ [iOS] Device registered successfully");
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

export const getFCMToken = async (): Promise<string | null> => {
  try {
    // 1. iOS: Explicitly register device for remote messages before anything else
    if (Platform.OS === "ios") {
      console.log(
        "📱 [iOS] Registering device for remote messages explicitly...",
      );
      await messaging().registerDeviceForRemoteMessages();
      console.log("✅ [iOS] Device registered successfully");
      // Crucial: wait for registration to propagate
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    // 2. Request/Check permissions
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log("❌ No notification permission - cannot get FCM token");
      return null;
    }

    // 3. Enable auto-init
    await messaging().setAutoInitEnabled(true);

    // 4. Get the token
    console.log("🎫 [FCM] Requesting token...");
    try {
      const token = await messaging().getToken();

      if (token) {
        await AsyncStorage.setItem("fcm_token", token);
        console.log("✅ [FCM] Token obtained successfully:", token);
        // Sync token with local backend/webhook
        await syncFCMTokenWithBackend(token);
      } else {
        console.error("❌ [FCM] Received null or empty token.");
      }
      return token;
    } catch (tokenError) {
      console.error("❌ [FCM] messaging().getToken() error:", tokenError);
      return null;
    }
  } catch (error) {
    console.error("❌ [FCM] Error in getFCMToken flow:", error);
    return null;
  }
};

export const setupForegroundMessageListener = () => {
  return messaging().onMessage(async (remoteMessage) => {
    console.log(
      "🔔 Foreground notification:",
      JSON.stringify(remoteMessage, null, 2),
    );

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
    console.log("🔁 FCM Token refreshed:", token);
    await AsyncStorage.setItem("fcm_token", token);
    await syncFCMTokenWithBackend(token);
  });
};

/**
 * Synchronizes the FCM token with the backend using userService.
 */
export const syncFCMTokenWithBackend = async (fcmToken: string) => {
  try {
    console.log("📤 Syncing FCM token with backend...");
    await userService.updateFcmToken(fcmToken);
    console.log("✅ FCM token synced successfully");
  } catch (error) {
    console.error("❌ Error syncing FCM token with backend:", error);
  }
};

export const initializeFCM = async () => {
  try {
    console.log("🚀 [FCM] Starting initialization...");

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
      console.log("No user email provided");
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

      console.log("Firebase Collection Name: users");
      console.log("Current User Email:", userEmail);
      console.log("User Document Data:", userDataWithId);

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

        console.log("Firebase Collection Name: users");
        console.log("Current User Email:", userEmail);
        console.log("User Document Data:", userDataWithId);

        return userDataWithId;
      } else {
        console.log("No user found with email:", userEmail);
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
    console.log("No user email provided for listener");
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
        console.log("Real-time user data update:", userDataWithId);
        onUpdate(userDataWithId);
      } else {
        console.log("User document does not exist");
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
      console.log("Invalid parameters for updating poppy credits");
      return false;
    }

    const { db } = initializeFirebase();
    const userDocRef = doc(db, "users", userEmail);

    // Use increment to add credits to existing value
    await updateDoc(userDocRef, {
      poppyToken: increment(creditsUsed),
    });

    console.log(
      `✅ Updated poppyToken: +${creditsUsed} credits for ${userEmail}`,
    );
    return true;
  } catch (error: any) {
    // If document doesn't exist or field doesn't exist, create it
    if (error.code === "not-found") {
      try {
        const { db } = initializeFirebase();
        const userDocRef = doc(db, "users", userEmail);
        await setDoc(userDocRef, { poppyToken: creditsUsed }, { merge: true });
        console.log(
          `✅ Created poppyToken field: ${creditsUsed} credits for ${userEmail}`,
        );
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

    console.log(`✅ Incremented aiChatCount for ${userEmail}`);
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
