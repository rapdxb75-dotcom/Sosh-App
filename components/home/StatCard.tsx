import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { TrendingUp } from "lucide-react-native";
import {
  Animated,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useRef, useEffect } from "react";
import Svg, {
  Defs,
  Rect,
  Stop,
  LinearGradient as SvgLinearGradient,
} from "react-native-svg";
import { Colors } from "../../constants/Colors";

interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  fullWidth?: boolean;
  loading?: boolean;
}

/* ---------------- Skeleton Component ---------------- */

function Skeleton({
  height,
  width,
  borderRadius = 8,
}: {
  height: number;
  width: number | string;
  borderRadius?: number;
}) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View
      style={{
        height,
        width,
        backgroundColor: "rgba(255,255,255,0.08)",
        overflow: "hidden",
        borderRadius,
      }}
    >
      <Animated.View
        style={{
          ...StyleSheet.absoluteFillObject,
          transform: [{ translateX }],
        }}
      >
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.25)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
}

/* ---------------- Stat Card ---------------- */

export default function StatCard({
  title,
  value,
  trend,
  fullWidth,
  loading = false,
}: StatCardProps) {
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 380;
  const valueFontSize = isSmallDevice ? 40 : 54;

  const shadowStyle = {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 10,
  };

  return (
    <View
      style={[shadowStyle, { borderRadius: 24, overflow: "hidden" }]}
      className="flex-1 w-full"
    >
      <BlurView intensity={40} tint="dark" style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: 24,
            padding: 12,
            position: "relative",
          }}
          className={fullWidth ? "flex-col" : "justify-between"}
        >
          {/* Title */}
          <Text className="text-white/60 text-sm font-inter">{title}</Text>

          {fullWidth ? (
            /* -------- Full Width Layout -------- */
            <View className="flex-row items-end justify-between mt-[26px]">
              {loading ? (
                <Skeleton height={valueFontSize} width={120} />
              ) : (
                <Text
                  style={{
                    fontFamily: "Questrial_400Regular",
                    fontSize: valueFontSize,
                  }}
                  className="text-white"
                  adjustsFontSizeToFit
                  numberOfLines={1}
                >
                  {value}
                </Text>
              )}

              <View className="flex-row items-center gap-1 mb-2">
                {!loading && (
                  <TrendingUp
                    color={Colors.white}
                    size={isSmallDevice ? 15 : 19}
                    strokeWidth={2}
                  />
                )}

                {loading ? (
                  <Skeleton height={12} width={60} />
                ) : (
                  <Text
                    style={{ fontSize: isSmallDevice ? 11 : 13 }}
                    className="font-inter font-semibold leading-5 tracking-[0px] text-right text-white/60"
                  >
                    {trend}
                  </Text>
                )}
              </View>
            </View>
          ) : (
            /* -------- Half Width Layout -------- */
            <>
              <View className="flex-1">
                {loading ? (
                  <Skeleton
                    height={isSmallDevice ? 36 : 54}
                    width={100}
                    borderRadius={6}
                  />
                ) : (
                  <Text
                    style={{
                      fontFamily: "Questrial_400Regular",
                      fontSize: isSmallDevice ? 36 : 54,
                    }}
                    className="text-white mt-2"
                    adjustsFontSizeToFit
                    numberOfLines={1}
                  >
                    {value}
                  </Text>
                )}
              </View>

              <View>
                <View className="h-[2px] bg-white w-[100%] mb-2 opacity-50" />

                <View className="flex-row items-center gap-1 justify-start">
                  {!loading && (
                    <TrendingUp
                      color={Colors.white}
                      size={isSmallDevice ? 15 : 19}
                      strokeWidth={2}
                    />
                  )}

                  {loading ? (
                    <Skeleton height={12} width={60} />
                  ) : (
                    <Text
                      style={{ fontSize: isSmallDevice ? 11 : 13 }}
                      className="font-inter font-semibold leading-5 tracking-[0px] text-left text-white/60"
                    >
                      {trend}
                    </Text>
                  )}
                </View>
              </View>
            </>
          )}

          {/* Gradient Border */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg height="100%" width="100%">
              <Defs>
                <SvgLinearGradient
                  id={`statCardBorderGrad-${title.replace(/\s+/g, "")}`}
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <Stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
                  <Stop offset="100%" stopColor="rgba(0,0,0,0.7)" />
                </SvgLinearGradient>
              </Defs>

              <Rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                rx="24"
                ry="24"
                stroke={`url(#statCardBorderGrad-${title.replace(/\s+/g, "")})`}
                strokeWidth="2"
                fill="transparent"
              />
            </Svg>
          </View>
        </View>
      </BlurView>
    </View>
  );
}