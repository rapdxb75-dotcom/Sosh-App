import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import { ChevronDown, Minus, Plus, TrendingUp } from "lucide-react-native";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, {
  Defs,
  Rect,
  Stop,
  LinearGradient as SvgGradient,
} from "react-native-svg";
import {
  VictoryArea,
  VictoryAxis,
  VictoryChart,
  VictoryGroup,
  VictoryPie,
  VictoryTheme,
  VictoryVoronoiContainer,
} from "victory-native";
import Header from "../../components/common/Header";

// --- Types ---

interface PlatformData {
  id: string;
  name: string;
  icon: any;
  followers: string;
  growth: string;
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
}

// --- Constants ---

const PLATFORMS: PlatformData[] = [
  {
    id: "instagram",
    name: "Instagram",
    icon: require("../../assets/icons/instagram.png"),
    followers: "+ 14 followers",
    growth: "+8.2% this month",
    metrics: { views: 10032, likes: 1982, comments: 452, shares: 120 },
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: require("../../assets/icons/tiktok.png"),
    followers: "+ 37 followers",
    growth: "+8.2% this month",
    metrics: { views: 10032, likes: 1982, comments: 10032, shares: 1982 },
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: require("../../assets/icons/facebook.png"),
    followers: "+ 5 followers",
    growth: "+2.1% this month",
    metrics: { views: 5432, likes: 892, comments: 120, shares: 45 },
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: require("../../assets/icons/youtube.png"),
    followers: "+ 120 subscribers",
    growth: "+12.5% this month",
    metrics: { views: 45000, likes: 2100, comments: 750, shares: 320 },
  },
];

// --- Components ---

const PlatformCard = ({
  platform,
  isExpanded,
  onToggle,
  chartData,
  selectedTab,
  onTabChange,
  screenWidth,
}: {
  platform: PlatformData;
  isExpanded: boolean;
  onToggle: () => void;
  chartData: any[];
  selectedTab: string;
  onTabChange: (tab: string) => void;
  screenWidth: number;
}) => {
  const formatCompactNumber = (number: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(number);
  };

  const totalEngagement = platform.metrics.likes + platform.metrics.comments + platform.metrics.shares;
  const likesPercent = Math.round((platform.metrics.likes / totalEngagement) * 100) || 19;
  const commentsPercent = Math.round((platform.metrics.comments / totalEngagement) * 100) || 32;
  const sharesPercent = Math.round((platform.metrics.shares / totalEngagement) * 100) || 29;

  return (
    <View
      className="mb-4"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.45,
        shadowRadius: 24,
        elevation: 8,
      }}
    >
      <BlurView
        intensity={14}
        tint="dark"
        className="border border-white/10 rounded-[20px] overflow-hidden"
      >
        <View className="p-5">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Image
                source={platform.icon}
                className="w-12 h-12 rounded-xl mr-3"
              />
              <View>
                <View className="flex-row items-center">
                  <Text className="text-white text-[18px] font-bold font-inter mr-2">
                    {platform.name}
                  </Text>
                  <Text className="text-white/50 text-[14px] font-inter">
                    {platform.followers}
                  </Text>
                </View>
                <View className="bg-[#00FF94]/10 rounded-full py-1 px-2.5 flex-row items-center mt-1.5 self-start">
                  <TrendingUp size={12} color="#00FF94" />
                  <Text className="text-[#00FF94] text-[12px] font-inter ml-1">
                    {platform.growth}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              className="w-8 h-8 rounded-full bg-white/10 items-center justify-center border border-white/10"
              onPress={() => {
                if (typeof Haptics !== "undefined" && Haptics.impactAsync) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                onToggle();
              }}
            >
              {isExpanded ? (
                <Minus size={16} color="white" />
              ) : (
                <Plus size={16} color="white" />
              )}
            </TouchableOpacity>
          </View>

          {isExpanded && (
            <View className="mt-8">
              {/* Views Section */}
              <View className="flex-row items-center">
                <Text className="text-white/40 text-[14px] font-inter mr-1">
                  Views 30 days
                </Text>
                <ChevronDown size={14} color="rgba(255,255,255,0.4)" />
              </View>
                
              <View className="flex-row items-center justify-between mb-2 mt-2">
                <Text className="text-white text-[32px] font-bold font-inter tracking-tight">
                  {formatCompactNumber(platform.metrics.views)}
                </Text>
                <View className="flex-row items-center gap-2">
                  {["W1", "W2", "W3", "W4"].map((tab) => (
                    <TouchableOpacity
                      key={tab}
                      onPress={() => {
                        if (typeof Haptics !== "undefined" && Haptics.impactAsync) {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                        onTabChange(tab);
                      }}
                      className={`w-8 h-8 rounded-full items-center justify-center ${selectedTab === tab ? "bg-white/10" : ""}`}
                    >
                      <Text
                        className={`text-[12px] ${selectedTab === tab ? "text-white font-medium" : "text-white/40"}`}
                      >
                        {tab}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
                
              {/* Area Chart */}
              <View style={{ height: 160, marginLeft: -30, marginBottom: 10 }}>
                <VictoryChart
                  width={screenWidth - 20}
                  height={160}
                  theme={VictoryTheme.material}
                  padding={{ top: 10, bottom: 20, left: 40, right: 30 }}
                >
                  <VictoryAxis
                    style={{
                      axis: { stroke: "transparent" },
                      tickLabels: {
                        fill: "rgba(255,255,255,0.2)",
                        fontSize: 10,
                        fontFamily: "Inter_400Regular",
                      },
                      grid: { stroke: "transparent" },
                    }}
                    tickFormat={(t) => Math.round(t)}
                  />
                  <VictoryAxis
                    dependentAxis
                    style={{
                      axis: { stroke: "transparent" },
                      tickLabels: { fill: "transparent" },
                      grid: {
                        stroke: "rgba(255, 255, 255, 0.1)",
                        strokeWidth: 1,
                        strokeDasharray: "none",
                      },
                    }}
                  />
                  <VictoryGroup offset={0}>
                    <VictoryArea
                      data={chartData.map((d) => ({ ...d, y: d.y2 }))}
                      interpolation="natural"
                      style={{
                        data: {
                          fill: "url(#gradViewsCard)",
                          stroke: "#FFB01A",
                          strokeWidth: 2,
                        },
                      }}
                    />
                  </VictoryGroup>

                  <Defs>
                    <SvgGradient
                      id="gradViewsCard"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <Stop offset="0%" stopColor="#FFB01A" stopOpacity="0.3" />
                      <Stop offset="100%" stopColor="#FFB01A" stopOpacity="0" />
                    </SvgGradient>
                  </Defs>
                </VictoryChart>
              </View>

              {/* Engagement Section */}
              <View className="flex-row items-center mt-4">
                <Text className="text-white/40 text-[14px] font-inter mr-1">
                  Engagement 30 days
                </Text>
                <ChevronDown size={14} color="rgba(255,255,255,0.4)" />
              </View>
                
              <View className="flex-row items-center justify-between mt-2 mb-6">
                <Text className="text-white text-[32px] font-bold font-inter tracking-tight">
                  {formatCompactNumber(totalEngagement)}
                </Text>
                <View className="flex-row items-center gap-2">
                  {["W1", "W2", "W3", "W4"].map((tab) => (
                    <TouchableOpacity
                      key={tab}
                      onPress={() => {
                        if (typeof Haptics !== "undefined" && Haptics.impactAsync) {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                        onTabChange(tab);
                      }}
                      className={`w-8 h-8 rounded-full items-center justify-center ${selectedTab === tab ? "bg-white/10" : ""}`}
                    >
                      <Text
                        className={`text-[12px] ${selectedTab === tab ? "text-white font-medium" : "text-white/40"}`}
                      >
                        {tab}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Horizontal Bars Container */}
              <View className="relative py-2 mt-2">
                {/* Background Grid Lines */}
                <View className="absolute inset-x-0 inset-y-0 flex-row justify-between pl-[100px] z-0 px-8">
                  <View className="w-px h-full bg-white/10" />
                  <View className="w-px h-full bg-white/10" />
                  <View className="w-px h-full bg-white/10" />
                </View>

                {/* Bars */}
                <View className="gap-3 z-10 w-full relative">
                  <View className="flex-row items-center relative gap-3">
                    <View className="bg-[#FAA61A] rounded-[8px] h-10 flex-row items-center px-4" style={{ width: `${Math.max(30, likesPercent)}%` }}>
                      <Text className="text-black text-[13px] font-medium font-inter">Likes</Text>
                    </View>
                    <Text className="text-white/40 text-[12px] font-inter">{likesPercent}%</Text>
                  </View>
                  
                  <View className="flex-row items-center relative gap-3">
                    <View className="bg-[#00E0FF] rounded-[8px] h-10 flex-row items-center px-4" style={{ width: `${Math.max(30, commentsPercent)}%` }}>
                      <Text className="text-white text-[13px] font-medium font-inter">Comments</Text>
                    </View>
                    <Text className="text-white/40 text-[12px] font-inter">{commentsPercent}%</Text>
                  </View>
                  
                  <View className="flex-row items-center relative gap-3">
                    <View className="bg-[#FF4500] rounded-[8px] h-10 flex-row items-center px-4" style={{ width: `${Math.max(30, sharesPercent)}%` }}>
                      <Text className="text-white text-[13px] font-medium font-inter">Shares</Text>
                    </View>
                    <Text className="text-white/40 text-[12px] font-inter">{sharesPercent}%</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      </BlurView>
    </View>
  );
};

// --- Dummy Data for Chart ---
const dummyChartData: Record<string, { x: number; y: number; y2: number }[]> = {
  W1: [
    { x: 1, y: 2, y2: 1 },
    { x: 2, y: 3, y2: 2.2 },
    { x: 3, y: 3.5, y2: 2.0 },
    { x: 4, y: 2, y2: 1.5 },
    { x: 5, y: 3.5, y2: 2.1 },
    { x: 6, y: 4, y2: 2.3 },
    { x: 7, y: 4.2, y2: 2.2 },
  ],
  W2: [
    { x: 1, y: 1.5, y2: 2.5 },
    { x: 2, y: 2.5, y2: 3.0 },
    { x: 3, y: 2.0, y2: 2.8 },
    { x: 4, y: 3.5, y2: 4.0 },
    { x: 5, y: 3.0, y2: 3.2 },
    { x: 6, y: 2.5, y2: 3.8 },
    { x: 7, y: 3.8, y2: 4.1 },
  ],
  W3: [
    { x: 1, y: 3.0, y2: 1.2 },
    { x: 2, y: 2.8, y2: 1.8 },
    { x: 3, y: 4.0, y2: 2.5 },
    { x: 4, y: 3.2, y2: 2.0 },
    { x: 5, y: 4.5, y2: 3.0 },
    { x: 6, y: 3.8, y2: 2.8 },
    { x: 7, y: 2.0, y2: 3.5 },
  ],
  W4: [
    { x: 1, y: 2.2, y2: 1.5 },
    { x: 2, y: 3.5, y2: 2.8 },
    { x: 3, y: 3.0, y2: 2.2 },
    { x: 4, y: 4.2, y2: 3.5 },
    { x: 5, y: 3.8, y2: 3.0 },
    { x: 6, y: 4.8, y2: 4.0 },
    { x: 7, y: 4.5, y2: 3.8 },
  ],
};

export default function Analysis() {
  const { width } = useWindowDimensions();
  const [selectedTab, setSelectedTab] = useState("W1");
  const [expandedPlatform, setExpandedPlatform] = useState("");

  return (
    <View className="flex-1">
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: 160,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Header />

        <View className="px-5">
          <Text className="page-title text-white mb-4 mt-8">
            Your{"\n"}Analytics
          </Text>

          <Text className="section-title text-white mb-4 font-semibold">
            Platform Breakdown
          </Text>

          {PLATFORMS.map((platform) => (
            <PlatformCard
              key={platform.id}
              platform={platform}
              isExpanded={expandedPlatform === platform.id}
              onToggle={() =>
                setExpandedPlatform(
                  expandedPlatform === platform.id ? "" : platform.id,
                )
              }
              chartData={dummyChartData[selectedTab]}
              selectedTab={selectedTab}
              onTabChange={setSelectedTab}
              screenWidth={width}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
