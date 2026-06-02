import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getApps as getNativeApps,
  initializeApp as initializeNativeApp,
} from "@react-native-firebase/app";
import messaging from "@react-native-firebase/messaging";
import { getApps, initializeApp } from "firebase/app";
import {
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  getDocsFromServer,
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
import { isPlanExpired } from "../utils/subscription";
import userService from "./api/user";

// Firebase Configuration
const firebaseConfig: any = {
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
    const title: any =
      remoteMessage.notification?.title ||
      remoteMessage.data?.title ||
      "Notification";
    const body: any =
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
      console.warn("⚠️ getCurrentUserData called with empty email");
      return null;
    }

    const normalizedEmail = userEmail.trim().toLowerCase();
    const { db } = initializeFirebase();

    console.log(`🔍 [Firebase] Fetching data for: ${normalizedEmail} (Raw: ${userEmail})`);

    // Try to get user by email as document ID (normalized)
    const userDocRef = doc(db, "users", normalizedEmail);
    // Use getDocFromServer to ensure we bypass any local cache if this is a fresh login
    let userDoc = await getDocFromServer(userDocRef).catch(() => getDoc(userDocRef));

    // If not found, try raw email as document ID
    if (!userDoc.exists() && userEmail !== normalizedEmail) {
      console.log(`🔍 [Firebase] Document ID ${normalizedEmail} not found, trying raw email: ${userEmail}`);
      const rawDocRef = doc(db, "users", userEmail);
      userDoc = await getDocFromServer(rawDocRef).catch(() => getDoc(rawDocRef));
    }

    if (userDoc.exists()) {
      console.log(`✅ [Firebase] Document found for ${userDoc.id}`);
      const data = userDoc.data();
      const { profilePicture, ...userData } = data;

      if (userData.onboardingData) {
        console.log(`✅ [Firebase] Onboarding data found for ${userDoc.id} (${Object.keys(userData.onboardingData).length} keys)`);
      } else {
        console.warn(`⚠️ [Firebase] No onboardingData field found in document for ${userDoc.id}`);
      }

      return {
        id: userDoc.id,
        ...userData,
      };
    } else {
      console.log(`🔍 [Firebase] Document ID fetch failed, trying query for email field: ${normalizedEmail}`);
      // If not found by document ID, try querying by email field (normalized)
      const usersCollection = collection(db, "users");
      const q = query(usersCollection, where("email", "==", normalizedEmail));
      let querySnapshot = await getDocsFromServer(q).catch(() => getDocs(q));

      // If still not found, try querying by raw email field
      if (querySnapshot.empty && userEmail !== normalizedEmail) {
        const rawQ = query(usersCollection, where("email", "==", userEmail));
        querySnapshot = await getDocsFromServer(rawQ).catch(() => getDocs(rawQ));
      }

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        console.log(`✅ [Firebase] Document found via query for ${userDoc.id}`);
        const data = userDoc.data();
        const { profilePicture, ...userData } = data;

        if (userData.onboardingData) {
          console.log(`✅ [Firebase] Onboarding data found via query for ${userDoc.id}`);
        } else {
          console.warn(`⚠️ [Firebase] No onboardingData field found in queried document for ${userDoc.id}`);
        }

        return {
          id: userDoc.id,
          ...userData,
        };
      } else {
        console.error(`❌ [Firebase] No document found for email: ${userEmail}`);
        return null;
      }
    }
  } catch (error) {
    console.error("❌ [Firebase] Error fetching user data:", error);
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

  const normalizedEmail = userEmail.trim().toLowerCase();
  const { db } = initializeFirebase();
  const userDocRef = doc(db, "users", normalizedEmail);

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

    const normalizedEmail = userEmail.trim().toLowerCase();
    const { db } = initializeFirebase();
    const userDocRef = doc(db, "users", normalizedEmail);

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
        const normalizedEmail = userEmail.trim().toLowerCase();
        const userDocRef = doc(db, "users", normalizedEmail);
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

// Check and Reset Monthly Limit — also handles plan expiry (30-day cycle)
export const checkAndResetMonthlyLimit = async (
  userEmail: string,
  userData: any,
): Promise<{ expired: boolean }> => {
  try {
    if (!userEmail || !userData) return { expired: false };

    // Resolve plan name
    let plan = "Free";
    if (typeof userData.subscription === "string") {
      plan = userData.subscription;
    } else if (userData.subscription && typeof userData.subscription === "object") {
      plan = userData.subscription.plan || "Free";
    }

    const isPaidPlan =
      plan.toLowerCase() === "pro" || plan.toLowerCase() === "business";
    if (!isPaidPlan) return { expired: false };

    const purchasedAtStr =
      userData.purchasedAt || userData.subscription?.purchasedAt;

    // ── 1. EXPIRY CHECK ────────────────────────────────────────────────────────
    // If purchasedAt + 30 days has passed → plan is expired.
    // We do NOT write "Free" to Firestore — the plan stays as Pro/Business in the DB.
    // The app blocks access via usePlanStatus() and shows an expiry error message.
    if (isPlanExpired(purchasedAtStr)) {
      console.warn(
        `⚠️ [Subscription] Plan expired for ${userEmail}. purchasedAt: ${purchasedAtStr}. Access blocked (plan kept as ${plan} in DB).`,
      );
      return { expired: true };
    }

    // ── 2. MONTHLY USAGE RESET (for active Pro plans only) ────────────────────
    if (plan.toLowerCase() !== "pro") return { expired: false };
    if (!purchasedAtStr) return { expired: false };

    const subDate = new Date(purchasedAtStr);
    const now = new Date();

    // Calculate the next reset date (1 month after subscribe date)
    let nextResetDate = new Date(subDate);
    nextResetDate.setMonth(nextResetDate.getMonth() + 1);

    if (now >= nextResetDate) {
      // Advance nextResetDate until it's in the future
      while (now >= nextResetDate) {
        nextResetDate.setMonth(nextResetDate.getMonth() + 1);
      }

      const newSubscribeAt = new Date(nextResetDate);
      newSubscribeAt.setMonth(newSubscribeAt.getMonth() - 1);

      const normalizedEmail = userEmail.trim().toLowerCase();
      const { db } = initializeFirebase();
      const userDocRef = doc(db, "users", normalizedEmail);

      await setDoc(
        userDocRef,
        {
          aiChatCount: 0,
          purchasedAt: newSubscribeAt.toISOString(),
        },
        { merge: true },
      );

      console.log(
        `✅ Reset aiChatCount to 0 for ${userEmail}. Next reset will be at ${nextResetDate.toISOString()}`,
      );
    }

    return { expired: false };
  } catch (error) {
    console.error("Error checking and resetting monthly limit:", error);
    return { expired: false };
  }
};

// Increment AI Chat Count
export const incrementAIChatCount = async (userEmail: string) => {
  try {
    if (!userEmail) return false;

    const normalizedEmail = userEmail.trim().toLowerCase();
    const { db } = initializeFirebase();
    const userDocRef = doc(db, "users", normalizedEmail);

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
    const normalizedEmail = userEmail.trim().toLowerCase();
    const { db } = initializeFirebase();
    const userDocRef = doc(db, "users", normalizedEmail);
    await setDoc(
      userDocRef,
      { postCaptionCount: increment(1) },
      { merge: true },
    );
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
    const normalizedEmail = userEmail.trim().toLowerCase();
    const { db } = initializeFirebase();
    const userDocRef = doc(db, "users", normalizedEmail);
    await setDoc(
      userDocRef,
      { reelCaptionCount: increment(1) },
      { merge: true },
    );
    return true;
  } catch (error) {
    console.error("Error incrementing reelCaptionCount:", error);
    return false;
  }
};

// Update User Onboarding Data
export const updateUserOnboardingData = async (
  userEmail: string,
  onboardingData: any,
) => {
  try {
    if (!userEmail) return false;

    const normalizedEmail = userEmail.trim().toLowerCase();
    const { db } = initializeFirebase();
    const userDocRef = doc(db, "users", normalizedEmail);

    // We use updateDoc to completely overwrite the 'onboardingData' object.
    // If we used setDoc with merge: true, Firebase would deep merge the object, 
    // causing removed keys (like deselected social platforms) to remain in the database.
    try {
      await updateDoc(userDocRef, { onboardingData });
    } catch (e: any) {
      // Fallback if the user document doesn't exist yet
      if (e.code === 'not-found') {
        await setDoc(userDocRef, { onboardingData }, { merge: true });
      } else {
        throw e;
      }
    }

    console.log("✅ Onboarding data saved to Firebase for:", userEmail);
    return true;
  } catch (error) {
    console.error("Error updating onboarding data in Firebase:", error);
    return false;
  }
};

// Update Last Login with Timezone
export const updateLastLogin = async (userEmail: string) => {
  try {
    if (!userEmail) return false;

    const normalizedEmail = userEmail.trim().toLowerCase();
    const { db } = initializeFirebase();

    // Find the correct document ID (could be normalized email, raw email, or random ID)
    let userDocId = normalizedEmail;
    const userDocRef = doc(db, "users", normalizedEmail);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      const rawDocRef = doc(db, "users", userEmail);
      const rawDoc = await getDoc(rawDocRef);
      if (rawDoc.exists()) {
        userDocId = userEmail;
      } else {
        const usersCollection = collection(db, "users");
        const q = query(usersCollection, where("email", "==", normalizedEmail));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          userDocId = querySnapshot.docs[0].id;
        } else if (userEmail !== normalizedEmail) {
          const rawQ = query(usersCollection, where("email", "==", userEmail));
          const rawQuerySnapshot = await getDocs(rawQ);
          if (!rawQuerySnapshot.empty) {
            userDocId = rawQuerySnapshot.docs[0].id;
          }
        }
      }
    }

    const finalDocRef = doc(db, "users", userDocId);
    const now = new Date();
    const offset = -now.getTimezoneOffset();
    const diff = offset >= 0 ? "+" : "-";
    const pad = (num: number) => String(num).padStart(2, "0");
    const timestampWithTimezone =
      now.getFullYear() +
      "-" +
      pad(now.getMonth() + 1) +
      "-" +
      pad(now.getDate()) +
      "T" +
      pad(now.getHours()) +
      ":" +
      pad(now.getMinutes()) +
      ":" +
      pad(now.getSeconds()) +
      diff +
      pad(Math.floor(Math.abs(offset) / 60)) +
      ":" +
      pad(Math.abs(offset) % 60);

    const updateData = { lastLogin: timestampWithTimezone };
    console.log(`🔥 Updating Firebase for ${userEmail} (Doc: ${userDocId}):`, JSON.stringify(updateData, null, 2));

    await setDoc(
      finalDocRef,
      updateData,
      { merge: true },
    );

    console.log(`✅ Last login updated for ${userEmail}: ${timestampWithTimezone}`);
    return true;
  } catch (error) {
    console.error("Error updating lastLogin:", error);
    return false;
  }
};

// Update User Activity Status (updates lastLogin based on activity)
export const updateUserActivityStatus = async (
  userEmail: string,
) => {
  try {
    if (!userEmail) return false;

    const normalizedEmail = userEmail.trim().toLowerCase();
    const { db } = initializeFirebase();

    // Find the correct document ID (could be normalized email, raw email, or random ID)
    let userDocId = normalizedEmail;
    const userDocRef = doc(db, "users", normalizedEmail);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      const rawDocRef = doc(db, "users", userEmail);
      const rawDoc = await getDoc(rawDocRef);
      if (rawDoc.exists()) {
        userDocId = userEmail;
      } else {
        const usersCollection = collection(db, "users");
        const q = query(usersCollection, where("email", "==", normalizedEmail));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          userDocId = querySnapshot.docs[0].id;
        } else if (userEmail !== normalizedEmail) {
          const rawQ = query(usersCollection, where("email", "==", userEmail));
          const rawQuerySnapshot = await getDocs(rawQ);
          if (!rawQuerySnapshot.empty) {
            userDocId = rawQuerySnapshot.docs[0].id;
          }
        }
      }
    }

    const finalDocRef = doc(db, "users", userDocId);
    const now = new Date();
    const offset = -now.getTimezoneOffset();
    const diff = offset >= 0 ? "+" : "-";
    const pad = (num: number) => String(num).padStart(2, "0");
    const timestampWithTimezone =
      now.getFullYear() +
      "-" +
      pad(now.getMonth() + 1) +
      "-" +
      pad(now.getDate()) +
      "T" +
      pad(now.getHours()) +
      ":" +
      pad(now.getMinutes()) +
      ":" +
      pad(now.getSeconds()) +
      diff +
      pad(Math.floor(Math.abs(offset) / 60)) +
      ":" +
      pad(Math.abs(offset) % 60);

    const updateData = {
      lastLogin: timestampWithTimezone,
    };

    console.log(`🔄 [Firebase] Updating activity for ${userEmail} (Doc: ${userDocId})`);
    await setDoc(finalDocRef, updateData, { merge: true });

    return true;
  } catch (error) {
    console.error("Error updating lastLogin status:", error);
    return false;
  }
};

/**
 * Writes confirmed subscription details to Firestore.
 * Called after a successful purchase or restore so the admin panel
 * and any other devices see up-to-date subscription state.
 *
 * @param userEmail   Firestore document ID (normalised email)
 * @param plan        'Pro' | 'Business'
 * @param purchasedAt ISO string — latest transaction / renewal date
 * @param expiresAt   ISO string — Apple/Google expiry date (optional)
 */
export const updateSubscriptionStatus = async (
  userEmail: string,
  plan: "Pro" | "Business",
  purchasedAt: string,
  expiresAt?: string | null,
): Promise<boolean> => {
  try {
    if (!userEmail) return false;
    const normalizedEmail = userEmail.trim().toLowerCase();
    const { db } = initializeFirebase();
    const userDocRef = doc(db, "users", normalizedEmail);

    const payload: Record<string, any> = {
      subscription: { plan, isSubscribed: true },
      purchasedAt,
    };
    if (expiresAt) payload.expiresAt = expiresAt;

    await setDoc(userDocRef, payload, { merge: true });
    console.log(`✅ [Firebase] Subscription updated: ${plan}, purchasedAt=${purchasedAt}`);
    return true;
  } catch (error) {
    console.error("❌ [Firebase] updateSubscriptionStatus error:", error);
    return false;
  }
};

export { app, db };

