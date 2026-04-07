import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { initializeFirebase } from "../services/firebase";
import storageService from "../services/storage";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const [token, hasLaunched] = await Promise.all([
          storageService.getToken(),
          storageService.getHasLaunched(),
        ]);

        setHasToken(!!token);
        setIsFirstLaunch(!hasLaunched);

        // Initialize Firebase if user is logged in.
        // The listener will be set up in _layout.tsx.
        if (token) {
          initializeFirebase();
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        setHasToken(false);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="small" color="rgba(255,255,255,0.5)" />
      </View>
    );
  }

  // If first time opening app: Welcome Page
  if (isFirstLaunch) {
    return <Redirect href="/welcome" />;
  }

  // Not first time: Home if logged in, otherwise Login
  return <Redirect href={hasToken ? "/(tabs)/home" : "/login"} />;
}
