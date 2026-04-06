import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import {
  Dimensions,
  Image,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FontFamily, normalize } from "../constants/Fonts";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
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
        <View className="flex-1 px-8 items-center">

          {/* Layered Hero Section */}
          <View
            style={{
              width: SCREEN_WIDTH,
              height: SCREEN_HEIGHT * 0.53,
              marginTop: SCREEN_HEIGHT * 0.06,
            }}
            className="items-center justify-center mt-4"
          >
            {/* 1. Phone Mockup (Base) - Mild Fade Pulse */}
            <MotiView
              from={{ opacity: 0.9 }}
              animate={{ opacity: 1 }}
              transition={{
                type: 'timing',
                duration: 3000,
                loop: true,
              }}
              style={{ width: SCREEN_WIDTH * 0.7, height: SCREEN_HEIGHT * 0.5 }}
            >
              <Image
                source={require("../assets/images/welcome_bg1.png")}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            </MotiView>

            {/* 2. Floating Icons Group - Safely Away from Borders */}
            {/* Left Icons */}
            <MotiView
              from={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
              transition={{
                type: 'timing',
                duration: 2500,
                delay: 300,
                loop: true,
              }}
              style={{ position: 'absolute', left: SCREEN_WIDTH * 0.04, top: SCREEN_HEIGHT * 0.12 }}
            >
              <Image source={require("../assets/welcome_page/facebook.png")} style={{ width: 65, height: 65 }} resizeMode="contain" />
            </MotiView>

            <MotiView
              from={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
              transition={{
                type: 'timing',
                duration: 3500,
                delay: 500,
                loop: true,
              }}
              style={{ position: 'absolute', left: SCREEN_WIDTH * 0.02, top: SCREEN_HEIGHT * 0.28 }}
            >
              <Image source={require("../assets/welcome_page/instagram.png")} style={{ width: 75, height: 75 }} resizeMode="contain" />
            </MotiView>

            <MotiView
              from={{ opacity: 0.75 }}
              animate={{ opacity: 1 }}
              transition={{
                type: 'timing',
                duration: 2800,
                delay: 400,
                loop: true,
              }}
              style={{ position: 'absolute', left: SCREEN_WIDTH * 0.05, top: SCREEN_HEIGHT * 0.43 }}
            >
              <Image source={require("../assets/welcome_page/tiktok.png")} style={{ width: 60, height: 60 }} resizeMode="contain" />
            </MotiView>

            {/* Right Icons */}
            <MotiView
              from={{ opacity: 0.65 }}
              animate={{ opacity: 1 }}
              transition={{
                type: 'timing',
                duration: 2700,
                delay: 400,
                loop: true,
              }}
              style={{ position: 'absolute', right: SCREEN_WIDTH * 0.03, top: SCREEN_HEIGHT * 0.14 }}
            >
              <Image source={require("../assets/welcome_page/youtube.png")} style={{ width: 70, height: 70 }} resizeMode="contain" />
            </MotiView>

            <MotiView
              from={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              transition={{
                type: 'timing',
                duration: 3200,
                delay: 600,
                loop: true,
              }}
              style={{ position: 'absolute', right: -1, top: SCREEN_HEIGHT * 0.3 }}
            >
              <Image source={require("../assets/welcome_page/snapchat.png")} style={{ width: 75, height: 75 }} resizeMode="contain" />
            </MotiView>

            <MotiView
              from={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
              transition={{
                type: 'timing',
                duration: 2400,
                delay: 500,
                loop: true,
              }}
              style={{ position: 'absolute', right: SCREEN_WIDTH * 0.06, top: SCREEN_HEIGHT * 0.43 }}
            >
              <Image source={require("../assets/welcome_page/twitter.png")} style={{ width: 55, height: 55 }} resizeMode="contain" />
            </MotiView>
          </View>

          {/* Spacer to push content to bottom */}
          <View className="flex-1" />

          {/* Group headline and button together */}
          <View className="w-full items-center mb-8">
            {/* Text Content */}
            <View className="items-center mb-8">
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
                onPress={() => router.push("/login")}
                activeOpacity={0.8}
                className="w-full h-16 rounded-full overflow-hidden shadow-2xl"
              >
                <ImageBackground
                  source={require("../assets/images/post_without.jpg")}
                  className="w-full h-full"
                  resizeMode="cover"
                >
                  <BlurView intensity={20} className="w-full h-full items-center justify-center">
                    <Text className="text-white font-bold text-xl tracking-wide">
                      Get Started
                    </Text>
                  </BlurView>
                </ImageBackground>
              </TouchableOpacity>

              <Text className="text-white/30 text-center text-[13px] font-medium italic">
                Ready to take control of your social presence?
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontFamily: FontFamily.questrial,
    fontSize: normalize(36),
    lineHeight: 44,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
});
