import { BlurView } from 'expo-blur';
import { TrendingUp } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, Rect, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';
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
            style={[shadowStyle, { borderRadius: 24, overflow: 'hidden' }]}
            className={`mb-3 ${fullWidth ? 'w-full h-[125px]' : 'w-full h-[221px]'}`}
        >
            <BlurView intensity={40} tint="dark" style={{ flex: 1 }}>
                <View
                    style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 24, padding: 12, position: 'relative' }}
                    className={fullWidth ? 'flex-col' : 'justify-between'}
                >
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

                    {/* Gradient Border SVG Overlay (Taller to hide bottom stroke) */}
                    <View style={StyleSheet.absoluteFill} pointerEvents="none">
                        <Svg height="120%" width="100%">
                            <Defs>
                                <SvgLinearGradient id="statCardBorderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.7)" stopOpacity="1" />
                                    <Stop offset="100%" stopColor="rgba(0, 0, 0, 0.7)" stopOpacity="1" />
                                </SvgLinearGradient>
                            </Defs>
                            <Rect
                                x="0.5"
                                y="0.5"
                                width="99.7%"
                                height="85%"
                                rx="24"
                                ry="24"
                                stroke="url(#statCardBorderGrad)"
                                strokeWidth="1"
                                fill="transparent"
                            />
                        </Svg>
                    </View>
                </View>
            </BlurView>
        </View>
    );
}