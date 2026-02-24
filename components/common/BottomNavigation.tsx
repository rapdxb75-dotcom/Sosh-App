import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Defs,
  Rect,
  Stop,
  LinearGradient as SvgLinearGradient,
  Path as SvgPath,
} from "react-native-svg";

export default function BottomNavigation({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const currentRoute = state.routes[state.index].name;
  const insets = useSafeAreaInsets();

  const navigateTo = (routeName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const route = state.routes.find((r) => r.name === routeName);

    const event = navigation.emit({
      type: "tabPress",
      target: route ? route.key : routeName,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      if (route) {
        navigation.navigate({ name: route.name, merge: true } as any);
      } else {
        navigation.navigate(routeName as never);
      }
    }
  };

  const isActive = (routeName: string) => currentRoute === routeName;

  return (
    <View
      className="absolute left-5 right-5 h-[72px]"
      style={{
        bottom: Math.max(insets.bottom + 10, 40),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.45,
        shadowRadius: 24,
        elevation: 10,
      }}
    >
      <BlurView
        intensity={20}
        tint="dark"
        style={{ flex: 1, borderRadius: 24, overflow: "hidden" }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            paddingHorizontal: 24,
            position: "relative",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Gradient Border SVG Overlay */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg height="100%" width="100%">
              <Defs>
                <SvgLinearGradient
                  id="navBorderGrad"
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
                </SvgLinearGradient>
              </Defs>
              <Rect
                x="0.34"
                y="0.34"
                width="99.3%"
                height="99%"
                rx="24"
                ry="24"
                stroke="url(#navBorderGrad)"
                strokeWidth="0.68"
                fill="transparent"
              />
            </Svg>
          </View>

          <TouchableOpacity
            onPress={() => navigateTo("home")}
            className={`w-[42px] h-[42px] items-center justify-center rounded-[14px] ${isActive("home") ? "bg-[#FFFFFF1A]" : ""}`}
          >
            <Image
              source={require("../../assets/icons/nav_home.png")}
              className="w-[26px] h-[26px]"
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigateTo("ai")}
            className={`w-[42px] h-[42px] items-center justify-center rounded-[14px] ${isActive("ai") ? "bg-[#FFFFFF1A]" : ""}`}
          >
            <Image
              source={require("../../assets/icons/nav_ai.png")}
              className="w-[26px] h-[26px]"
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Spacer for absolute center button */}
          <View className="w-[60px]" />

          <TouchableOpacity
            className={`w-[42px] h-[42px] items-center justify-center rounded-[14px] ${isActive("analysis") ? "bg-[#FFFFFF1A]" : ""}`}
            onPress={() => navigateTo("analysis")}
          >
            <Image
              source={require("../../assets/icons/nav_chart.png")}
              className="w-[26px] h-[26px]"
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigateTo("profile")}
            className={`w-[42px] h-[42px] items-center justify-center rounded-[14px] ${isActive("profile") ? "bg-[#FFFFFF1A]" : ""}`}
          >
            <Image
              source={require("../../assets/icons/nav_user.png")}
              className="w-[26px] h-[26px]"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </BlurView>

      {/* Popped out center button - outside the clipped BlurView */}
      <View
        pointerEvents="box-none"
        style={[
          StyleSheet.absoluteFill,
          { alignItems: "center", justifyContent: "center" },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigateTo("createPost")}
          className="w-[60px] h-[60px] bg-white rounded-full items-center justify-center -mt-14"
          style={{
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.97,
            shadowRadius: 14,
            elevation: 14,
          }}
        >
          <Svg width={34} height={34} viewBox="0 0 24 24" fill="none">
            {/* Outer circle */}
            <SvgPath
              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
              stroke="#000000"
              strokeWidth="1.6"
              fill="none"
            />
            {/* Arrow up */}
            <SvgPath
              d="M12 16V8M12 8L9 11M12 8L15 11"
              stroke="#000000"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
      </View>
    </View>
  );
}
