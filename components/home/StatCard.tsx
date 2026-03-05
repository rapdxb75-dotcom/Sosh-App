import { BlurView } from "expo-blur";
import { TrendingUp } from "lucide-react-native";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Svg, {
  Defs,
  Rect,
  Stop,
  LinearGradient as SvgLinearGradient,
} from "react-native-svg";
import { Colors } from "../../constants/Colors";

import NumberLoading from "../../components/common/NumberLoading";

interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  fullWidth?: boolean;
  isLoading?: boolean;
}

export default function StatCard({
  title,
  value,
  trend,
  fullWidth,
  isLoading,
}: StatCardProps) {
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 390;

  const shadowStyle = {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45, // approx #00000073
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
          {/* Title Section */}
          <Text className="text-white/60 text-sm font-inter">{title}</Text>

          {fullWidth ? (
            // Full Width Layout: Title -> 26px Gap -> Content
            <View className="flex-row items-end justify-between mt-[26px]">
              {isLoading ? (
                <NumberLoading
                  length={3}
                  style={{ fontFamily: "Questrial_400Regular" }}
                  className={`text-white ${isSmallDevice ? "text-[44px]" : "text-[54px]"}`}
                  adjustsFontSizeToFit
                  numberOfLines={1}
                />
              ) : (
                <Text
                  style={{ fontFamily: "Questrial_400Regular" }}
                  className={`text-white ${isSmallDevice ? "text-[44px]" : "text-[54px]"}`}
                  adjustsFontSizeToFit
                  numberOfLines={1}
                >
                  {value}
                </Text>
              )}
              <View className="flex-row items-center gap-1 mb-2">
                <TrendingUp color={Colors.white} size={isSmallDevice ? 16 : 19} strokeWidth={2} />
                <Text className={`font-inter font-semibold leading-5 tracking-[0px] text-right text-white/60 ${isSmallDevice ? "text-[11px]" : "text-[13px]"}`}>
                  {trend}
                </Text>
              </View>
            </View>
          ) : (
            // Half Width Layout: Vertical Stack with justify-between
            <>
              <View className="flex-1">
                {isLoading ? (
                  <NumberLoading
                    length={2}
                    style={{ fontFamily: "Questrial_400Regular" }}
                    className="text-white text-[54px] mt-2"
                    adjustsFontSizeToFit
                    numberOfLines={1}
                  />
                ) : (
                  <Text
                    style={{ fontFamily: "Questrial_400Regular" }}
                    className="text-white text-[54px] mt-2"
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
                  <TrendingUp color={Colors.white} size={19} strokeWidth={2} />
                  <Text className="font-inter font-semibold text-[13px] leading-5 tracking-[0px] text-left text-white/60">
                    {trend}
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* Gradient Border SVG Overlay */}
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
