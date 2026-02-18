import { Inter_400Regular, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { Questrial_400Regular } from "@expo-google-fonts/questrial";
import { Asset } from 'expo-asset';
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ImageBackground, View } from "react-native";
import Toast from "react-native-toast-message";
import { Provider } from 'react-redux';
import { toastConfig } from "../components/common/CustomToast";
import NotificationModal from "../components/common/NotificationModal";
import { NotificationProvider } from "../context/NotificationContext";
import "../global.css";
import { store } from '../store/store';
import { initializeUser } from '../store/userSlice';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Questrial_400Regular,
    Inter_600SemiBold,
    Inter_400Regular,
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Preload all essential icons and images to prevent loading delays
        await Asset.loadAsync([
          require('../assets/images/background.png'),
          require('../assets/icons/instagram.png'),
          require('../assets/icons/tiktok.png'),
          require('../assets/icons/facebook.png'),
          require('../assets/icons/youtube.png'),
          require('../assets/icons/snapchat.png'),
          require('../assets/icons/twitter.png'),
          require('../assets/icons/edit.png'),
          require('../assets/icons/delete.png'),
          require('../assets/icons/chat.png'),
          require('../assets/icons/chat_ai.png'),
          require('../assets/icons/send-msg.png'),
          require('../assets/icons/menu.png'),
          require('../assets/icons/connect.png'),
          require('../assets/icons/disconnect.png'),
          require('../assets/icons/nav_user.png'),
          require('../assets/icons/nav_home.png'),
          require('../assets/icons/nav_ai.png'),
          require('../assets/icons/nav_chart.png'),
          require('../assets/icons/nav_center.png'),
          require('../assets/images/logo.png'),
          require('../assets/images/notification.png'),
          require('../assets/images/avtar.png'),
          require('../assets/images/button-bg.png'),
        ]);

        if (loaded || error) {
          await SplashScreen.hideAsync();
        }
      } catch (e) {
        console.warn(e);
      }
    }

    prepare();
    // Initialize user data from storage into Redux
    store.dispatch(initializeUser());
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <Provider store={store}>
      <NotificationProvider>
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          <StatusBar
            style="light"
            translucent
            backgroundColor="transparent"
          />

          <ImageBackground
            source={require('../assets/images/background.png')}
            style={{ flex: 1 }}
            resizeMode="cover"
          >
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: {
                  backgroundColor: 'transparent',
                },
                animation: 'none'
              }}
            />
          </ImageBackground>
          <NotificationModal />
          <Toast config={toastConfig} />
        </View>
      </NotificationProvider>
    </Provider>
  );
}
