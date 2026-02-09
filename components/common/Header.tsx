import { BlurView } from "expo-blur";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { useNotification } from "../../context/NotificationContext";

/* ---------- Gradient Ring Component ---------- */
const GradientRingSVG = () => {
    const size = 33;
    const strokeWidth = 1;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;

    return (
        <View style={ringStyles.container}>
            <BlurView intensity={5} style={ringStyles.blurContainer}>
                <Svg width={size} height={size}>
                    <Defs>
                        <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                            <Stop offset="50%" stopColor="#000000" stopOpacity="1" />
                            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
                        </LinearGradient>
                    </Defs>
                    <Circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke="url(#grad)"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                </Svg>
            </BlurView>
        </View>
    );
};

const ringStyles = StyleSheet.create({
    container: {
        position: "absolute",
        inset: 0,
        alignItems: "center",
        justifyContent: "center",
    },
    blurContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
    },
});

/* ---------- Header Component ---------- */
export default function Header() {
    const { showNotifications } = useNotification();

    return (
        <View className="flex-row justify-between items-center px-5 pt-[55px]">

            {/* Left Logo */}
            <View className="w-9 h-9 items-center justify-center">
                <Image
                    source={require("../../assets/images/logo.png")}
                    className="w-9 h-9"
                    resizeMode="contain"
                />
            </View>

            {/* Right Icons */}
            <View className="flex-row items-center gap-3">

                {/* Notification */}
                <TouchableOpacity
                    className="w-9 h-9 items-center justify-center"
                    onPress={showNotifications}
                >
                    <Image
                        source={require("../../assets/images/notification.png")}
                        className="w-9 h-9"
                        resizeMode="contain"
                    />
                </TouchableOpacity>

                {/* RAPDXP Logo with Gradient Ring */}
                <View className="w-9 h-9 items-center justify-center relative">
                    <GradientRingSVG />
                    <Image
                        source={require("../../assets/images/rapdxp-logo.png")}
                        className="w-9 h-9"
                        resizeMode="contain"
                    />
                </View>

            </View>
        </View>
    );
}
