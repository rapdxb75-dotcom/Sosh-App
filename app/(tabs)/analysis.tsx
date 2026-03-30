import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Stack, useFocusEffect } from "expo-router";
import { Minus, Plus, TrendingUp } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Defs, Stop, LinearGradient as SvgGradient } from "react-native-svg";
import { useSelector } from "react-redux";
import {
  VictoryArea,
  VictoryAxis,
  VictoryChart,
  VictoryGroup,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from "victory-native";
import Header from "../../components/common/Header";
import { getCurrentUserData, listenToUserData } from "../../services/firebase";
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

const AnimatedCounter = ({ value }: { value: number }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value,
      duration: 1000,
      useNativeDriver: false,
    }).start();

    const id = animatedValue.addListener((state) => {
      setDisplayValue(Math.floor(state.value));
    });

    return () => {
      animatedValue.removeListener(id);
    };
  }, [value]);

  const formatCompactNumber = (number: number) => {
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + "M";
    }
    if (number >= 1000) {
      return (number / 1000).toFixed(1) + "K";
    }
    return Math.round(number).toString();
  };

  return (
    <Text className="text-white text-[33px] font-bold font-inter tracking-tight">
      {formatCompactNumber(displayValue)}
    </Text>
  );
};

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
      ]),
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
  const [engagementTab, setEngagementTab] = useState("M1");
  // const viewsFilter = "last 90 days"; // Hardcoded to 90 days
  // const engagementFilter = "last 90 days"; // Hardcoded to 90 days
  const [viewsTab, setViewsTab] = useState("M1");

  const getFilterDays = (platformId: string) => {
    switch (platformId.toLowerCase()) {
      case "facebook":
        return "85 days";
      case "instagram":
        return "90 days";
      case "youtube":
        return "90 days";
      case "tiktok":
        return "60 days";
      case "snapchat":
        return "90 days";
      case "twitter":
      case "x":
        return "90 days";
      default:
        return "90 days";
    }
  };

  const platformDays = getFilterDays(platform.id);
  const viewsFilter = `last ${platformDays}`;
  const engagementFilter = `last ${platformDays}`;

  const likesAnim = useRef(new Animated.Value(0)).current;
  const commentsAnim = useRef(new Animated.Value(0)).current;
  const sharesAnim = useRef(new Animated.Value(0)).current;

  // Hardcoded to 90 days, so always use M1, M2, M3 tabs
  // const viewsTabsOptions = ["M1", "M2", "M3"];
  // const engagementTabsOptions = ["M1", "M2", "M3"];
  const viewsTabsOptions: string[] = [];
  const engagementTabsOptions: string[] = [];

  const getMultiplierForTab = (tab: string) => {
    // Current analytics from platform represent the 90-day total.
    // We treat this total as the M3 result (the end of the 90 day period).
    // M1 and M2 are derived as steps leading up to that total.

    const base = {
      likes: platform.metrics.likes,
      comments: platform.metrics.comments,
      shares: platform.metrics.shares,
      views: platform.metrics.views,
    };

    return base;

    /*
    switch (tab) {
      case "M3":
        return base;
      case "M2":
        return {
          likes: Math.round(base.likes * 0.65),
          comments: Math.round(base.comments * 0.6),
          shares: Math.round(base.shares * 0.55),
          views: Math.round(base.views * 0.7),
        };
      case "M1":
        return {
          likes: Math.round(base.likes * 0.35),
          comments: Math.round(base.comments * 0.25),
          shares: Math.round(base.shares * 0.2),
          views: Math.round(base.views * 0.4),
        };
      default:
        return base;
    }
    */
  };

  const multiplier = getMultiplierForTab(engagementTab);
  const viewsMultiplier = getMultiplierForTab(viewsTab);

  const likesVal = multiplier.likes;
  const commentsVal = multiplier.comments;
  const sharesVal = multiplier.shares;
  const currentViews = viewsMultiplier.views;

  const totalEngagement = likesVal + commentsVal + sharesVal;
  const likesPercent =
    totalEngagement > 0 ? (likesVal / totalEngagement) * 100 : 0;
  const commentsPercent =
    totalEngagement > 0 ? (commentsVal / totalEngagement) * 100 : 0;
  const sharesPercent =
    totalEngagement > 0 ? (sharesVal / totalEngagement) * 100 : 0;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(likesAnim, {
        toValue: likesPercent,
        duration: 600,
        useNativeDriver: false,
      }),
      Animated.timing(commentsAnim, {
        toValue: commentsPercent,
        duration: 600,
        useNativeDriver: false,
      }),
      Animated.timing(sharesAnim, {
        toValue: sharesPercent,
        duration: 600,
        useNativeDriver: false,
      }),
    ]).start();
  }, [likesPercent, commentsPercent, sharesPercent]);

  const chartData = (dummyChartData[viewsTab] || dummyChartData["M1"]).map(
    (d) => {
      const viewsLimit = getMultiplierForTab(viewsTab).views;
      // Map the dummy points to fit the current target views
      // M3 is the total 90-day data. M1/M2 are fractions.
      let baselineValue = 534; // M1 baseline
      if (viewsTab === "M2") baselineValue = 812;
      else if (viewsTab === "M3") baselineValue = 1240;

      const factor = viewsLimit / baselineValue;

      return { ...d, y: d.y2 * factor, y2: d.y2 * factor };
    },
  );

  const chartTickValues = [1, 2, 3, 4];

  const formatFilterDisplay = (baseText: string, filterVal: string) => {
    // if (filterVal === "last 30 days") return `${baseText} 30 days`;
    // if (filterVal === "last 90 days") return `${baseText} 90 days`;
    // return `${baseText} ${filterVal}`;
    return `${baseText} ${filterVal}`;
  };

  const formatCompactNumber = (number: number) => {
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + "M";
    }
    if (number >= 1000) {
      return (number / 1000).toFixed(1) + "K";
    }
    return Math.round(number).toString();
  };

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
                  zIndex: 1,
                }}
              >
                {/* Dropdown functionality commented out - hardcoded to 30 days */}
                {/* <TouchableOpacity
                  className="flex-row items-center"
                  onPress={() => {
                    setIsViewsDropdownOpen(!isViewsDropdownOpen);
                    setIsEngagementDropdownOpen(false);
                  }}
                > */}
                <Text
                  className="text-white/40 text-[14px] font-inter font-semibold mr-1"
                  style={{ letterSpacing: -0.89 }}
                >
                  {formatFilterDisplay("Views", viewsFilter)}
                </Text>
                {/* <ChevronDown size={14} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
                <InlineDropdown
                  visible={isViewsDropdownOpen}
                  onClose={() => setIsViewsDropdownOpen(false)}
                  options={FILTER_OPTIONS}
                  onSelect={handleViewsFilterSelect}
                  selectedValue={viewsFilter}
                /> */}
              </View>

              <View className="flex-row items-center justify-between mb-2 mt-2">
                <AnimatedCounter value={currentViews} />
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
                            Haptics.ImpactFeedbackStyle.Light,
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
                  padding={{ top: 25, bottom: 30, left: 20, right: 20 }}
                  domainPadding={{ y: [0, 20] }}
                  containerComponent={
                    <VictoryVoronoiContainer
                      labels={({ datum }) => `Views: ${Math.round(datum.y2)}`}
                      labelComponent={
                        <VictoryTooltip
                          renderInPortal={false}
                          constrainToVisibleArea={true}
                          centerOffset={{ x: 0, y: -10 }}
                          flyoutStyle={{
                            fill: "#1A1A1A",
                            stroke: "#F59E0B",
                            strokeWidth: 1.2,
                          }}
                          style={{
                            fill: "#FFFFFF",
                            fontSize: 10,
                            fontWeight: "600",
                          }}
                          pointerLength={5}
                          cornerRadius={8}
                          flyoutPadding={{
                            top: 5,
                            bottom: 5,
                            left: 8,
                            right: 8,
                          }}
                        />
                      }
                    />
                  }
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
                      animate={{
                        duration: 800,
                        onLoad: { duration: 400 },
                      }}
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
                  zIndex: 1,
                }}
              >
                {/* Dropdown functionality commented out - hardcoded to 30 days */}
                {/* <TouchableOpacity
                  className="flex-row items-center"
                  onPress={() => {
                    setIsEngagementDropdownOpen(!isEngagementDropdownOpen);
                    setIsViewsDropdownOpen(false);
                  }}
                > */}
                <Text
                  className="text-white/40 text-[14px] font-inter font-semibold mr-1"
                  style={{ letterSpacing: -0.89 }}
                >
                  {formatFilterDisplay("Engagement", engagementFilter)}
                </Text>
                {/* <ChevronDown size={14} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
                <InlineDropdown
                  visible={isEngagementDropdownOpen}
                  onClose={() => setIsEngagementDropdownOpen(false)}
                  options={FILTER_OPTIONS}
                  onSelect={handleEngagementFilterSelect}
                  selectedValue={engagementFilter}
                /> */}
              </View>

              <View className="flex-row items-center justify-between mt-2 mb-6">
                <AnimatedCounter value={totalEngagement} />
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
                            Haptics.ImpactFeedbackStyle.Light,
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
              <View className="relative mt-2 mb-2 flex-1">
                {/* Background Grid Lines */}
                <View
                  className="absolute left-0 top-[-8px] bottom-[-8px] flex-row justify-between z-0"
                  style={{ width: "100%", paddingRight: 40 }}
                >
                  <View className="w-px h-full bg-[#FFFFFF1A]" />
                  <View className="w-px h-full bg-[#FFFFFF1A]" />
                  <View className="w-px h-full bg-[#FFFFFF1A]" />
                  <View className="w-px h-full bg-[#FFFFFF1A]" />
                  <View className="w-px h-full bg-[#FFFFFF1A]" />
                </View>

                {/* Bars */}
                <View className="gap-3 z-10 w-full relative">
                  <View className="flex-row items-center relative">
                    <Animated.View
                      className="bg-[#F59E0B] rounded-[8px] h-10 flex-row items-center px-4"
                      style={{
                        width: likesAnim.interpolate({
                          inputRange: [0, 100],
                          outputRange: ["25%", "90%"],
                        }),
                        marginRight: 12,
                      }}
                    >
                      <Text
                        className="text-white text-[13px] font-medium font-inter"
                        numberOfLines={1}
                      >
                        Likes
                      </Text>
                    </Animated.View>
                    <Text className="text-white text-[12px] font-inter">
                      {formatCompactNumber(likesVal)}
                    </Text>
                  </View>

                  <View className="flex-row items-center relative">
                    <Animated.View
                      className="bg-[#04C4FF] rounded-[8px] h-10 flex-row items-center px-4"
                      style={{
                        width: commentsAnim.interpolate({
                          inputRange: [0, 100],
                          outputRange: ["25%", "90%"],
                        }),
                        marginRight: 12,
                      }}
                    >
                      <Text
                        className="text-white text-[13px] font-medium font-inter"
                        numberOfLines={1}
                      >
                        {platform.id === "snapchat"
                          ? "Story Views"
                          : "Comments"}
                      </Text>
                    </Animated.View>
                    <Text className="text-white text-[12px] font-inter">
                      {formatCompactNumber(commentsVal)}
                    </Text>
                  </View>

                  <View className="flex-row items-center relative">
                    <Animated.View
                      className="bg-[#FE5802] rounded-[8px] h-10 flex-row items-center px-4"
                      style={{
                        width: sharesAnim.interpolate({
                          inputRange: [0, 100],
                          outputRange: ["25%", "90%"],
                        }),
                        marginRight: 12,
                      }}
                    >
                      <Text
                        className="text-white text-[13px] font-medium font-inter"
                        numberOfLines={1}
                      >
                        Shares
                      </Text>
                    </Animated.View>
                    <Text className="text-white text-[12px] font-inter">
                      {formatCompactNumber(sharesVal)}
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
    { x: 1, y: 1.5, y2: 0.8 },
    { x: 2, y: 3.2, y2: 1.5 },
    { x: 3, y: 1.8, y2: 3.2 },
    { x: 4, y: 3.8, y2: 1.8 },
    { x: 5, y: 2.2, y2: 4.5 },
    { x: 6, y: 4.5, y2: 2.5 },
    { x: 7, y: 3.5, y2: 4.8 },
  ],
  W2: [
    { x: 1, y: 1.8, y2: 2.5 },
    { x: 2, y: 3.5, y2: 1.8 },
    { x: 3, y: 2.5, y2: 3.5 },
    { x: 4, y: 4.5, y2: 2.2 },
    { x: 5, y: 3.2, y2: 4.2 },
    { x: 6, y: 5.2, y2: 3.5 },
    { x: 7, y: 4.2, y2: 5.5 },
  ],
  W3: [
    { x: 1, y: 2.5, y2: 3.5 },
    { x: 2, y: 4.8, y2: 2.2 },
    { x: 3, y: 3.2, y2: 4.8 },
    { x: 4, y: 5.5, y2: 3.5 },
    { x: 5, y: 4.2, y2: 5.5 },
    { x: 6, y: 6.2, y2: 4.2 },
    { x: 7, y: 5.2, y2: 6.8 },
  ],
  W4: [
    { x: 1, y: 3.2, y2: 4.2 },
    { x: 2, y: 5.5, y2: 3.2 },
    { x: 3, y: 4.2, y2: 5.5 },
    { x: 4, y: 6.5, y2: 4.2 },
    { x: 5, y: 5.2, y2: 6.5 },
    { x: 6, y: 7.2, y2: 5.2 },
    { x: 7, y: 6.2, y2: 7.8 },
  ],
  M1: [
    { x: 1, y: 1.5, y2: 300 },
    { x: 2, y: 3.8, y2: 150 },
    { x: 3, y: 2.2, y2: 400 },
    { x: 4, y: 4.5, y2: 534 },
  ],
  M2: [
    { x: 1, y: 2.2, y2: 400 },
    { x: 2, y: 4.5, y2: 600 },
    { x: 3, y: 3.2, y2: 812 },
    { x: 4, y: 5.8, y2: 700 },
  ],
  M3: [
    { x: 1, y: 3.2, y2: 600 },
    { x: 2, y: 5.5, y2: 800 },
    { x: 3, y: 4.2, y2: 1000 },
    { x: 4, y: 6.8, y2: 1240 },
  ],
  YTD: [
    { x: 1, y: 1.5, y2: 2.5 },
    { x: 2, y: 3.0, y2: 1.8 },
    { x: 3, y: 2.2, y2: 3.5 },
    { x: 4, y: 4.5, y2: 2.8 },
    { x: 5, y: 3.5, y2: 4.8 },
    { x: 6, y: 5.5, y2: 3.8 },
    { x: 7, y: 4.8, y2: 6.2 },
    { x: 8, y: 6.5, y2: 5.2 },
    { x: 9, y: 5.2, y2: 6.8 },
    { x: 10, y: 7.5, y2: 5.8 },
    { x: 11, y: 6.2, y2: 8.2 },
    { x: 12, y: 8.5, y2: 6.8 },
  ],
  "All time": [
    { x: 1, y: 2.5, y2: 3.5 },
    { x: 2, y: 4.5, y2: 2.8 },
    { x: 3, y: 3.8, y2: 5.2 },
    { x: 4, y: 5.8, y2: 4.2 },
    { x: 5, y: 5.0, y2: 6.5 },
    { x: 6, y: 7.5, y2: 5.5 },
    { x: 7, y: 6.8, y2: 8.5 },
  ],
};

export default function Analysis() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [expandedPlatform, setExpandedPlatform] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  const globalEmail = useSelector((state: RootState) => state.user.email);
  const [platformsData, setPlatformsData] = useState<PlatformData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const buildPlatformsData = (userData: any): PlatformData[] => {
    const analytics = userData.analytics || {};

    const calculateGrowth = (metrics: any) => {
      const views = metrics.views || 0;
      const engagement =
        (metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0);

      if (views === 0 && engagement === 0) return "0% this month";

      // Calculate growth based on views and engagement weight
      // More views or engagement = higher growth percentage
      const totalPower = views + engagement * 10;
      let growth;

      if (totalPower > 50000) growth = 24.5;
      else if (totalPower > 10000) growth = 18.2;
      else if (totalPower > 1000) growth = 12.4;
      else if (totalPower > 100) growth = 8.7;
      else growth = 4.2;

      return `${growth}% this month`;
    };

    const platforms: PlatformData[] = [
      {
        id: "instagram",
        name: "Instagram",
        icon: require("../../assets/icons/instagram.png"),
        followers: `+ ${analytics.instagram?.followersCount || 0} followers`,
        growth: calculateGrowth({
          views: analytics.instagram?.viewsCount,
          likes: analytics.instagram?.likesCount,
          comments: analytics.instagram?.commentsCount,
        }),
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
        growth: calculateGrowth({
          views: analytics.tiktok?.viewCountTotal,
          likes: analytics.tiktok?.likeCountTotal,
          comments: analytics.tiktok?.commentCountTotal,
          shares: analytics.tiktok?.shareCountTotal,
        }),
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
        growth: calculateGrowth({
          views:
            (analytics.facebook?.pageVideoViews || 0) +
            (analytics.facebook?.pageMediaView || 0),
          likes: analytics.facebook?.likesCount,
          comments: analytics.facebook?.pagePostEngagements,
        }),
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
        growth: calculateGrowth({
          views: analytics.youtube?.viewCount,
          likes: analytics.youtube?.likes,
          comments: analytics.youtube?.comments,
          shares: analytics.youtube?.shares,
        }),
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
        growth: calculateGrowth({
          likes: analytics.twitter?.likeCount,
        }),
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
        growth: calculateGrowth({
          views:
            analytics.snapchat?.spotlightViews || analytics.snapchat?.views,
          likes: analytics.snapchat?.favorites,
          comments: analytics.snapchat?.replies,
          shares: analytics.snapchat?.shares,
        }),
        metrics: {
          views:
            analytics.snapchat?.spotlightViews ||
            analytics.snapchat?.views ||
            0,
          likes: analytics.snapchat?.favorites || 0,
          comments: analytics.snapchat?.storyViews || 0,
          shares: analytics.snapchat?.shares || 0,
        },
      },
    ];

    return platforms.filter((platform) => {
      // Show only connected accounts
      // Check for user connection data (array structure in the root of userData)
      const connectionData = userData[platform.id];
      const hasConnection =
        connectionData &&
        Array.isArray(connectionData) &&
        connectionData.length > 0;

      return hasConnection;
    });
  };

  const handleRefresh = useCallback(async () => {
    if (!globalEmail) return;
    setRefreshing(true);
    try {
      const [userData] = await Promise.all([
        getCurrentUserData(globalEmail),
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ]);
      if (userData) {
        setPlatformsData(buildPlatformsData(userData));
      }
    } catch (error) {
      console.error("Pull to refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  }, [globalEmail]);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({
        y: Platform.OS === "ios" ? -insets.top : 0,
        animated: false,
      });
    }, [insets.top]),
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
          setPlatformsData(buildPlatformsData(userData));
        } else {
          setPlatformsData([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Firebase fetch error:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [globalEmail]);

  return (
    <View className="flex-1">
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        bounces={true}
        overScrollMode="always"
        contentContainerStyle={{
          paddingBottom: 160,
        }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        {...(Platform.OS === "ios"
          ? {
              contentInset: { top: insets.top },
              contentOffset: { x: 0, y: -insets.top },
            }
          : {})}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#FFFFFF"
            colors={["#FFFFFF"]}
            progressViewOffset={insets.top + 20}
          />
        }
      >
        {/* Header */}
        <View
          style={Platform.OS === "ios" ? { marginTop: -insets.top } : undefined}
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
            ) : platformsData.length === 0 ? (
              <View className="items-center justify-center py-10 mt-10">
                <Text className="text-white/60 text-center font-inter text-base leading-6">
                  No connected accounts!{"\n"}Please connect them in your
                  profile.
                </Text>
              </View>
            ) : (
              platformsData.map((platform) => (
                <PlatformCard
                  key={platform.id}
                  platform={platform}
                  isExpanded={expandedPlatform === platform.id}
                  onToggle={() =>
                    setExpandedPlatform(
                      expandedPlatform === platform.id ? "" : platform.id,
                    )
                  }
                  screenWidth={width}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
