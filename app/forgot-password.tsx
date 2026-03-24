import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
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
import { FontFamily, FontSize, normalize } from "../constants/Fonts";
import authService from "../services/api/auth";

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleResetPassword = async () => {
        if (!email.trim()) {
            setError("Email is required");
            return;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setError("Invalid email address");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response: any = await authService.forgotPassword(email);

            Toast.show({
                type: "success",
                text1: "Request Sent",
                text2:
                    response.message || "Check your email for the verification code.",
            });

            // Navigate to Reset Password Confirmation screen with email parameter
            setTimeout(() => {
                router.push({
                    pathname: "/reset-password-confirmation",
                    params: { email: email.trim() },
                });
            }, 1500);
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message ||
                "Failed to send reset link. Please try again.";
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

    return (
        <ImageBackground
            source={require("../assets/images/background.png")}
            style={{ flex: 1 }}
            className="flex-1 bg-black"
        >
            <View className="flex-1 px-5 justify-center">
                {/* Back Button */}
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="absolute top-12 left-5 z-10 w-10 h-10 items-center justify-center rounded-full bg-white/10"
                >
                    <ChevronLeft color="white" size={24} />
                </TouchableOpacity>

                <View className="items-center mb-8">
                    <View
                        style={{
                            width: normalize(64),
                            height: normalize(64),
                            marginBottom: 16,
                        }}
                        className="items-center justify-center"
                    >
                        <Image
                            source={require("../assets/images/logo.png")}
                            style={{ width: normalize(64), height: normalize(64) }}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.heading} className="text-white text-center">
                        Forgot{"\n"}Password
                    </Text>
                    <Text className="text-white/60 text-center mt-4 font-inter">
                        Enter your email address and we'll send you a link to reset your
                        password.
                    </Text>
                </View>

                {/* Form Card */}
                <View
                    style={{
                        shadowColor: "#000000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.45,
                        shadowRadius: 24,
                        elevation: 10,
                    }}
                    className="w-full rounded-[24px] bg-[#FFFFFF1A] overflow-hidden mb-8"
                >
                    <BlurView intensity={20} tint="light" className="p-6">
                        <View style={StyleSheet.absoluteFill} pointerEvents="none">
                            <Svg height="100%" width="100%">
                                <Defs>
                                    <SvgLinearGradient
                                        id="borderGrad"
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
                                    rx="24"
                                    ry="24"
                                    stroke="url(#borderGrad)"
                                    strokeWidth="1"
                                    fill="transparent"
                                />
                            </Svg>
                        </View>

                        <Text className="text-white font-semibold mb-3 ml-1 text-sm">
                            Email Address
                        </Text>
                        <View className="overflow-hidden rounded-[16px]">
                            <BlurView intensity={20} tint="light">
                                <TextInput
                                    placeholder="yourname@email.com"
                                    placeholderTextColor="#ffffff80"
                                    style={styles.input}
                                    className="w-full h-12 px-4 text-white"
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        if (error) setError("");
                                    }}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </BlurView>
                        </View>
                        {error ? (
                            <Text className="text-red-500 text-xs ml-2 mt-2 font-medium">
                                {error}
                            </Text>
                        ) : null}
                    </BlurView>
                </View>

                {/* Action Button */}
                <TouchableOpacity
                    className="w-full h-14 overflow-hidden rounded-full shadow-lg"
                    onPress={handleResetPassword}
                    disabled={loading}
                >
                    <ImageBackground
                        source={require("../assets/images/post_without.jpg")}
                        className="w-full h-full items-center justify-center"
                        resizeMode="cover"
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text className="text-white font-semibold text-lg">Send OTP</Text>
                        )}
                    </ImageBackground>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mt-6 self-center"
                >
                    <Text className="text-white/60 font-inter">
                        Back to <Text className="text-white font-semibold">Sign In</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    heading: {
        fontFamily: FontFamily.questrial,
        fontSize: FontSize.heading - 8,
        lineHeight: 48,
    },
    input: {
        fontFamily: FontFamily.interRegular,
        fontSize: FontSize.body,
        letterSpacing: -0.4,
    },
});
