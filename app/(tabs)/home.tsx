import { ImageBackground, Text, View } from 'react-native';
import Header from '../../components/common/Header';
import StatCard from '../../components/home/StatCard';


export default function Home() {
    return (
        <ImageBackground
            source={require("../../assets/images/background.png")}
            style={{ flex: 1, backgroundColor: "#000" }}
            resizeMode="cover"
        >
            {/* Header */}
            <View className="absolute top-0 left-0 right-0 z-10">
                <Header />
            </View>

            <View className="flex-1 px-5 pt-[100px] pb-5">

                <View className="mb-4">
                    <Text style={{ fontFamily: 'Questrial_400Regular' }} className="text-white text-[56px] leading-[56px] tracking-normal mb-4 mt-2">Hello{'\n'}RAPDXB,{'\n'}lets create</Text>
                    <View className="flex-row items-center gap-2 mb-9">
                        <View className="w-2 h-2 rounded-full bg-green-500" />
                        <Text className="font-inter font-normal text-sm leading-5 tracking-[-0.15px] text-[#FFFFFF99] ">Live Data • Updated just now</Text>
                    </View>
                </View>

                {/* Followers Card */}
                <StatCard
                    title="Followers"
                    value="192.2K"
                    trend="+8.2% this month"
                    fullWidth
                />

                {/* Likes and Views Grid */}
                <View className="flex-1 flex-row gap-3">
                    <View className="flex-1">
                        <StatCard
                            title="Likes"
                            value="42.2K"
                            trend="+8.2% this month"
                        />
                    </View>
                    <View className="flex-1">
                        <StatCard
                            title="Views"
                            value="3.8M"
                            trend="+8.2% this month"
                        />
                    </View>
                </View>

                {/* Padding for bottom nav */}
            </View>
            <View className="h-28" />

        </ImageBackground>
    );
}
