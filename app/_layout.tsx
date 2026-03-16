import { Inter_400Regular, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { Questrial_400Regular } from "@expo-google-fonts/questrial";
import { Asset } from "expo-asset";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { Image, View } from "react-native";
import Toast from "react-native-toast-message";
import { Provider, useSelector } from "react-redux";
import { toastConfig } from "../components/common/CustomToast";
import NotificationModal from "../components/common/NotificationModal";
import { NotificationProvider } from "../context/NotificationContext";
import "../global.css";
import { getCurrentUserData, initializeFirebase } from "../services/firebase";
import { store, type RootState } from "../store/store";
import { initializeUser, updateUser } from "../store/userSlice";

SplashScreen.preventAutoHideAsync();

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
        console.log("Fetching Firebase data once for:", email);
        initializeFirebase();
        const userData = (await getCurrentUserData(email)) as any;

        if (userData?.aiAdditions) {
          store.dispatch(updateUser({ aiAdditions: userData.aiAdditions }));
          console.log("✅ aiAdditions loaded from Firebase");
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

  // Preload assets once on mount
  useEffect(() => {
    async function preloadAssets() {
      try {
        await Asset.loadAsync([
          require("../assets/images/background.png"),
          require("../assets/icons/instagram.png"),
          require("../assets/icons/tiktok.png"),
          require("../assets/icons/facebook.png"),
          require("../assets/icons/youtube.png"),
          require("../assets/icons/snapchat.png"),
          require("../assets/icons/twitter.png"),
          require("../assets/icons/edit.png"),
          require("../assets/icons/delete.png"),
          require("../assets/icons/chat.png"),
          require("../assets/icons/chat_ai.png"),
          require("../assets/icons/send-msg.png"),
          require("../assets/icons/menu.png"),
          require("../assets/icons/connect.png"),
          require("../assets/icons/disconnect.png"),
          require("../assets/icons/nav_user.png"),
          require("../assets/icons/nav_home.png"),
          require("../assets/icons/nav_ai.png"),
          require("../assets/icons/nav_chart.png"),
          require("../assets/icons/nav_center.png"),
          require("../assets/images/logo.png"),
          require("../assets/images/notification.png"),
          require("../assets/images/avtar.png"),
          require("../assets/images/button-bg.png"),
        ]);
      } catch (e) {
        console.warn(e);
      } finally {
        setAssetsReady(true);
      }
    }

    preloadAssets();
    store.dispatch(initializeUser());
  }, []);

  // Hide splash only after both fonts and assets are ready
  useEffect(() => {
    if ((loaded || error) && assetsReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error, assetsReady]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <Provider store={store}>
      <NotificationProvider>
        <FirebaseDataFetcher />
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          <StatusBar style="light" translucent backgroundColor="transparent" />

          <View style={{ flex: 1 }}>
            <Image
              source={require("../assets/images/background.png")}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}
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
      </NotificationProvider>
    </Provider>
  );
}
