import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import Svg, { Defs, Rect, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';

export default function BottomNavigation({ state, descriptors, navigation }: BottomTabBarProps) {
    const currentRoute = state.routes[state.index].name;

    const navigateTo = (routeName: string) => {
        const event = navigation.emit({
            type: 'tabPress',
            target: routeName,
            canPreventDefault: true,
        });

        if (!event.defaultPrevented) {
            navigation.navigate(routeName);
        }
    };

    const isActive = (routeName: string) => currentRoute === routeName;

    return (
        <View
            className="absolute bottom-10 left-5 right-5 h-[72px]"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 24, elevation: 10 }}
        >
            <BlurView intensity={40} tint="dark" style={{ flex: 1, borderRadius: 24, overflow: 'hidden' }}>
                <View
                    style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)', paddingHorizontal: 24, position: 'relative', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                >
                    {/* Gradient Border SVG Overlay */}
                    <View style={StyleSheet.absoluteFill} pointerEvents="none">
                        <Svg height="100%" width="100%">
                            <Defs>
                                <SvgLinearGradient id="navBorderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <Stop offset="0%" stopColor="rgba(141, 138, 138, 0.4)" stopOpacity="1" />
                                    <Stop offset="48.56%" stopColor="rgba(65, 65, 65, 0.4)" stopOpacity="1" />
                                    <Stop offset="100%" stopColor="rgba(141, 138, 138, 0.4)" stopOpacity="1" />
                                </SvgLinearGradient>
                            </Defs>
                            <Rect
                                x="0.34"
                                y="0.34"
                                width="99.3%"
                                height="99%"
                                rx="24"
                                ry="24"
                                stroke="url(#navBorderGrad)"
                                strokeWidth="0.68"
                                fill="transparent"
                            />
                        </Svg>
                    </View>

                    <TouchableOpacity
                        onPress={() => navigateTo('home')}
                        className={`w-[42px] h-[42px] items-center justify-center rounded-[14px] ${isActive('home') ? 'bg-[#FFFFFF1A]' : ''}`}
                    >
                        <Image source={require("../../assets/icons/nav_home.png")} className="w-[24px] h-[24px]" resizeMode="contain" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => navigateTo('ai')}
                        className={`w-[42px] h-[42px] items-center justify-center rounded-[14px] ${isActive('ai') ? 'bg-[#FFFFFF1A]' : ''}`}
                    >
                        <Image source={require("../../assets/icons/nav_ai.png")} className="w-[24px] h-[24px]" resizeMode="contain" />
                    </TouchableOpacity>

                    {/* Spacer for absolute center button */}
                    <View className="w-[60px]" />

                    <TouchableOpacity
                        className={`w-[42px] h-[42px] items-center justify-center rounded-[14px] ${isActive('analysis') ? 'bg-[#FFFFFF1A]' : ''}`}
                        onPress={() => navigateTo('analysis')}
                    >
                        <Image source={require("../../assets/icons/nav_chart.png")} className="w-[24px] h-[24px]" resizeMode="contain" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => navigateTo('profile')}
                        className={`w-[42px] h-[42px] items-center justify-center rounded-[14px] ${isActive('profile') ? 'bg-[#FFFFFF1A]' : ''}`}
                    >
                        <Image source={require("../../assets/icons/nav_user.png")} className="w-[24px] h-[24px]" resizeMode="contain" />
                    </TouchableOpacity>
                </View>
            </BlurView>

            {/* Popped out center button - outside the clipped BlurView */}
            <View
                pointerEvents="box-none"
                style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}
            >
                <TouchableOpacity
                    className="w-[60px] h-[60px] bg-white rounded-full items-center justify-center -mt-14 shadow-lg shadow-black/30"
                >
                    <Image source={require("../../assets/icons/nav_center.png")} className="w-[30px] h-[30px]" resizeMode="contain" />
                </TouchableOpacity>
            </View>
        </View>
    );
}
