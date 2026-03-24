import { BlurView } from "expo-blur";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import {
    ActivityIndicator,
    Image,
    ImageBackground,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import Svg, {
    Defs,
    Rect,
    Stop,
    LinearGradient as SvgLinearGradient,
} from "react-native-svg";
import Toast from "react-native-toast-message";
import { FontFamily, FontSize, normalize } from "../constants/Fonts";
import authService from "../services/api/auth";

export default function ResetPasswordConfirmationScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!code || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (!email) {
        setError("Email is missing. Please go back.");
        return;
      }

      await authService.resetPassword({
        email,
        otp: parseInt(code, 10),
        newPassword,
        cnfPassword: confirmPassword,
      });

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Password has been reset successfully.",
      });

      setTimeout(() => {
        router.replace("/login");
      }, 2000);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to reset password.";
      setError(errorMessage);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (email) {
      try {
        await authService.forgotPassword(email);
        Toast.show({
          type: "success",
          text1: "Code Sent",
          text2: "A new verification code has been sent to your email.",
        });
      } catch (err) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to resend code.",
        });
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <ImageBackground
          source={require("../assets/images/background.png")}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            height: "100%",
          }}
          resizeMode="cover"
        />
        <SafeAreaView className="flex-1">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <View className="flex-1 px-6">
              <TouchableOpacity
                onPress={() => router.back()}
                className="mt-4 w-10 h-10 items-center justify-center rounded-full bg-white/10"
              >
                <ChevronLeft color="white" size={24} />
              </TouchableOpacity>

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
                    source={require("../assets/images/logo.png")}
                    style={{ width: normalize(54), height: normalize(54) }}
                    resizeMode="contain"
                  />
                </View>

                {/* Title Text */}
                <View className="items-center">
                  <Text
                    style={styles.heading}
                    className="text-white font-light text-center"
                  >
                    Reset
                  </Text>
                  <Text
                    style={styles.heading}
                    className="text-white font-normal text-center"
                  >
                    Password
                  </Text>
                </View>

                {/* Card */}
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
                    <View style={StyleSheet.absoluteFill} pointerEvents="none">
                      <Svg height="100%" width="100%">
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
                          height="99.7%"
                          rx="20"
                          ry="20"
                          stroke="url(#loginBorderGrad)"
                          strokeWidth="1"
                          fill="transparent"
                        />
                      </Svg>
                    </View>

                    {/* Verification Code Input */}
                    <View>
                      <Text className="text-white font-semibold mb-4 ml-1 px-1 text-sm leading-7">
                        Verification Code
                      </Text>
                      <View className="overflow-hidden rounded-[20px]">
                        <BlurView intensity={20} tint="light">
                          <TextInput
                            placeholder="Enter 6-digit code"
                            placeholderTextColor="#ffffff80"
                            style={styles.input}
                            className="w-full h-[44px] px-4 py-0 text-white"
                            value={code}
                            onChangeText={setCode}
                            keyboardType="number-pad"
                          />
                        </BlurView>
                      </View>
                    </View>

                    {/* New Password Input */}
                    <View>
                      <Text className="text-white font-semibold mb-4 ml-1 px-1 text-sm leading-7">
                        New Password
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
                            value={newPassword}
                            onChangeText={setNewPassword}
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
                    </View>

                    {/* Confirm Password Input */}
                    <View>
                      <Text className="text-white font-semibold mb-4 ml-1 px-1 text-sm leading-7">
                        Confirm New Password
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
                            className="flex-1 h-[44px] px-4 py-0 text-white"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                          />
                          <TouchableOpacity
                            onPress={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? (
                              <Eye size={15} color="#FFFFFF80" />
                            ) : (
                              <EyeOff size={15} color="#FFFFFF80" />
                            )}
                          </TouchableOpacity>
                        </BlurView>
                      </View>
                    </View>

                    {error ? (
                      <Text className="text-red-500 text-xs ml-2 font-medium">
                        {error}
                      </Text>
                    ) : null}
                  </BlurView>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  className="w-full h-14 overflow-hidden rounded-full"
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  <ImageBackground
                    source={require("../assets/images/post_without.jpg")}
                    className="w-full h-full items-center justify-center"
                    resizeMode="cover"
                  >
                    <View className="absolute inset-0" />
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text className="text-white font-semibold text-lg">
                        Reset Password
                      </Text>
                    )}
                  </ImageBackground>
                </TouchableOpacity>

                <View className="items-center mt-6 gap-4">
                  <TouchableOpacity onPress={handleResendCode}>
                    <Text className="text-white/60 font-inter text-sm">
                      Didn't receive code?{" "}
                      <Text className="text-white font-semibold underline">
                        Resend Code
                      </Text>
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => router.replace("/login")}>
                    <Text className="text-white/60 font-inter">
                      Back to{" "}
                      <Text className="text-white font-semibold">Sign In</Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontFamily: FontFamily.questrial,
    fontSize: FontSize.heading,
    lineHeight: 56,
  },
  input: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.body,
    letterSpacing: -0.89,
    textAlignVertical: "center",
    includeFontPadding: false,
  },
});
