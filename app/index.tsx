import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { initializeFirebase } from "../services/firebase";
import storageService from "../services/storage";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await storageService.getToken();
        setHasToken(!!token);

        // Initialize Firebase if user is logged in.
        // The listener will be set up in _layout.tsx.
        if (token) {
          initializeFirebase();
        }
      } catch (tokenError) {
        console.error("Error checking auth token:", tokenError);
        setHasToken(false);
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="small" color="rgba(255,255,255,0.5)" />
      </View>
    );
  }

  return <Redirect href={hasToken ? "/(tabs)/home" : "/welcome"} />;
}
