import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { TrendingDown, TrendingUp } from "lucide-react-native";
import { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Svg, {
  Defs,
  Rect,
  Stop,
  LinearGradient as SvgLinearGradient,
} from "react-native-svg";

interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  fullWidth?: boolean;
  loading?: boolean;
  badge?: string;
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
      }),
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
  badge,
}: StatCardProps) {
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 380;
  const valueFontSize = isSmallDevice ? 40 : 54;

  // Determine trend status
  const isNegative = trend.trim().startsWith("-");
  const trendColor = "#ffffffff"
  const TrendIcon = isNegative ? TrendingDown : TrendingUp;

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
          {/* Title & Badge */}
          <View className="flex-row items-center justify-between">
            <Text className="text-white/60 text-sm font-inter">{title}</Text>
            {badge && !loading && (
              <View
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                }}
              >
                <View
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: "#FFFFFF",
                      marginRight: 6,
                      opacity: 0.8,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 10,
                      color: "#FFFFFF",
                      fontFamily: "Inter_600SemiBold",
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                    }}
                  >
                    {badge}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {fullWidth ? (
            /* -------- Full Width Layout -------- */
            <View className="flex-row items-end justify-between mt-[26px] mb-2">
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
                  <TrendIcon
                    color={trendColor}
                    size={isSmallDevice ? 15 : 19}
                    strokeWidth={2.5}
                  />
                )}

                {loading ? (
                  <Skeleton height={12} width={60} />
                ) : (
                  <Text
                    style={{
                      fontSize: isSmallDevice ? 11 : 13,
                      color: trendColor,
                    }}
                    className="font-inter font-semibold leading-5 tracking-[0px] text-right"
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
                    <TrendIcon
                      color={trendColor}
                      size={isSmallDevice ? 15 : 19}
                      strokeWidth={2.5}
                    />
                  )}

                  {loading ? (
                    <Skeleton height={12} width={60} />
                  ) : (
                    <Text
                      style={{
                        fontSize: isSmallDevice ? 11 : 13,
                        color: trendColor,
                      }}
                      className="font-inter font-semibold leading-5 tracking-[0px] text-left"
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
