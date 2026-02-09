import { BlurView } from 'expo-blur';
import { TrendingUp } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { Colors } from '../../constants/Colors';

interface StatCardProps {
    title: string;
    value: string;
    trend: string;
    fullWidth?: boolean;
}

export default function StatCard({ title, value, trend, fullWidth }: StatCardProps) {
    const shadowStyle = {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.45, // approx #00000073
        shadowRadius: 24,
        elevation: 10,
    };

    return (
        <View
            style={shadowStyle}
            className={`rounded-[24px] overflow-hidden mb-3 border border-white/20 bg-[#FFFFFF1A] ${fullWidth ? 'w-full h-[125px]' : 'w-full h-[221px]'}`}
        >

            <BlurView intensity={12} tint="light" className={`flex-1 p-[12px] ${fullWidth ? 'flex-col' : 'justify-between'}`}>
                {/* Title Section */}
                <Text className="text-white/60 text-sm font-inter">{title}</Text>

                {fullWidth ? (
                    // Full Width Layout: Title -> 26px Gap -> Content
                    <View className="flex-row items-end justify-between mt-[26px]">
                        <Text style={{ fontFamily: 'Questrial_400Regular' }} className="text-white text-[56px]">{value}</Text>
                        <View className="flex-row items-center gap-1 mb-2">
                            <TrendingUp color={Colors.white} size={18} />
                            <Text className="font-inter font-normal text-xs leading-5 tracking-[0px] text-right text-white/60">{trend}</Text>
                        </View>
                    </View>
                ) : (
                    // Half Width Layout: Vertical Stack with justify-between
                    <>
                        <View className="flex-1">
                            <Text style={{ fontFamily: 'Questrial_400Regular' }} className="text-white text-[56px] mt-2">{value}</Text>
                        </View>

                        <View>
                            <View className="h-[2px] bg-white w-[100%] mb-2 opacity-50" />
                            <View className="flex-row items-center gap-1 justify-start">
                                <TrendingUp color={Colors.white} size={18} />
                                <Text className="font-inter font-normal text-xs leading-5 tracking-[0px] text-left text-white/60">{trend}</Text>
                            </View>
                        </View>
                    </>
                )}
            </BlurView>
        </View>
    );
}