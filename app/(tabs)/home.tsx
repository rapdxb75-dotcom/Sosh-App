import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import Header from "../../components/common/Header";
import RefreshButton from "../../components/common/RefreshButton";
import StatCard from "../../components/home/StatCard";
import { getCurrentUserData, listenToUserData } from "../../services/firebase";
import { RootState } from "../../store/store";
import { formatNumber } from "../../utils/format";

export default function Home() {
  const userName = useSelector((state: RootState) => state.user.userName);
  const globalEmail = useSelector((state: RootState) => state.user.email);

  const insets = useSafeAreaInsets();

  const [analytics, setAnalytics] = useState({
    totalFollowers: 0,
    totalLikes: 0,
    totalViews: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!globalEmail) return;

    const unsubscribe = listenToUserData(
      globalEmail,
      (userData) => {
        setIsLoading(false);
        if (userData?.totalAnalytics) {
          const { totalFollowers, totalLikes, totalViews } = userData.totalAnalytics;
          setAnalytics({
            totalFollowers: totalFollowers || 0,
            totalLikes: totalLikes || 0,
            totalViews: totalViews || 0,
          });
        } else {
          setAnalytics({ totalFollowers: 0, totalLikes: 0, totalViews: 0 });
        }
      },
      (error) => {
        console.error("Firebase fetch error in Home:", error);
      }
    );

    return () => unsubscribe();
  }, [globalEmail]);

  const handleRefresh = async () => {
    if (!globalEmail) return;
    try {
      const userData = await getCurrentUserData(globalEmail);
      if (userData?.totalAnalytics) {
        const { totalFollowers, totalLikes, totalViews } = userData.totalAnalytics;
        setAnalytics({
          totalFollowers: totalFollowers || 0,
          totalLikes: totalLikes || 0,
          totalViews: totalViews || 0,
        });
      }
    } catch (error) {
      console.error("Manual refresh error:", error);
    }
  };

  // Calculate dynamic bottom padding: 
  // Base BottomNav indent is Math.max(insets.bottom + 10, 40)
  // Distance from there to top of upload icon = 122px.
  // We want EXACTLY 24px of space above upload icon.
  // So total paddingBottom = Math.max(insets.bottom + 10, 40) + 122 + 24 = 146
  const bottomPadding = Math.max(insets.bottom + 10, 40) + 106;

  return (
    <View className="flex-1">
      <View
        style={{ flex: 1, paddingBottom: bottomPadding }}
      >
        {/* Header */}
        <View className="w-full">
          <Header />
        </View>

        <View className="w-full px-5 flex-1">
          <Text className="page-title text-white mb-4 mt-8">
            Hello{"\n"}
            {userName},{"\n"}lets create
          </Text>
          <View className="flex-row items-center justify-between mb-10 w-full pr-1">
            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 rounded-full bg-green-500" />
              <Text className="font-inter font-semibold text-[15px] leading-5 tracking-[-0.15px] text-[#FFFFFF99] ">
                Live Data • Updated just now
              </Text>
            </View>
            <RefreshButton onRefresh={handleRefresh} />
          </View>

          {/* Stats Flex Container */}
          <View className="flex-1">
            {/* Followers Card */}
            <View style={{ flex: 1.1 }} className="mb-3">
              <StatCard
                title="Followers"
                value={formatNumber(analytics.totalFollowers)}
                trend="+0% this month"
                fullWidth
                isLoading={isLoading}
              />
            </View>

            {/* Likes and Views Grid */}
            <View style={{ flex: 1.9 }} className="flex-row gap-3">
              <View className="flex-1">
                <StatCard
                  title="Likes"
                  value={formatNumber(analytics.totalLikes)}
                  trend="+0% this month"
                  isLoading={isLoading}
                />
              </View>
              <View className="flex-1">
                <StatCard
                  title="Views"
                  value={formatNumber(analytics.totalViews)}
                  trend="+0% this month"
                  isLoading={isLoading}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
