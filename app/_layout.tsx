import { Inter_400Regular, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { Questrial_400Regular } from "@expo-google-fonts/questrial";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { toastConfig } from "../components/common/CustomToast";
import NotificationModal from "../components/common/NotificationModal";
import { NotificationProvider } from "../context/NotificationContext";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Questrial_400Regular,
    Inter_600SemiBold,
    Inter_400Regular,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <NotificationProvider>
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <StatusBar
          style="light"
          translucent
          backgroundColor="transparent"
        />

        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: 'transparent',
            },
            animation: 'none'
          }}
        />
        <NotificationModal />
        <Toast config={toastConfig} />
      </View>
    </NotificationProvider>
  );
}
