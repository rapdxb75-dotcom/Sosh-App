import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { LogOut } from "lucide-react-native";
import { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { useDispatch, useSelector } from "react-redux";
import { normalize } from "../../constants/Fonts";
import { useNotification } from "../../context/NotificationContext";
import storageService from "../../services/storage";
import { RootState } from "../../store/store";
import { clearUserData } from "../../store/userSlice";

/* ---------- Gradient Ring Component ---------- */
const GradientRingSVG = () => {
  const size = normalize(38);
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
    width: normalize(38),
    height: normalize(38),
    borderRadius: normalize(19),
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
});

/* ---------- Header Component ---------- */
export default function Header() {
  const { showNotifications, notifications } = useNotification();
  const profilePic = useSelector(
    (state: RootState) => state.user.profilePicture,
  );
  const dispatch = useDispatch();
  const [showDropdown, setShowDropdown] = useState(false);
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dispatch(clearUserData());
    await storageService.logout();
    setShowDropdown(false);
    router.replace("/");
  };

  return (
    <View
      className="flex-row justify-between items-center px-5"
      style={{ paddingTop: Math.max(insets.top + 10, normalize(55)) }}
    >
      {/* Left Logo */}
      <View
        className="items-center justify-center"
        style={{ width: normalize(38), height: normalize(38) }}
      >
        <Image
          source={require("../../assets/images/logo.png")}
          style={{ width: normalize(38), height: normalize(38) }}
          resizeMode="contain"
        />
      </View>

      {/* Right Icons */}
      <View className="flex-row items-center gap-3">
        {/* Notification */}
        <TouchableOpacity
          className="items-center justify-center relative"
          style={{ width: normalize(38), height: normalize(38) }}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            showNotifications();
          }}
        >
          <Image
            source={require("../../assets/images/notification.png")}
            style={{ width: normalize(38), height: normalize(38) }}
            resizeMode="contain"
          />
          {notifications.length > 0 && (
            <View className="absolute top-1 right-1 bg-[#EE2828] rounded-full min-w-[16px] h-[16px] items-center justify-center px-1 border-[1.5px] border-black">
              <Text className="text-white text-[9px] font-bold leading-none text-center">
                {notifications.length > 99 ? "99+" : notifications.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* RAPDXP User Profile Icon with Gradient Ring */}
        <TouchableOpacity
          className="items-center justify-center relative"
          style={{ width: normalize(38), height: normalize(38) }}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowDropdown(!showDropdown);
          }}
        >
          <GradientRingSVG />
          <Image
            source={
              profilePic
                ? {
                  uri:
                    profilePic.startsWith("data:") ||
                      profilePic.startsWith("http") ||
                      profilePic.startsWith("file")
                      ? profilePic
                      : `data:image/png;base64,${profilePic}`,
                }
                : require("../../assets/images/avtar.png")
            }
            style={{
              width: normalize(36),
              height: normalize(36),
              borderRadius: profilePic ? normalize(18) : 0,
            }}
            resizeMode={profilePic ? "cover" : "contain"}
          />
        </TouchableOpacity>

        {/* Dropdown Menu */}
        {showDropdown && (
          <View
            style={{
              position: "absolute",
              top: normalize(45),
              right: 0,
              width: 120,
              backgroundColor: "#1A1A1A",
              borderRadius: 12,
              overflow: "hidden",
              zIndex: 1000,
            }}
          >
            <BlurView intensity={40} tint="dark" style={{ flex: 1 }}>
              <View
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  position: "relative",
                }}
              >
                {/* SVG Gradient Border */}
                <View
                  style={{ position: "absolute", inset: 0 }}
                  pointerEvents="none"
                >
                  <Svg height="100%" width="100%">
                    <Defs>
                      <LinearGradient
                        id="dropdownBorderGrad"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <Stop
                          offset="0%"
                          stopColor="rgba(141, 138, 138, 0.4)"
                          stopOpacity="1"
                        />
                        <Stop
                          offset="48.56%"
                          stopColor="rgba(65, 65, 65, 0.4)"
                          stopOpacity="1"
                        />
                        <Stop
                          offset="100%"
                          stopColor="rgba(141, 138, 138, 0.4)"
                          stopOpacity="1"
                        />
                      </LinearGradient>
                    </Defs>
                    <Rect
                      x="0.34"
                      y="0.34"
                      width="99.3%"
                      height="99%"
                      rx="12"
                      ry="12"
                      stroke="url(#dropdownBorderGrad)"
                      strokeWidth="0.68"
                      fill="transparent"
                    />
                  </Svg>
                </View>

                <TouchableOpacity
                  className="flex-row items-center justify-center px-7 py-3 bg-red-500"
                  onPress={handleLogout}
                >
                  <LogOut color="#ffffff" size={20} />
                  <Text className="text-white font-inter text-base font-semibold ml-2">
                    Log out
                  </Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        )}
      </View>
    </View>
  );
}
