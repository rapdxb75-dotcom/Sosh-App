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
import "../global.css";
import {
  getCurrentUserData,
  initializeFCM,
  initializeFirebase,
  requestNotificationPermission,
} from "../services/firebase";
import { store, type RootState } from "../store/store";
import { initializeUser, updateUser } from "../store/userSlice";
import { initializeErrorHandler } from "../utils/errorHandler";
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
        </ErrorBoundary>
      </NotificationProvider>
    </Provider>
  );
}
