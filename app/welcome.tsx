import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import {
  Image,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, {
  Defs,
  Rect,
  Stop,
  LinearGradient as SvgLinearGradient,
} from "react-native-svg";
import { FontFamily, normalize } from "../constants/Fonts";

export default function Welcome() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {/* Background Image */}
      <Image
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
        <View className="flex-1 px-8 py-10 items-center justify-between">

          {/* Header Graphic */}
          <View className="flex-1 justify-center items-center">
            <Image
              source={require("../assets/images/welcome_bg.png")}
              style={{
                width: normalize(390),
                height: normalize(480),
              }}
              resizeMode="contain"
            />
          </View>

          {/* Text Content */}
          <View className="items-center mb-4">
            <Text
              style={styles.heading}
              className="text-white text-center"
            >
              Post Smarter
            </Text>
            <Text
              style={styles.heading}
              className="text-white text-center"
            >
              Not Harder
            </Text>
          </View>

          {/* Action Button */}
          <View className="w-full gap-4">
            <TouchableOpacity
              className="w-full h-16 overflow-hidden rounded-full shadow-lg"
              onPress={() => router.push("/login")}
            >
              <ImageBackground
                source={require("../assets/images/post_without.jpg")}
                className="w-full h-full items-center justify-center"
                resizeMode="cover"
              >
                <View className="absolute inset-0 bg-[#00000020]" />
                <Text className="text-white font-semibold text-xl tracking-tight">
                  Get Started
                </Text>
              </ImageBackground>
            </TouchableOpacity>

            <View
              style={{
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 10,
                elevation: 5,
              }}
              className="w-full h-16 rounded-full bg-[#FFFFFF1A] overflow-hidden hidden"
            >
              {/* Optional: 'Join the Community' button if needed, currently hidden to match reference image */}
              <BlurView
                intensity={30}
                tint="light"
                className="flex-1 items-center justify-center"
              >
                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                  <Svg height="100%" width="100%">
                    <Defs>
                      <SvgLinearGradient
                        id="welcomeBorderGrad"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <Stop
                          offset="0%"
                          stopColor="rgba(255, 255, 255, 0.4)"
                          stopOpacity="1"
                        />
                        <Stop
                          offset="100%"
                          stopColor="rgba(0, 0, 0, 0.2)"
                          stopOpacity="1"
                        />
                      </SvgLinearGradient>
                    </Defs>
                    <Rect
                      x="0.5"
                      y="0.5"
                      width="99.7%"
                      height="99.2%"
                      rx="32"
                      ry="32"
                      stroke="url(#welcomeBorderGrad)"
                      strokeWidth="1.5"
                      fill="transparent"
                    />
                  </Svg>
                </View>
                <TouchableOpacity
                  className="w-full h-full items-center justify-center"
                  onPress={() => router.push("/signup")}
                >
                  <Text className="text-white font-medium text-base">
                    Join the Community
                  </Text>
                </TouchableOpacity>
              </BlurView>
            </View>

            <Text className="text-white/40 text-center text-xs mt-2">
              Ready to take control of your social presence?
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontFamily: FontFamily.questrial,
    fontSize: normalize(32),
    lineHeight: 40,
    fontWeight: '500',
  },
});
