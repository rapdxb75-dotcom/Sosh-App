import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Stack } from "expo-router";
import { ChevronDown, Minus, Plus, TrendingUp } from "lucide-react-native";
import { useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";
import {
  Defs,
  Stop,
  LinearGradient as SvgGradient
} from "react-native-svg";
import {
  VictoryArea,
  VictoryAxis,
  VictoryChart,
  VictoryGroup
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
  const [engagementTab, setEngagementTab] = useState("W1");

  const formatCompactNumber = (number: number) => {
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + 'M';
    }
    if (number >= 1000) {
      return (number / 1000).toFixed(1) + 'K';
    }
    return number.toString();
  };

  const getMultiplierForTab = (tab: string) => {
    switch (tab) {
      case 'W1': return { likes: 1, comments: 1, shares: 1 };
      case 'W2': return { likes: 1.2, comments: 0.8, shares: 1.1 };
      case 'W3': return { likes: 0.9, comments: 1.3, shares: 0.8 };
      case 'W4': return { likes: 1.1, comments: 0.9, shares: 1.4 };
      default: return { likes: 1, comments: 1, shares: 1 };
    }
  };

  const multiplier = getMultiplierForTab(engagementTab);
  const totalEngagement = platform.metrics.likes * multiplier.likes + platform.metrics.comments * multiplier.comments + platform.metrics.shares * multiplier.shares;
  const likesPercent = Math.round(((platform.metrics.likes * multiplier.likes) / totalEngagement) * 100) || 19;
  const commentsPercent = Math.round(((platform.metrics.comments * multiplier.comments) / totalEngagement) * 100) || 32;
  const sharesPercent = Math.round(((platform.metrics.shares * multiplier.shares) / totalEngagement) * 100) || 29;

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
        style={{ backgroundColor: "#FFFFFF1A" }}
      >
        <View className="p-5">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Image
                source={platform.icon}
                className="rounded-xl mr-3 mb-4"
                style={{ width: 35, height: 35 }}
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
                <View
                  className="flex-row items-center mt-1.5 self-start justify-center"
                  style={{
                    height: 28,
                    gap: 10,
                    borderRadius: 8,
                    padding: 4,
                    backgroundColor: "#098F3E1F"
                  }}
                >
                  <TrendingUp size={12} color="#00FF94" />
                  <Text className="text-[#00FF94] text-[12px] font-inter">
                    {platform.growth}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              className="items-center justify-center"
              style={{ width: 40, height: 40, borderRadius: 100, padding: 4, backgroundColor: '#FFFFFF1A', marginBottom: 16 }}
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
                <Text className="text-white/40 text-[14px] font-inter font-semibold mr-1" style={{ letterSpacing: -0.89 }}>
                  Views 30 days
                </Text>
                <ChevronDown size={14} color="rgba(255,255,255,0.4)" />
              </View>

              <View className="flex-row items-center justify-between mb-2 mt-2">
                <Text className="text-white text-[33px] font-bold font-inter tracking-tight">
                  {formatCompactNumber(platform.metrics.views)}
                </Text>
                <View className="flex-row items-center gap-[10px]">
                  {["W1", "W2", "W3", "W4"].map((tab) => (
                    <TouchableOpacity
                      key={tab}
                      onPress={() => {
                        if (typeof Haptics !== "undefined" && Haptics.impactAsync) {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                        onTabChange(tab);
                      }}
                      className={`rounded-full items-center justify-center ${selectedTab === tab ? "bg-white/10" : ""}`}
                      style={{ width: 36, height: 36, padding: 8 }}
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
              <View style={{ height: 180, marginHorizontal: -20, marginBottom: 10 }}>
                <VictoryChart
                  width={screenWidth - 40}
                  height={180}
                  padding={{ top: 10, bottom: 30, left: 20, right: 20 }}
                >
                  <VictoryAxis
                    tickValues={[1, 2, 3, 4, 5, 6, 7]}
                    style={{
                      axis: { stroke: "transparent" },
                      ticks: { stroke: "transparent" },
                      tickLabels: {
                        fill: "rgba(255, 255, 255, 0.4)",
                        fontSize: 13,
                        fontFamily: "Inter_400Regular",
                        padding: 5,
                      },
                      grid: { stroke: "transparent" },
                    }}
                    tickFormat={(t) => Math.round(t)}
                  />
                  <VictoryAxis
                    dependentAxis
                    style={{
                      axis: { stroke: "transparent" },
                      ticks: { stroke: "transparent" },
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
                          stroke: "#F59E0B",
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
                      <Stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
                      <Stop offset="92.05%" stopColor="rgba(42, 157, 144, 0.1)" stopOpacity="0.1" />
                    </SvgGradient>
                  </Defs>
                </VictoryChart>
              </View>

              {/* Engagement Section */}
              <View className="flex-row items-center mt-8">
                <Text className="text-white/40 text-[14px] font-inter font-semibold mr-1" style={{ letterSpacing: -0.89 }}>
                  Engagement 30 days
                </Text>
                <ChevronDown size={14} color="rgba(255,255,255,0.4)" />
              </View>

              <View className="flex-row items-center justify-between mt-2 mb-6">
                <Text className="text-white text-[33px] font-bold font-inter tracking-tight">
                  {formatCompactNumber(totalEngagement)}
                </Text>
                <View className="flex-row items-center gap-[10px]">
                  {["W1", "W2", "W3", "W4"].map((tab) => (
                    <TouchableOpacity
                      key={tab}
                      onPress={() => {
                        if (typeof Haptics !== "undefined" && Haptics.impactAsync) {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                        setEngagementTab(tab);
                      }}
                      className={`rounded-full items-center justify-center ${engagementTab === tab ? "bg-white/10" : ""}`}
                      style={{ width: 36, height: 36, padding: 8 }}
                    >
                      <Text
                        className={`text-[12px] ${engagementTab === tab ? "text-white font-medium" : "text-white/40"}`}
                      >
                        {tab}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Horizontal Bars Container */}
              <View className="relative mt-2 mb-2">
                {/* Background Grid Lines */}
                <View className="absolute left-0 top-[-8px] bottom-[-8px] flex-row justify-between z-0" style={{ width: '97%' }}>
                  <View className="w-px h-full bg-[#FFFFFF1A]" />
                  <View className="w-px h-full bg-[#FFFFFF1A]" />
                  <View className="w-px h-full bg-[#FFFFFF1A]" />
                  <View className="w-px h-full bg-[#FFFFFF1A]" />
                  <View className="w-px h-full bg-[#FFFFFF1A]" />
                </View>

                {/* Bars */}
                <View className="gap-3 z-10 w-full relative">
                  <View className="flex-row items-center relative gap-3">
                    <View className="bg-[#F59E0B] rounded-[8px] h-10 flex-row items-center px-4" style={{ width: `${Math.max(30, likesPercent)}%` }}>
                      <Text className="text-white text-[13px] font-medium font-inter">Likes</Text>
                    </View>
                    <Text className="text-white text-[12px] font-inter">{likesPercent}%</Text>
                  </View>

                  <View className="flex-row items-center relative gap-3">
                    <View className="bg-[#04C4FF] rounded-[8px] h-10 flex-row items-center px-4" style={{ width: `${Math.max(30, commentsPercent)}%` }}>
                      <Text className="text-white text-[13px] font-medium font-inter">Comments</Text>
                    </View>
                    <Text className="text-white text-[12px] font-inter">{commentsPercent}%</Text>
                  </View>

                  <View className="flex-row items-center relative gap-3">
                    <View className="bg-[#FE5802] rounded-[8px] h-10 flex-row items-center px-4" style={{ width: `${Math.max(30, sharesPercent)}%` }}>
                      <Text className="text-white text-[13px] font-medium font-inter">Shares</Text>
                    </View>
                    <Text className="text-white text-[12px] font-inter">{sharesPercent}%</Text>
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
