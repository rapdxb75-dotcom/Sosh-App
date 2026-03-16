import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, View } from "react-native";
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
        <Image
          source={require("../assets/images/background.png")}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}
          resizeMode="cover"
        />
        <Image
          source={require("../assets/images/logo.png")}
          style={{ width: 80, height: 80, marginBottom: 32 }}
          resizeMode="contain"
        />
        <ActivityIndicator size="small" color="rgba(255,255,255,0.5)" />
      </View>
    );
  }

  return <Redirect href={hasToken ? "/(tabs)/home" : "/login"} />;
}
