import { AntDesign } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, {
  Defs,
  Rect,
  Stop,
  LinearGradient as SvgLinearGradient,
} from "react-native-svg";
import Toast from "react-native-toast-message";
import { useDispatch } from "react-redux";
import { FontFamily, FontSize, normalize } from "../../constants/Fonts";
import { useNotification } from "../../context/NotificationContext";
import authService from "../../services/api/auth";
import chatService from "../../services/api/chat";
import {
  getCurrentUserData,
  initializeFCM,
  initializeFirebase,
} from "../../services/firebase";
import storageService from "../../services/storage";
import { clearUserData, setUserData } from "../../store/userSlice";

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });

  const [loading, setLoading] = useState(false);

  const { addNotification } = useNotification();
  const dispatch = useDispatch();

  const handleLogin = async () => {
    let isValid = true;
    const newErrors = { email: "", password: "" };

    if (!email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email address";
      isValid = false;
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      try {
        setLoading(true);
        // API Call
        const response: any = await authService.login({ email, password });

        if (response.token) {
          // On Success
          addNotification({
            type: "success",
            title: "Login Successful",
            message: "Welcome back! 👋",
          });

          Toast.show({
            type: "success",
            text1: "Login Successful",
            text2: "Welcome back! 👋",
          });

          // Save token to storage
          if (response.token) {
            console.log("Saving token:", response.token);
            // Clear old user session first
            dispatch(clearUserData());

            await storageService.setToken(response.token);

            try {
              const decoded: any = jwtDecode(response.token);
              if (decoded.userName) {
                console.log("Saving username:", decoded.userName);
                await storageService.setUsername(decoded.userName);
              }
              if (response.profilePicture) {
                console.log("Saving profile picture data");
                await storageService.setProfilePicture(response.profilePicture);
              }
              if (decoded.email) {
                console.log("Saving email data:", decoded.email);
                await storageService.setEmail(decoded.email);

                // Fetch conversations after a short delay to ensure
                // token + email are fully committed to storage first
                const emailForConversations = decoded.email;
                setTimeout(async () => {
                  try {
                    console.log("Fetching conversations (delayed)...");
                    await chatService.getConversations(emailForConversations);
                    console.log("Conversations pre-fetched successfully");
                  } catch (error) {
                    console.error("Error fetching conversations:", error);
                  }
                }, 1500);
              }

              // Update global Redux state for reactive UI
              dispatch(
                setUserData({
                  userName: decoded.userName?.trim(),
                  email: decoded.email,
                  profilePicture: response.profilePicture,
                  subscription: {
                    plan: decoded.subscription || "Free",
                    isSubscribed: !!decoded.subscription && decoded.subscription !== "Free",
                  },
                }),
              );

              // Initialize Firebase and fetch user data
              if (decoded.email) {
                try {
                  initializeFirebase();
                  // --- FCM Setup ---
                  initializeFCM().catch((fcmError) => {
                    console.error("❌ FCM Setup error:", fcmError);
                  });

                  const firebaseData = (await getCurrentUserData(
                    decoded.email,
                  )) as any;
                  if (firebaseData?.aiAdditions) {
                    dispatch(
                      setUserData({ aiAdditions: firebaseData.aiAdditions }),
                    );
                    console.log("✅ aiAdditions loaded on login");
                  }
                } catch (firebaseError) {
                  console.error("Error fetching Firebase data:", firebaseError);
                }
              }
            } catch (decodeError) {
              console.error("Error decoding token:", decodeError);
            }
          }

          // Ensure proper navigation based on response
          router.replace("/(tabs)/home");
        } else {
          // Handle case where API didn't return success/token
          addNotification({
            type: "error",
            title: "Login Failed",
            message: response.message || "Invalid credentials",
          });

          Toast.show({
            type: "error",
            text1: "Login Failed",
            text2: response.message || "Invalid credentials",
          });
        }
      } catch (error: any) {
        // On Error
        const errorMessage =
          error.response?.data?.message ||
          "Invalid credentials or network error";

        addNotification({
          type: "error",
          title: "Login Failed",
          message: errorMessage,
        });

        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View className="flex-1 justify-center gap-5 mb-5">
      {/* Logo between text - matching user's requested size (54) */}
      <View
        style={{
          width: normalize(54),
          height: normalize(54),
          marginVertical: 4,
        }}
        className="items-center justify-center self-center"
      >
        <Image
          source={require("../../assets/images/logo.png")}
          style={{ width: normalize(54), height: normalize(54) }}
          resizeMode="contain"
        />
      </View>

      {/* Welcome Text */}
      <View className="items-center">
        <Text
          style={styles.heading}
          className="text-white font-light text-center"
        >
          Welcome
        </Text>
        <Text
          style={styles.heading}
          className="text-white font-normal text-center"
        >
          back!
        </Text>
      </View>

      {/* Login Card */}
      <View
        style={{
          shadowColor: "#000000",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.45,
          shadowRadius: 24,
          elevation: 10,
        }}
        className="w-full rounded-[20px] bg-[#FFFFFF1A] overflow-hidden mb-7"
      >
        <BlurView intensity={20} tint="light" className="p-6 gap-4">
          {/* Gradient Border SVG Overlay (Taller to hide bottom stroke) */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg height="120%" width="100%">
              <Defs>
                <SvgLinearGradient
                  id="loginBorderGrad"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <Stop
                    offset="0%"
                    stopColor="rgba(255, 255, 255, 0.7)"
                    stopOpacity="1"
                  />
                  <Stop
                    offset="100%"
                    stopColor="rgba(0, 0, 0, 0.7)"
                    stopOpacity="1"
                  />
                </SvgLinearGradient>
              </Defs>
              <Rect
                x="0.5"
                y="0.5"
                width="99.7%"
                height="100%"
                rx="20"
                ry="20"
                stroke="url(#loginBorderGrad)"
                strokeWidth="1"
                fill="transparent"
              />
            </Svg>
          </View>

          <View>
            <Text className="text-white font-semibold mb-4 ml-1 px-1 text-sm leading-7">
              Email
            </Text>
            <View className="overflow-hidden rounded-[20px]">
              <BlurView intensity={20} tint="light">
                <TextInput
                  placeholder="email@gmail.com"
                  placeholderTextColor="#ffffff80"
                  style={styles.input}
                  className="w-full h-[44px] px-4 py-0 text-white"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </BlurView>
            </View>
            {errors.email ? (
              <Text className="text-red-500 text-xs ml-2 mt-1 font-medium">
                {errors.email}
              </Text>
            ) : null}
          </View>

          <View>
            <Text className="text-white font-semibold mb-4 ml-1 px-1 text-sm leading-7">
              Password
            </Text>
            <View className="overflow-hidden rounded-[20px]">
              <BlurView
                intensity={20}
                tint="light"
                className="flex-row items-center pr-4"
              >
                <TextInput
                  placeholder="*********"
                  placeholderTextColor="#FFFFFF80"
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  className="flex-1 h-[44px] px-4 py-0 text-white"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <Eye size={15} color="#FFFFFF80" />
                  ) : (
                    <EyeOff size={15} color="#FFFFFF80" />
                  )}
                </TouchableOpacity>
              </BlurView>
            </View>
            {errors.password ? (
              <Text className="text-red-500 text-xs ml-2 mt-1 font-medium">
                {errors.password}
              </Text>
            ) : null}
          </View>

          <TouchableOpacity
            className="w-full items-start"
            onPress={() => router.push("/forgot-password")}
          >
            <Text className="text-white text-xs underline mx-2 px-1">
              Forgot password?
            </Text>
          </TouchableOpacity>
        </BlurView>
      </View>

      {/* Login Button */}
      <TouchableOpacity
        className="w-full h-14 overflow-hidden rounded-full"
        onPress={handleLogin}
      >
        <ImageBackground
          source={require("../../assets/images/post_without.jpg")}
          className="w-full h-full items-center justify-center"
          resizeMode="cover"
        >
          <View className="absolute inset-0" />
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text className="text-white font-semibold text-lg">Sign in</Text>
          )}
        </ImageBackground>
      </TouchableOpacity>

      {/* Divider */}
      <View className="flex-row items-center my-2">
        <View className="flex-1 h-[1px] bg-white/20" />
        <Text className="text-white/40 px-4 text-xs font-medium">OR</Text>
        <View className="flex-1 h-[1px] bg-white/20" />
      </View>

      {/* Social Logins */}
      <View className="flex-row gap-4 justify-between">
        <TouchableOpacity
          className="flex-1 h-12 rounded-full border border-white/20 flex-row items-center justify-center gap-3 bg-white/5"
          onPress={() => {
            /* Google login logic */
          }}
        >
          <AntDesign name="google" size={20} color="white" />
          <Text className="text-white font-medium">Sign in with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 h-12 rounded-full border border-white/20 flex-row items-center justify-center gap-3 bg-white/5"
          onPress={() => {
            /* Apple login logic */
          }}
        >
          <AntDesign name="apple" size={20} color="white" />
          <Text className="text-white font-medium">Sign in with Apple</Text>
        </TouchableOpacity>
      </View>

      {/* Signup Link */}
      <View className="flex-row justify-center items-center mt-4">
        <Text className="text-white/40 text-sm">Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/signup")}>
          <Text className="text-white font-semibold text-sm underline">
            Sign up
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontFamily: FontFamily.questrial,
    fontSize: FontSize.heading,
    // lineHeight: normalize(64),
    // includeFontPadding: false,
  },
  input: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.body,
    letterSpacing: -0.89,
    textAlignVertical: "center",
    includeFontPadding: false,
  },
});
