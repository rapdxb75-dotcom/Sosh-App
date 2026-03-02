import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Stack, useFocusEffect } from "expo-router";
import { ChevronDown, Minus, Plus, TrendingUp } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Defs, Stop, LinearGradient as SvgGradient } from "react-native-svg";
import { useSelector } from "react-redux";
import {
  VictoryArea,
  VictoryAxis,
  VictoryChart,
  VictoryGroup,
} from "victory-native";
import Header from "../../components/common/Header";
import { listenToUserData } from "../../services/firebase";
import { RootState } from "../../store/store";

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

// --- Components ---

const FILTER_OPTIONS = ["last 30 days", "last 90 days", "YTD", "All time"];

const InlineDropdown = ({
  visible,
  onClose,
  options,
  onSelect,
  selectedValue,
}: {
  visible: boolean;
  onClose: () => void;
  options: string[];
  onSelect: (option: string) => void;
  selectedValue: string;
}) => {
  if (!visible) return null;
  return (
    <View style={{ position: "absolute", top: 22, left: 0, zIndex: 100 }}>
      <View
        style={{
          backgroundColor: "#2A2A2A",
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.15)",
          paddingVertical: 2,
          minWidth: 120,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => {
              onSelect(option);
              onClose();
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 10,
              paddingVertical: 6,
              backgroundColor:
                selectedValue === option
                  ? "rgba(255,255,255,0.1)"
                  : "transparent",
            }}
          >
            <Text
              style={{
                color:
                  selectedValue === option ? "#fff" : "rgba(255,255,255,0.6)",
                fontSize: 11,
                fontWeight: selectedValue === option ? "600" : "400",
              }}
            >
              {option}
            </Text>
            {selectedValue === option && (
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 2.5,
                  backgroundColor: "#04C4FF",
                }}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const PlatformSkeletonCard = () => {
  const [pulseAnim] = useState(new Animated.Value(0.3));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

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
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Animated.View
                className="rounded-xl mr-3 mb-4"
                style={{
                  width: 35,
                  height: 35,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  opacity: pulseAnim,
                }}
              />
              <View>
                <View className="flex-row items-center mb-1">
                  <Animated.View
                    style={{
                      width: 100,
                      height: 20,
                      borderRadius: 4,
                      backgroundColor: "rgba(255,255,255,0.2)",
                      marginRight: 8,
                      opacity: pulseAnim,
                    }}
                  />
                  <Animated.View
                    style={{
                      width: 80,
                      height: 14,
                      borderRadius: 4,
                      backgroundColor: "rgba(255,255,255,0.1)",
                      opacity: pulseAnim,
                    }}
                  />
                </View>
                <Animated.View
                  className="mt-2.5 self-start justify-center"
                  style={{
                    width: 120,
                    height: 28,
                    borderRadius: 8,
                    backgroundColor: "rgba(255,255,255,0.1)",
                    opacity: pulseAnim,
                  }}
                />
              </View>
            </View>
            <Animated.View
              className="items-center justify-center"
              style={{
                width: 40,
                height: 40,
                borderRadius: 100,
                backgroundColor: "rgba(255,255,255,0.1)",
                marginBottom: 16,
                opacity: pulseAnim,
              }}
            />
          </View>
        </View>
      </BlurView>
    </View>
  );
};

const PlatformCard = ({
  platform,
  isExpanded,
  onToggle,
  screenWidth,
}: {
  platform: PlatformData;
  isExpanded: boolean;
  onToggle: () => void;
  screenWidth: number;
}) => {
  const [engagementTab, setEngagementTab] = useState("W1");
  const [viewsFilter, setViewsFilter] = useState("last 30 days");
  const [isViewsDropdownOpen, setIsViewsDropdownOpen] = useState(false);
  const [engagementFilter, setEngagementFilter] = useState("last 30 days");
  const [isEngagementDropdownOpen, setIsEngagementDropdownOpen] =
    useState(false);
  const [viewsTab, setViewsTab] = useState("W1");

  const viewsTabsOptions =
    viewsFilter === "last 30 days"
      ? ["W1", "W2", "W3", "W4"]
      : viewsFilter === "last 90 days"
        ? ["M1", "M2", "M3"]
        : [];
  const engagementTabsOptions =
    engagementFilter === "last 30 days"
      ? ["W1", "W2", "W3", "W4"]
      : engagementFilter === "last 90 days"
        ? ["M1", "M2", "M3"]
        : [];

  const handleViewsFilterSelect = (filterVal: string) => {
    setViewsFilter(filterVal);
    setEngagementFilter(filterVal);
    if (filterVal === "last 30 days") {
      setViewsTab("W1");
      setEngagementTab("W1");
    } else if (filterVal === "last 90 days") {
      setViewsTab("M1");
      setEngagementTab("M1");
    } else {
      setViewsTab(filterVal);
      setEngagementTab(filterVal);
    }
  };

  const handleEngagementFilterSelect = (filterVal: string) => {
    setEngagementFilter(filterVal);
    if (filterVal === "last 30 days") setEngagementTab("W1");
    else if (filterVal === "last 90 days") setEngagementTab("M1");
    else setEngagementTab(filterVal);
  };

  const chartData = dummyChartData[viewsTab] || dummyChartData["W1"];

  const chartTickValues =
    viewsFilter === "last 90 days"
      ? [1, 2, 3, 4]
      : viewsFilter === "YTD"
        ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        : [1, 2, 3, 4, 5, 6, 7];

  const formatFilterDisplay = (baseText: string, filterVal: string) => {
    if (filterVal === "last 30 days") return `${baseText} 30 days`;
    if (filterVal === "last 90 days") return `${baseText} 90 days`;
    return `${baseText} ${filterVal}`;
  };

  const formatCompactNumber = (number: number) => {
    if (number >= 1000000) {
      return parseFloat((number / 1000000).toFixed(2)) + "M";
    }
    if (number >= 1000) {
      return parseFloat((number / 1000).toFixed(2)) + "K";
    }
    return Number.isInteger(number)
      ? number.toString()
      : parseFloat(number.toFixed(2)).toString();
  };

  const getMultiplierForTab = (tab: string) => {
    switch (tab) {
      case "W1":
      case "M1":
        return { likes: 1, comments: 1, shares: 1 };
      case "W2":
      case "M2":
        return { likes: 1.2, comments: 0.8, shares: 1.1 };
      case "W3":
      case "M3":
        return { likes: 1.9, comments: 1.3, shares: 1.8 };
      case "W4":
        return { likes: 1.1, comments: 0.9, shares: 1.4 };
      case "YTD":
        return { likes: 3.5, comments: 2.0, shares: 1.8 };
      case "All time":
        return { likes: 10.5, comments: 5.0, shares: 4.8 };
      default:
        return { likes: 1, comments: 1, shares: 1 };
    }
  };

  const multiplier = getMultiplierForTab(engagementTab);
  const likesVal = platform.metrics.likes * multiplier.likes;
  const commentsVal = platform.metrics.comments * multiplier.comments;
  const sharesVal = platform.metrics.shares * multiplier.shares;

  const totalEngagement = likesVal + commentsVal + sharesVal;
  const likesPercent =
    totalEngagement > 0 ? Math.round((likesVal / totalEngagement) * 100) : 0;
  const commentsPercent =
    totalEngagement > 0 ? Math.round((commentsVal / totalEngagement) * 100) : 0;
  const sharesPercent =
    totalEngagement > 0 ? Math.round((sharesVal / totalEngagement) * 100) : 0;

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
                    backgroundColor: "#098F3E1F",
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
              style={{
                width: 40,
                height: 40,
                borderRadius: 100,
                padding: 4,
                backgroundColor: "#FFFFFF1A",
                marginBottom: 16,
              }}
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
              <View
                style={{
                  position: "relative",
                  zIndex: isViewsDropdownOpen ? 100 : 1,
                }}
              >
                <TouchableOpacity
                  className="flex-row items-center"
                  onPress={() => {
                    setIsViewsDropdownOpen(!isViewsDropdownOpen);
                    setIsEngagementDropdownOpen(false);
                  }}
                >
                  <Text
                    className="text-white/40 text-[14px] font-inter font-semibold mr-1"
                    style={{ letterSpacing: -0.89 }}
                  >
                    {formatFilterDisplay("Views", viewsFilter)}
                  </Text>
                  <ChevronDown size={14} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
                <InlineDropdown
                  visible={isViewsDropdownOpen}
                  onClose={() => setIsViewsDropdownOpen(false)}
                  options={FILTER_OPTIONS}
                  onSelect={handleViewsFilterSelect}
                  selectedValue={viewsFilter}
                />
              </View>

              <View className="flex-row items-center justify-between mb-2 mt-2">
                <Text className="text-white text-[33px] font-bold font-inter tracking-tight">
                  {formatCompactNumber(platform.metrics.views)}
                </Text>
                <View className="flex-row items-center gap-[10px]">
                  {viewsTabsOptions.map((tab) => (
                    <TouchableOpacity
                      key={tab}
                      onPress={() => {
                        if (
                          typeof Haptics !== "undefined" &&
                          Haptics.impactAsync
                        ) {
                          Haptics.impactAsync(
                            Haptics.ImpactFeedbackStyle.Light
                          );
                        }
                        setViewsTab(tab);
                      }}
                      className={`rounded-full items-center justify-center ${viewsTab === tab ? "bg-white/10" : ""}`}
                      style={{ width: 36, height: 36, padding: 8 }}
                    >
                      <Text
                        className={`text-[12px] ${viewsTab === tab ? "text-white font-medium" : "text-white/40"}`}
                      >
                        {tab}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Area Chart */}
              <View
                style={{ height: 180, marginHorizontal: -20, marginBottom: 10 }}
              >
                <VictoryChart
                  width={screenWidth - 40}
                  height={180}
                  padding={{ top: 10, bottom: 30, left: 20, right: 20 }}
                >
                  <VictoryAxis
                    tickValues={chartTickValues}
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
                      <Stop
                        offset="92.05%"
                        stopColor="rgba(42, 157, 144, 0.1)"
                        stopOpacity="0.1"
                      />
                    </SvgGradient>
                  </Defs>
                </VictoryChart>
              </View>

              {/* Engagement Section */}
              <View
                className="mt-8"
                style={{
                  position: "relative",
                  zIndex: isEngagementDropdownOpen ? 100 : 1,
                }}
              >
                <TouchableOpacity
                  className="flex-row items-center"
                  onPress={() => {
                    setIsEngagementDropdownOpen(!isEngagementDropdownOpen);
                    setIsViewsDropdownOpen(false);
                  }}
                >
                  <Text
                    className="text-white/40 text-[14px] font-inter font-semibold mr-1"
                    style={{ letterSpacing: -0.89 }}
                  >
                    {formatFilterDisplay("Engagement", engagementFilter)}
                  </Text>
                  <ChevronDown size={14} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
                <InlineDropdown
                  visible={isEngagementDropdownOpen}
                  onClose={() => setIsEngagementDropdownOpen(false)}
                  options={FILTER_OPTIONS}
                  onSelect={handleEngagementFilterSelect}
                  selectedValue={engagementFilter}
                />
              </View>

              <View className="flex-row items-center justify-between mt-2 mb-6">
                <Text className="text-white text-[33px] font-bold font-inter tracking-tight">
                  {formatCompactNumber(totalEngagement)}
                </Text>
                <View className="flex-row items-center gap-[10px]">
                  {engagementTabsOptions.map((tab) => (
                    <TouchableOpacity
                      key={tab}
                      onPress={() => {
                        if (
                          typeof Haptics !== "undefined" &&
                          Haptics.impactAsync
                        ) {
                          Haptics.impactAsync(
                            Haptics.ImpactFeedbackStyle.Light
                          );
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
                <View
                  className="absolute left-0 top-[-8px] bottom-[-8px] flex-row justify-between z-0"
                  style={{ width: "97%" }}
                >
                  <View className="w-px h-full bg-[#FFFFFF1A]" />
                  <View className="w-px h-full bg-[#FFFFFF1A]" />
                  <View className="w-px h-full bg-[#FFFFFF1A]" />
                  <View className="w-px h-full bg-[#FFFFFF1A]" />
                  <View className="w-px h-full bg-[#FFFFFF1A]" />
                </View>

                {/* Bars */}
                <View className="gap-3 z-10 w-full relative">
                  <View className="flex-row items-center relative gap-3">
                    <View
                      className="bg-[#F59E0B] rounded-[8px] h-10 flex-row items-center px-4"
                      style={{ width: `${Math.max(30, likesPercent)}%` }}
                    >
                      <Text className="text-white text-[13px] font-medium font-inter">
                        Likes
                      </Text>
                    </View>
                    <Text className="text-white text-[12px] font-inter">
                      {likesPercent}%
                    </Text>
                  </View>

                  <View className="flex-row items-center relative gap-3">
                    <View
                      className="bg-[#04C4FF] rounded-[8px] h-10 flex-row items-center px-4"
                      style={{ width: `${Math.max(30, commentsPercent)}%` }}
                    >
                      <Text className="text-white text-[13px] font-medium font-inter">
                        Comments
                      </Text>
                    </View>
                    <Text className="text-white text-[12px] font-inter">
                      {commentsPercent}%
                    </Text>
                  </View>

                  <View className="flex-row items-center relative gap-3">
                    <View
                      className="bg-[#FE5802] rounded-[8px] h-10 flex-row items-center px-4"
                      style={{ width: `${Math.max(30, sharesPercent)}%` }}
                    >
                      <Text className="text-white text-[13px] font-medium font-inter">
                        Shares
                      </Text>
                    </View>
                    <Text className="text-white text-[12px] font-inter">
                      {sharesPercent}%
                    </Text>
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
  M1: [
    { x: 1, y: 2.5, y2: 2.0 },
    { x: 2, y: 3.0, y2: 2.5 },
    { x: 3, y: 3.5, y2: 3.0 },
    { x: 4, y: 4.0, y2: 3.5 },
  ],
  M2: [
    { x: 1, y: 2.8, y2: 2.2 },
    { x: 2, y: 3.2, y2: 2.8 },
    { x: 3, y: 3.8, y2: 3.5 },
    { x: 4, y: 4.5, y2: 4.0 },
  ],
  M3: [
    { x: 1, y: 3.0, y2: 2.5 },
    { x: 2, y: 3.5, y2: 3.0 },
    { x: 3, y: 4.2, y2: 3.8 },
    { x: 4, y: 5.0, y2: 4.5 },
  ],
  YTD: [
    { x: 1, y: 2.0, y2: 1.5 },
    { x: 2, y: 2.5, y2: 2.0 },
    { x: 3, y: 3.0, y2: 2.5 },
    { x: 4, y: 3.5, y2: 3.0 },
    { x: 5, y: 4.0, y2: 3.5 },
    { x: 6, y: 4.5, y2: 4.0 },
    { x: 7, y: 5.0, y2: 4.5 },
    { x: 8, y: 5.5, y2: 5.0 },
    { x: 9, y: 5.2, y2: 4.8 },
    { x: 10, y: 6.0, y2: 5.5 },
    { x: 11, y: 6.5, y2: 6.0 },
    { x: 12, y: 7.0, y2: 6.5 },
  ],
  "All time": [
    { x: 1, y: 4.0, y2: 3.5 },
    { x: 2, y: 4.5, y2: 4.0 },
    { x: 3, y: 5.5, y2: 5.0 },
    { x: 4, y: 6.5, y2: 6.0 },
    { x: 5, y: 6.0, y2: 5.5 },
    { x: 6, y: 7.0, y2: 6.5 },
    { x: 7, y: 8.0, y2: 7.5 },
  ],
};

export default function Analysis() {
  const { width } = useWindowDimensions();
  const [expandedPlatform, setExpandedPlatform] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  const globalEmail = useSelector((state: RootState) => state.user.email);
  const [platformsData, setPlatformsData] = useState<PlatformData[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  useEffect(() => {
    if (!globalEmail) {
      setLoading(false);
      return;
    }

    const unsubscribe = listenToUserData(
      globalEmail,
      (userData) => {
        if (userData) {
          const analytics = userData.analytics || {};
          const platforms: PlatformData[] = [
            {
              id: "instagram",
              name: "Instagram",
              icon: require("../../assets/icons/instagram.png"),
              followers: `+ ${analytics.instagram?.followersCount || 0} followers`,
              growth: "0% this month",
              metrics: {
                views: analytics.instagram?.viewsCount || 0,
                likes: analytics.instagram?.likesCount || 0,
                comments: analytics.instagram?.commentsCount || 0,
                shares: 0,
              },
            },
            {
              id: "tiktok",
              name: "TikTok",
              icon: require("../../assets/icons/tiktok.png"),
              followers: `+ ${analytics.tiktok?.followerCount || 0} followers`,
              growth: "0% this month",
              metrics: {
                views: analytics.tiktok?.viewCountTotal || 0,
                likes: analytics.tiktok?.likeCountTotal || 0,
                comments: analytics.tiktok?.commentCountTotal || 0,
                shares: analytics.tiktok?.shareCountTotal || 0,
              },
            },
            {
              id: "facebook",
              name: "Facebook",
              icon: require("../../assets/icons/facebook.png"),
              followers: `+ ${analytics.facebook?.followersCount || 0} followers`,
              growth: "0% this month",
              metrics: {
                views:
                  (analytics.facebook?.pageVideoViews || 0) +
                  (analytics.facebook?.pageMediaView || 0),
                likes: analytics.facebook?.likesCount || 0,
                comments: analytics.facebook?.pagePostEngagements || 0,
                shares: 0,
              },
            },
            {
              id: "youtube",
              name: "YouTube",
              icon: require("../../assets/icons/youtube.png"),
              followers: `+ ${analytics.youtube?.subscriberCount || 0} subscribers`,
              growth: "0% this month",
              metrics: {
                views: analytics.youtube?.viewCount || 0,
                likes: analytics.youtube?.likes || 0,
                comments: analytics.youtube?.comments || 0,
                shares: analytics.youtube?.shares || 0,
              },
            },
            {
              id: "twitter",
              name: "Twitter",
              icon: require("../../assets/icons/twitter.png"),
              followers: `+ ${analytics.twitter?.followersCount || 0} followers`,
              growth: "0% this month",
              metrics: {
                views: 0,
                likes: analytics.twitter?.likeCount || 0,
                comments: 0,
                shares: 0,
              },
            },
            {
              id: "snapchat",
              name: "Snapchat",
              icon: require("../../assets/icons/snapchat.png"),
              followers: `+ ${analytics.snapchat?.subscribers || 0} subscribers`,
              growth: "0% this month",
              metrics: {
                views: analytics.snapchat?.views || 0,
                likes:
                  analytics.snapchat?.favorites ||
                  analytics.snapchat?.interactions ||
                  0,
                comments: analytics.snapchat?.replies || 0,
                shares: analytics.snapchat?.shares || 0,
              },
            },
          ];

          setPlatformsData(platforms);
        } else {
          setPlatformsData([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Firebase fetch error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [globalEmail]);

  return (
    <View className="flex-1">
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        ref={scrollRef}
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

          {loading ? (
            <>
              {[1, 2, 3, 4].map((key) => (
                <PlatformSkeletonCard key={key} />
              ))}
            </>
          ) : (
            platformsData.map((platform) => (
              <PlatformCard
                key={platform.id}
                platform={platform}
                isExpanded={expandedPlatform === platform.id}
                onToggle={() =>
                  setExpandedPlatform(
                    expandedPlatform === platform.id ? "" : platform.id
                  )
                }
                screenWidth={width}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
