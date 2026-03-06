import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ImageBackground } from "react-native";
import { initializeFirebase } from "../services/firebase";
import storageService from "../services/storage";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = await storageService.getToken();
      setHasToken(!!token);

      // Initialize Firebase if user is logged in
      // The listener will be set up in _layout.tsx
      if (token) {
        initializeFirebase();
      }

      setLoading(false);
    };
    checkToken();
  }, []);

  if (loading) {
    return (
      <ImageBackground
        source={require("../assets/images/background.png")}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        resizeMode="cover"
      >
        <Image
          source={require("../assets/images/logo.png")}
          style={{ width: 80, height: 80, marginBottom: 32 }}
          resizeMode="contain"
        />
        <ActivityIndicator size="small" color="rgba(255,255,255,0.5)" />
      </ImageBackground>
    );
  }

  return <Redirect href={hasToken ? "/(tabs)/home" : "/login"} />;
}
