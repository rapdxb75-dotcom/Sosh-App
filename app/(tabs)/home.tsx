import { Text, View } from "react-native";
import { useSelector } from "react-redux";
import Header from "../../components/common/Header";
import StatCard from "../../components/home/StatCard";
import { RootState } from "../../store/store";

export default function Home() {
  const userName = useSelector((state: RootState) => state.user.userName);

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="absolute top-0 left-0 right-0 z-10">
        <Header />
      </View>

      <View className="flex-1 px-5 pt-[120px] pb-5">
        <View className="mb-4">
          <Text className="page-title text-white mb-2 mt-6">
            Hello{"\n"}
            {userName?.toUpperCase()},{"\n"}lets create
          </Text>
          <View className="flex-row items-center gap-2 mb-10">
            <View className="w-2 h-2 rounded-full bg-green-500" />
            <Text className="font-inter font-semibold text-[15px] leading-5 tracking-[-0.15px] text-[#FFFFFF99] ">
              Live Data • Updated just now
            </Text>
          </View>
        </View>

        {/* Followers Card */}
        <StatCard
          title="Followers"
          value="54.5K"
          trend="+8.2% this month"
          fullWidth
        />

        {/* Likes and Views Grid */}
        <View className="flex-1 flex-row gap-3">
          <View className="flex-1">
            <StatCard title="Likes" value="1.6M" trend="+8.2% this month" />
          </View>
          <View className="flex-1">
            <StatCard title="Views" value="76.8M" trend="+8.2% this month" />
          </View>
        </View>

        {/* Padding for bottom nav */}
      </View>
      <View className="h-28" />
    </View>
  );
}
