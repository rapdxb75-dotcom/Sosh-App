import { BlurView } from 'expo-blur';
import { Stack } from 'expo-router';
import { Plus, TrendingUp } from 'lucide-react-native';
import { Image, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import Header from '../../components/common/Header';

export default function Analysis() {
    const { width } = useWindowDimensions();

    // Responsive padding based on screen width
    const horizontalPadding = width < 375 ? 16 : width < 768 ? 20 : width < 1024 ? 32 : 40;

    return (
        <View className="flex-1 bg-black">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Background Image/Gradient */}
            <Image
                source={require('../../assets/images/background.png')}
                className="absolute w-full h-full"
                resizeMode="cover"
            />

            <Header />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 20, paddingHorizontal: horizontalPadding }}
                showsVerticalScrollIndicator={false}
            >
                <View>
                    <Text className="page-title text-white mb-0">Your</Text>
                    <Text className="page-title text-white mb-6">Analytics</Text>

                    <Text className="section-title text-white mb-4">Platform Breakdown</Text>

                    {/* Instagram Card (Collapsed) */}
                    <View className="mb-4">
                        <BlurView intensity={40} tint="dark" style={{ flex: 1 }}>
                            <View style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 24, padding: 16, position: 'relative' }}>
                                <View className="flex-row justify-between">
                                    <View className="flex-row flex-1">
                                        <Image source={require('../../assets/icons/instagram.png')} className="w-12 h-12 rounded-xl mr-3" />
                                        <View className="flex-1 justify-center">
                                            <Text className="platform-name text-white">Instagram <Text className="follower-count text-white/60">+ 14 followers</Text></Text>
                                            <View className="growth-badge flex-row items-center gap-1 mt-2 self-start">
                                                <TrendingUp color="#00FF94" size={14} />
                                                <Text className="text-[#00FF94] text-sm">+8.2% this month</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View className="w-[40px] h-[40px] rounded-full items-center justify-center p-1" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                                        <Plus size={16} color="#fff" />
                                    </View>
                                </View>
                            </View>
                        </BlurView>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
