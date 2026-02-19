import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { initializeFirebase, listenToUserData } from "../services/firebase";
import storageService from "../services/storage";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = await storageService.getToken();
      setHasToken(!!token);

      // Initialize Firebase and set up listener if user is logged in
      if (token) {
        const email = await storageService.getEmail();
        if (email) {
          initializeFirebase();
          listenToUserData(
            email,
            (userData) => {
              if (userData) {
                console.log("Firebase data loaded on app open:", userData);
              }
            },
            (error) => {
              console.error("Firebase listener error on app open:", error);
            },
          );
        }
      }

      setLoading(false);
    };
    checkToken();
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
        <ActivityIndicator size="large" color="#00DC82" />
      </View>
    );
  }

  return <Redirect href={hasToken ? "/(tabs)/home" : "/login"} />;
}
