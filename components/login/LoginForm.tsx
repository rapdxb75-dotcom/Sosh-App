import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import {
    Image,
    ImageBackground,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Svg, { Defs, Rect, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import Toast from "react-native-toast-message";
import { FontFamily, FontSize, normalize } from "../../constants/Fonts";

export default function LoginForm() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({ email: "", password: "" });

    const handleLogin = () => {
        let isValid = true;
        const newErrors = { email: "", password: "" };

        if (!email.trim()) {
            newErrors.email = "Email is required";
            isValid = false;
        }

        if (!password.trim()) {
            newErrors.password = "Password is required";
            isValid = false;
        }

        setErrors(newErrors);

        if (isValid) {
            Toast.show({
                type: 'success',
                text1: 'Login Successful',
                text2: 'Welcome back! 👋'
            });
            router.replace('/(tabs)/home');
        }
    };

    return (
        <View className="flex-1 justify-center gap-5 mb-5">

            {/* Logo between text - matching user's requested size (54) */}
            <View style={{ width: normalize(54), height: normalize(54), marginVertical: 4 }} className="items-center justify-center self-center">
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
                <BlurView
                    intensity={20}
                    tint="light"
                    className="p-6 gap-4"
                >
                    {/* Gradient Border SVG Overlay (Taller to hide bottom stroke) */}
                    <View style={StyleSheet.absoluteFill} pointerEvents="none">
                        <Svg height="120%" width="100%">
                            <Defs>
                                <SvgLinearGradient id="loginBorderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.7)" stopOpacity="1" />
                                    <Stop offset="100%" stopColor="rgba(0, 0, 0, 0.7)" stopOpacity="1" />
                                </SvgLinearGradient>
                            </Defs>
                            <Rect
                                x="0.5"
                                y="0.5"
                                width="99.7%"
                                height="85%"
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
                                    placeholder="email@mail.com"
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
                            <BlurView intensity={20} tint="light" className="flex-row items-center pr-4">
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
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
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

                    <TouchableOpacity className="w-full items-start">
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
                    source={require("../../assets/images/button-bg.png")}
                    className="w-full h-full items-center justify-center"
                    resizeMode="cover"
                >
                    <View className="absolute inset-0 bg-blue-500/20" />
                    <Text className="text-white font-semibold text-lg">
                        Sign in
                    </Text>
                </ImageBackground>
            </TouchableOpacity>
        </View>
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
        textAlignVertical: 'center',
        includeFontPadding: false,
    }
});
