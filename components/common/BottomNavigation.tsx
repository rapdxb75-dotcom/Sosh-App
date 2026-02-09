import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Image, TouchableOpacity, View } from "react-native";

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
        <View className="absolute bottom-10 left-5 right-5 h-[72px] bg-[#0f0f0f] rounded-[24px] flex-row items-center justify-between px-6 border-[0.68px] border-white/40">
            <TouchableOpacity
                onPress={() => navigateTo('home')}
                className={`w-[50px] h-[50px] items-center justify-center rounded-[14px] ${isActive('home') ? 'bg-[#FFFFFF1A]' : ''}`}
            >
                <Image source={require("../../assets/icons/nav_home.png")} className="w-[24px] h-[24px]" resizeMode="contain" />
            </TouchableOpacity>
            <TouchableOpacity className="w-[50px] h-[50px] items-center justify-center rounded-[14px]">
                <Image source={require("../../assets/icons/nav_ai.png")} className="w-[24px] h-[24px]" resizeMode="contain" />
            </TouchableOpacity>
            <TouchableOpacity className="w-[60px] h-[60px] bg-white rounded-full items-center justify-center -mt-14 shadow-lg shadow-black/30">
                <Image source={require("../../assets/icons/nav_center.png")} className="w-[30px] h-[30px]" resizeMode="contain" />
            </TouchableOpacity>
            <TouchableOpacity className="w-[50px] h-[50px] items-center justify-center rounded-[14px]">
                <Image source={require("../../assets/icons/nav_chart.png")} className="w-[24px] h-[24px]" resizeMode="contain" />
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => navigateTo('profile')}
                className={`w-[50px] h-[50px] items-center justify-center rounded-[14px] ${isActive('profile') ? 'bg-[#FFFFFF1A]' : ''}`}
            >
                <Image source={require("../../assets/icons/nav_user.png")} className="w-[24px] h-[24px]" resizeMode="contain" />
            </TouchableOpacity>
        </View>
    );
}
