import { AntDesign } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Check, Eye, EyeOff } from "lucide-react-native";
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
import { setRegistrationBuffer } from "../../store/userSlice";

export default function SignupForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({
    fullName: "",
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: "",
  });

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    let isValid = true;
    const newErrors = {
      fullName: "",
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: "",
    };

    if (!fullName.trim()) {
      newErrors.fullName = "Full Name is required";
      isValid = false;
    }

    if (!userName.trim()) {
      newErrors.userName = "Username is required";
      isValid = false;
    }

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
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    if (!acceptedTerms) {
      newErrors.terms = "You must accept the Privacy Policy and Terms";
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      try {
        setLoading(true);
        // Store data temporarily and move to onboarding
        dispatch(
          setRegistrationBuffer({
            fullName,
            userName,
            email,
            password,
            checkbox: true,
          }),
        );

        setLoading(false);
        router.replace("/onboarding");
      } catch (error) {
        setLoading(false);
        Toast.show({
          type: "error",
          text1: "Setup Failed",
          text2: "Something went wrong. Please try again.",
        });
      }
    }
  };

  const handleOpenLink = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.error("Error opening link:", error);
    }
  };

  return (
    <View className="flex-1 justify-center gap-5 mb-5">
      {/* Logo */}
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
          Create
        </Text>
        <Text
          style={styles.heading}
          className="text-white font-normal text-center"
        >
          account
        </Text>
      </View>

      {/* Signup Card */}
      <View
        style={{
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.45,
          shadowRadius: 24,
          elevation: 10,
        }}
        className="w-full rounded-[20px] bg-[#FFFFFF1A] overflow-hidden mb-4"
      >
        <BlurView intensity={20} tint="light" className="p-6 gap-4">
          {/* Gradient Border SVG Overlay */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg height="120%" width="100%">
              <Defs>
                <SvgLinearGradient
                  id="signupBorderGrad"
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
                stroke="url(#signupBorderGrad)"
                strokeWidth="1"
                fill="transparent"
              />
            </Svg>
          </View>

          {/* Full Name Field */}
          <View>
            <Text className="text-white font-semibold mb-2 ml-1 px-1 text-sm">
              Full Name
            </Text>
            <View className="overflow-hidden rounded-[20px]">
              <BlurView intensity={20} tint="light">
                <TextInput
                  placeholder="John Doe"
                  placeholderTextColor="#ffffff80"
                  style={styles.input}
                  className="w-full h-[48px] px-4 py-0 text-white"
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    if (errors.fullName) setErrors({ ...errors, fullName: "" });
                  }}
                />
              </BlurView>
            </View>
            {errors.fullName ? (
              <Text className="text-red-500 text-xs ml-2 mt-1">
                {errors.fullName}
              </Text>
            ) : null}
          </View>

          {/* Username Field */}
          <View>
            <Text className="text-white font-semibold mb-2 ml-1 px-1 text-sm">
              Username
            </Text>
            <View className="overflow-hidden rounded-[20px]">
              <BlurView intensity={20} tint="light">
                <TextInput
                  placeholder="johndoe"
                  placeholderTextColor="#ffffff80"
                  style={styles.input}
                  className="w-full h-[48px] px-4 py-0 text-white"
                  value={userName}
                  onChangeText={(text) => {
                    setUserName(text);
                    if (errors.userName) setErrors({ ...errors, userName: "" });
                  }}
                  autoCapitalize="none"
                />
              </BlurView>
            </View>
            {errors.userName ? (
              <Text className="text-red-500 text-xs ml-2 mt-1">
                {errors.userName}
              </Text>
            ) : null}
          </View>

          {/* Email Field */}
          <View>
            <Text className="text-white font-semibold mb-2 ml-1 px-1 text-sm">
              Email
            </Text>
            <View className="overflow-hidden rounded-[20px]">
              <BlurView intensity={20} tint="light">
                <TextInput
                  placeholder="email@gmail.com"
                  placeholderTextColor="#ffffff80"
                  style={styles.input}
                  className="w-full h-[48px] px-4 py-0 text-white"
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
              <Text className="text-red-500 text-xs ml-2 mt-1">
                {errors.email}
              </Text>
            ) : null}
          </View>

          {/* Password Field */}
          <View>
            <Text className="text-white font-semibold mb-2 ml-1 px-1 text-sm">
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
                  className="flex-1 h-[48px] px-4 py-0 text-white"
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
                    <Eye size={18} color="#FFFFFF80" />
                  ) : (
                    <EyeOff size={18} color="#FFFFFF80" />
                  )}
                </TouchableOpacity>
              </BlurView>
            </View>
            {errors.password ? (
              <Text className="text-red-500 text-xs ml-2 mt-1">
                {errors.password}
              </Text>
            ) : null}
          </View>

          {/* Confirm Password Field */}
          <View>
            <Text className="text-white font-semibold mb-2 ml-1 px-1 text-sm">
              Confirm Password
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
                  secureTextEntry={!showConfirmPassword}
                  style={styles.input}
                  className="flex-1 h-[48px] px-4 py-0 text-white"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword)
                      setErrors({ ...errors, confirmPassword: "" });
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <Eye size={18} color="#FFFFFF80" />
                  ) : (
                    <EyeOff size={18} color="#FFFFFF80" />
                  )}
                </TouchableOpacity>
              </BlurView>
            </View>
            {errors.confirmPassword ? (
              <Text className="text-red-500 text-xs ml-2 mt-1">
                {errors.confirmPassword}
              </Text>
            ) : null}
          </View>

          {/* Terms and Conditions Checkbox */}
          <View className="mt-2">
            <TouchableOpacity
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              className="flex-row items-center gap-3 px-1"
              activeOpacity={1}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  borderWidth: 2,
                  borderColor: acceptedTerms ? "#3b82f6" : "rgba(255, 255, 255, 0.3)",
                  backgroundColor: acceptedTerms ? "#3b82f6" : "transparent",
                }}
                className="items-center justify-center"
              >
                {acceptedTerms && <Check size={14} color="white" />}
              </View>
              <View className="flex-1">
                <Text className="text-white/70 text-xs leading-5">
                  I agree to the{" "}
                  <Text
                    className="text-blue-400 font-semibold underline"
                    onPress={() => handleOpenLink("https://sosh.digital/terms-and-conditions")}
                  >
                    Terms and Conditions
                  </Text>{" "}
                  and{" "}
                  <Text
                    className="text-blue-400 font-semibold underline"
                    onPress={() => handleOpenLink("https://sosh.digital/privacy-policy")}
                  >
                    Privacy Policy
                  </Text>
                </Text>
              </View>
            </TouchableOpacity>
            {errors.terms ? (
              <Text className="text-red-500 text-[10px] ml-8 mt-1 italic">
                {errors.terms}
              </Text>
            ) : null}
          </View>
        </BlurView>
      </View>

      {/* Signup Button */}
      <TouchableOpacity
        className="w-full h-14 overflow-hidden rounded-full"
        onPress={handleSignup}
        disabled={!acceptedTerms}
        style={{ opacity: acceptedTerms ? 1 : 0.6 }}
      >
        <ImageBackground
          source={require("../../assets/images/post_without.jpg")}
          className="w-full h-full items-center justify-center"
          resizeMode="cover"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text className="text-white font-semibold text-lg">
              Create account
            </Text>
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
          onPress={() => { }}
        >
          <AntDesign name="google" size={20} color="white" />
          <Text className="text-white font-medium">Sign up with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 h-12 rounded-full border border-white/20 flex-row items-center justify-center gap-3 bg-white/5"
          onPress={() => { }}
        >
          <AntDesign name="apple" size={20} color="white" />
          <Text className="text-white font-medium">Sign up with Apple</Text>
        </TouchableOpacity>
      </View>

      {/* Login Link */}
      <View className="flex-row justify-center items-center mt-4">
        <Text className="text-white/40 text-sm">Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text className="text-white font-semibold text-sm underline">
            Sign in
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
