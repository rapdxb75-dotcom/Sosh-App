import { Inter_400Regular, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { Questrial_400Regular } from "@expo-google-fonts/questrial";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { Asset } from "expo-asset";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import { Image, View } from "react-native";
import Toast from "react-native-toast-message";
import { Provider, useSelector } from "react-redux";
import { toastConfig } from "../components/common/CustomToast";
import ErrorBoundary from "../components/common/ErrorBoundary";
import NoInternet from "../components/common/NoInternet";
import NotificationModal from "../components/common/NotificationModal";
import { PRELOAD_ASSETS } from "../constants/Assets";
import { NotificationProvider } from "../context/NotificationContext";
import { UserActivityDetector } from "../components/common/UserActivityDetector";
import "../global.css";
import {
  getCurrentUserData,
  initializeFCM,
  initializeFirebase,
  requestNotificationPermission,
  updateLastLogin,
} from "../services/firebase";
import { store, type RootState } from "../store/store";
import { initializeUser, updateUser } from "../store/userSlice";
import { initializeErrorHandler } from "../utils/errorHandler";
import { checkSubscriptionStatus } from "../hooks/useIAP";
import { isPlanExpired } from "../utils/subscription";
initializeFirebase();

// Initialize global exception handlers
initializeErrorHandler();

SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore duplicate calls in development fast-refresh cycles.
});

function FirebaseDataFetcher() {
  const email = useSelector((state: RootState) => state.user.email);
  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!email || !isLoggedIn || hasFetchedRef.current) {
      return;
    }

    // Fetch data once only
    const fetchData = async () => {
      try {
        const userData = (await getCurrentUserData(email)) as any;

        if (userData?.aiAdditions) {
          store.dispatch(updateUser({ aiAdditions: userData.aiAdditions }));
          console.log("✅ aiAdditions loaded from Firebase");
        }

        // Update last login timestamp with timezone directly in Firebase
        updateLastLogin(email).catch((err) => {
          console.error("❌ Error updating last login on app startup:", err);
        });

        // --- FCM Setup ---
        try {
          console.log("🚀 Initializing FCM...");
          const token = await initializeFCM();
          if (token) {
            console.log("✅ FCM Token obtained");
          }
        } catch (fcmError) {
          console.error("❌ FCM Setup error:", fcmError);
        }

        hasFetchedRef.current = true;

        // ── Dual-payment subscription verification ────────────────────────
        //
        // Payment path 1 — App Store (react-native-iap)
        //   getAvailablePurchases() returns only non-expired subscriptions.
        //   If found → subscription is active via Apple billing.
        //
        // Payment path 2 — Stripe (website)
        //   Admin/backend writes purchasedAt to Firebase after Stripe payment.
        //   The app uses purchasedAt + 30 days as the expiry window.
        //   IAP won't see these purchases, so we MUST NOT downgrade a user
        //   whose Firebase purchasedAt is still within the billing window.
        //
        // Downgrade to Free only when BOTH conditions are true:
        //   1. IAP reports no active App Store subscription
        //   2. Firebase purchasedAt is absent or older than 30 days
        // ─────────────────────────────────────────────────────────────────
        try {
          const iapStatus = await checkSubscriptionStatus();
          if (iapStatus !== null) {
            if (iapStatus.plan) {
              // ✅ Active App Store subscription — update Redux with IAP truth
              store.dispatch(
                updateUser({
                  subscription: {
                    plan: iapStatus.plan,
                    isSubscribed: true,
                  },
                  purchasedAt: iapStatus.purchasedAt,
                }),
              );
              console.log(`✅ [IAP] App Store subscription active: ${iapStatus.plan}`);
            } else {
              // IAP reports no active subscription.
              // Before downgrading, check if this is a valid Stripe (web) purchase
              // by looking at the purchasedAt date already in Redux / Firebase.
              const state = store.getState().user as any;
              const currentPlan: string = state.subscription?.plan ?? "Free";
              const existingPurchasedAt: string | null = state.purchasedAt ?? null;
              const existingExpiresAt: string | null = state.expiresAt ?? null;

              if (currentPlan === "Free") {
                // Already free — nothing to do
                console.log("ℹ️ [IAP] No active subscription (user is Free)");
              } else {
                // User has a Pro/Business plan in Redux.
                // Check if their Firebase purchasedAt / expiresAt is still valid
                // — this indicates a live Stripe subscription.
                const stripeStillActive = existingExpiresAt
                  ? new Date() <= new Date(existingExpiresAt)   // Stripe wrote a real expiry
                  : !isPlanExpired(existingPurchasedAt);        // Fallback: 30-day window

                if (stripeStillActive) {
                  // Stripe subscription is still within the billing window — keep plan
                  console.log(
                    `ℹ️ [IAP] No App Store sub, but Stripe purchasedAt is still valid ` +
                    `(${existingPurchasedAt}). Keeping plan: ${currentPlan}`,
                  );
                } else {
                  // Subscription has expired on both IAP and Stripe/Firebase.
                  // We intentionally do NOT downgrade the Redux plan to "Free".
                  // The plan badge stays as Pro/Business so the user knows their tier.
                  // Access to AI chat and caption generation is already blocked via
                  // usePlanStatus().isExpired === true → effectivePlan === "Free" →
                  // canAccessPro === false in ai.tsx, createPost.tsx, postPreview.tsx.
                  console.warn(
                    `⚠️ [IAP] Subscription expired for plan: ${currentPlan}. ` +
                    `Plan badge kept — feature access blocked via usePlanStatus.isExpired.`,
                  );
                }
              }

            }
          }
        } catch (iapErr) {
          console.warn("⚠️ [IAP] Subscription check error (non-fatal):", iapErr);
        }
        // ─────────────────────────────────────────────────────────────────
      } catch (error) {
        console.error("Error fetching Firebase data:", error);
      }
    };

    fetchData();
  }, [email, isLoggedIn]);

  return null;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Questrial_400Regular,
    Inter_600SemiBold,
    Inter_400Regular,
  });
  const [assetsReady, setAssetsReady] = useState(false);
  const [isInternetConnected, setIsInternetConnected] = useState<
    boolean | null
  >(null);
  const hasHiddenSplashRef = useRef(false);
  const isAppReady =
    (loaded || error) && assetsReady && isInternetConnected !== null;

  useEffect(() => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsInternetConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Preload assets once on mount
  useEffect(() => {
    async function preloadAssets() {
      try {
        await Asset.loadAsync(PRELOAD_ASSETS);
      } catch (e) {
        console.warn(e);
      } finally {
        setAssetsReady(true);
      }
    }

    async function requestPermissionsOnStartup() {
      try {
        const hasRequestedBefore = await AsyncStorage.getItem(
          "push_permission_requested",
        );
        if (!hasRequestedBefore) {
          console.log(
            "🔐 Requesting notification permissions on first launch...",
          );
          await requestNotificationPermission();
          await AsyncStorage.setItem("push_permission_requested", "true");
        }
      } catch (error) {
        console.error("Error requesting permissions on startup:", error);
      }
    }

    preloadAssets();
    requestPermissionsOnStartup();
    store.dispatch(initializeUser());
  }, []);

  const onLayoutRootView = useCallback(() => {
    if (!isAppReady || hasHiddenSplashRef.current) {
      return;
    }

    hasHiddenSplashRef.current = true;
    SplashScreen.hideAsync().catch((splashError) => {
      console.warn("Failed to hide splash screen:", splashError);
    });
  }, [isAppReady]);

  if (!isAppReady) {
    return null;
  }

  // Handle Offline UI
  if (isInternetConnected === false) {
    return (
      <View
        onLayout={onLayoutRootView}
        style={{ flex: 1, backgroundColor: "#000" }}
      >
        <NoInternet onRetry={() => NetInfo.fetch()} />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <NotificationProvider>
        <ErrorBoundary>
          <FirebaseDataFetcher />
          <UserActivityDetector>
            <View
              onLayout={onLayoutRootView}
              style={{ flex: 1, backgroundColor: "#000" }}
            >
              <StatusBar
                style="light"
                translucent
                backgroundColor="transparent"
              />

              <View style={{ flex: 1 }}>
                <Image
                  source={require("../assets/images/background.png")}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: "100%",
                    height: "100%",
                  }}
                  resizeMode="cover"
                />
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: {
                      backgroundColor: "transparent",
                    },
                    animation: "none",
                  }}
                />
              </View>
              <NotificationModal />
              <Toast config={toastConfig} />
            </View>
          </UserActivityDetector>
        </ErrorBoundary>
      </NotificationProvider>
    </Provider>
  );
}
