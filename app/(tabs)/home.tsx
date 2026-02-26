import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import Header from "../../components/common/Header";
import StatCard from "../../components/home/StatCard";
import { RootState } from "../../store/store";

export default function Home() {
  const userName = useSelector((state: RootState) => state.user.userName);
  const insets = useSafeAreaInsets();

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
          <View className="flex-row items-center gap-2 mb-10">
            <View className="w-2 h-2 rounded-full bg-green-500" />
            <Text className="font-inter font-semibold text-[15px] leading-5 tracking-[-0.15px] text-[#FFFFFF99] ">
              Live Data • Updated just now
            </Text>
          </View>

          {/* Stats Flex Container */}
          <View className="flex-1">
            {/* Followers Card */}
            <View style={{ flex: 1.1 }} className="mb-3">
              <StatCard
                title="Followers"
                value="54.5K"
                trend="+8.2% this month"
                fullWidth
              />
            </View>

            {/* Likes and Views Grid */}
            <View style={{ flex: 1.9 }} className="flex-row gap-3">
              <View className="flex-1">
                <StatCard title="Likes" value="1.6M" trend="+8.2% this month" />
              </View>
              <View className="flex-1">
                <StatCard title="Views" value="76.8M" trend="+8.2% this month" />
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
