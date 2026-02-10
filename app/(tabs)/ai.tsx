import { BlurView } from 'expo-blur';
import { Plus, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, ImageBackground, Modal, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Rect, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import { useSelector } from 'react-redux';
import { normalize } from '../../constants/Fonts';
import { RootState } from '../../store/store';

/* ---------- Gradient Ring Component ---------- */
const GradientRingSVG = () => {
    const size = normalize(38);
    const strokeWidth = 1;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;

    return (
        <View style={ringStyles.container}>
            <BlurView intensity={5} style={ringStyles.blurContainer}>
                <Svg width={size} height={size}>
                    <Defs>
                        <SvgLinearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                            <Stop offset="50%" stopColor="#000000" stopOpacity="1" />
                            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
                        </SvgLinearGradient>
                    </Defs>
                    <Circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke="url(#headerGrad)"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                </Svg>
            </BlurView>
        </View>
    );
};

const ringStyles = StyleSheet.create({
    container: {
        position: "absolute",
        inset: 0,
        alignItems: "center",
        justifyContent: "center",
    },
    blurContainer: {
        width: normalize(38),
        height: normalize(38),
        borderRadius: normalize(19),
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
    },
});

export default function AI() {
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const userName = useSelector((state: RootState) => state.user.userName);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Calculate responsiveness
    const sidebarWidth = Math.min(width * 0.8, 300);
    const slideAnim = useRef(new Animated.Value(-sidebarWidth)).current;

    const openSidebar = () => {
        setIsModalVisible(true);
        setTimeout(() => setIsSidebarOpen(true), 10);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
        setTimeout(() => setIsModalVisible(false), 300);
    };

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: isSidebarOpen ? 0 : -sidebarWidth,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [isSidebarOpen, sidebarWidth]);

    const ChatItem = ({ title }: { title: string }) => (
        <TouchableOpacity className="flex-row items-center justify-between bg-[#1A1A1A] p-4 rounded-xl mb-3">
            <View className="flex-row items-center flex-1">
                <Image source={require("../../assets/icons/chat.png")} className="w-5 h-5" resizeMode="contain" />
                <Text className="text-white ml-3 font-inter text-base flex-1">{title}</Text>
            </View>
            <View className="flex-row items-center gap-2">
                <TouchableOpacity className="w-8 h-8 items-center justify-center bg-white/10 rounded-[12px]">
                    <Image source={require("../../assets/icons/edit.png")} className="w-4 h-4" resizeMode="contain" />
                </TouchableOpacity>
                <TouchableOpacity className="w-8 h-8 items-center justify-center bg-white/10 rounded-[12px]">
                    <Image source={require("../../assets/icons/delete.png")} className="w-4 h-4" resizeMode="contain" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1 }}>
            <ImageBackground
                source={require("../../assets/images/background.png")}
                style={{ flex: 1, backgroundColor: "#000" }}
                resizeMode="cover"
            >
                {/* Header Container (Absolute to match Home/Profile) */}
                <View
                    className="absolute top-0 left-0 right-0 z-10"
                    style={{ paddingTop: normalize(55) }}
                >
                    <View className="flex-row items-center justify-between px-5">
                        <TouchableOpacity
                            onPress={openSidebar}
                            style={{ width: normalize(38), height: normalize(38) }}
                            className="items-center justify-center rounded-full relative"
                        >
                            <GradientRingSVG />
                            <Image source={require("../../assets/icons/menu.png")} className="w-6 h-6" resizeMode="contain" />
                        </TouchableOpacity>
                        <Text className="text-white text-xl font-bold font-inter">Sosh AI</Text>
                        <TouchableOpacity
                            style={{ width: normalize(38), height: normalize(38) }}
                            className="items-center justify-center rounded-full relative"
                        >
                            <GradientRingSVG />
                            <Plus color="#fff" size={24} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Content Container */}
                <View
                    style={{
                        flex: 1,
                        paddingHorizontal: 20,
                        paddingTop: normalize(110),
                        paddingBottom: 200
                    }}
                >

                    {/* Greeting Content */}
                    <View className="flex-1 items-center justify-center">
                        <View className="items-center">
                            <Text
                                className="text-white font-normal text-center mb-2"
                                style={{
                                    fontFamily: 'Questrial_400Regular',
                                    fontSize: Math.min(width * 0.1, 42),
                                    lineHeight: Math.min(width * 0.12, 50)
                                }}
                            >
                                Hi, {userName}
                            </Text>
                            <Text
                                className="text-white/60 font-inter text-center"
                                style={{ fontSize: Math.min(width * 0.045, 18) }}
                            >
                                How may I help you?
                            </Text>
                        </View>
                    </View>

                    {/* Bottom Input Area */}
                    <View
                        style={{
                            position: 'absolute',
                            bottom: insets.bottom + 110,
                            left: 20,
                            right: 20
                        }}
                    >
                        <View className="flex-row items-center gap-3">
                            <View className="flex-1 h-[56px] rounded-full overflow-hidden" style={{ position: 'relative' }}>
                                <BlurView intensity={30} tint="dark" className="flex-1">
                                    <View className="flex-1 flex-row items-center pl-5 pr-4 rounded-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                                        {/* SVG Gradient Border */}
                                        <View style={{ position: 'absolute', inset: 0 }} pointerEvents="none">
                                            <Svg height="100%" width="100%">
                                                <Defs>
                                                    <SvgLinearGradient id="inputBorderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
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
                                                    rx="28"
                                                    ry="28"
                                                    stroke="url(#inputBorderGrad)"
                                                    strokeWidth="0.68"
                                                    fill="transparent"
                                                />
                                            </Svg>
                                        </View>
                                        <TextInput
                                            placeholder="Type your message..."
                                            placeholderTextColor="rgba(255,255,255,0.6)"
                                            className="flex-1 text-white text-base font-inter mr-2"
                                            selectionColor="#fff"
                                        />
                                        <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-full relative">
                                            <GradientRingSVG />
                                            <Image source={require("../../assets/icons/voice.png")} className="w-5 h-5" resizeMode="contain" />
                                        </TouchableOpacity>
                                    </View>
                                </BlurView>
                            </View>

                            <TouchableOpacity
                                className="w-[56px] h-[56px] rounded-full items-center justify-center overflow-hidden"
                            >
                                <ImageBackground
                                    source={require("../../assets/images/button-bg.png")}
                                    className="w-full h-full items-center justify-center"
                                    resizeMode="cover"
                                >
                                    <View className="absolute inset-0 bg-blue-500/20" />
                                    <Image source={require("../../assets/icons/send-msg.png")} className="w-6 h-6" resizeMode="contain" />
                                </ImageBackground>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ImageBackground>

            {/* Sidebar Overlay */}
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="none"
                onRequestClose={closeSidebar}
            >
                <View className="flex-1 flex-row">
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={closeSidebar}
                        className="absolute inset-0 bg-black/60"
                    />
                    <Animated.View
                        style={{
                            width: sidebarWidth,
                            height: height + insets.top + insets.bottom,
                            left: -9,
                            borderTopRightRadius: 24,
                            borderBottomRightRadius: 24,
                            overflow: 'hidden',
                            transform: [{ translateX: slideAnim }],
                            paddingTop: Math.max(insets.top, 40)
                        }}
                        className="bg-[#0A0A0A] p-6"
                    >
                        <View className="flex-row items-center justify-between mb-8">
                            <Text className="text-white text-2xl font-bold font-inter">Chat History</Text>
                            <TouchableOpacity
                                onPress={closeSidebar}
                                style={{ width: normalize(38), height: normalize(38) }}
                                className="items-center justify-center rounded-full relative"
                            >
                                <GradientRingSVG />
                                <X color="#fff" size={24} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity className="flex-row items-center bg-white/10 p-4 rounded-xl mb-8 border border-white/5">
                            <Plus color="#fff" size={20} />
                            <Text className="text-white ml-3 font-inter font-medium text-base">New chat</Text>
                        </TouchableOpacity>

                        <View className="flex-1">
                            <Text className="text-white/40 font-inter font-medium text-sm mb-4 tracking-wider">Current chats</Text>
                            <ChatItem title="Hey" />

                            <Text className="text-white/40 font-inter font-medium text-sm mt-4 mb-4 tracking-wider">Recent chats</Text>
                            <ChatItem title="Hey" />
                            <ChatItem title="Hey" />
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}
