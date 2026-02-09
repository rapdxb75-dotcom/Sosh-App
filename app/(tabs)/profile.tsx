import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Upload } from 'lucide-react-native';
import { useState } from 'react';
import { Image, ImageBackground, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Defs, Rect, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import Toast from 'react-native-toast-message';
import Header from '../../components/common/Header';

/* ---------- Gradient Ring Component ---------- */
const GradientRingSVG = () => {
    const size = 41;
    const strokeWidth = 1;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;

    return (
        <View style={ringStyles.container}>
            <BlurView intensity={5} style={ringStyles.blurContainer}>
                <Svg width={size} height={size}>
                    <Defs>
                        <SvgLinearGradient id="profileGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                            <Stop offset="50%" stopColor="#000000" stopOpacity="1" />
                            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
                        </SvgLinearGradient>
                    </Defs>
                    <Circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke="url(#profileGrad)"
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
        width: 50,
        height: 50,
        borderRadius: 25,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
    },
});

export default function Profile() {
    const [modalVisible, setModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
    const [username, setUsername] = useState("RAPDXB");
    const [image, setImage] = useState<string | null>(null);

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setEditModalVisible(false); // Optionally close modal after selection
            Toast.show({
                type: 'success',
                text1: 'Upload Successful',
                text2: 'Profile image updated successfully'
            });
        }
    };

    const handleDisconnectPress = (accountName: string) => {
        setSelectedAccount(accountName);
        setModalVisible(true);
    };

    const confirmDisconnect = () => {
        // Implement actual disconnect logic here
        console.log(`Disconnected ${selectedAccount}`);
        setModalVisible(false);
        setSelectedAccount(null);
    };

    return (
        <ImageBackground
            source={require("../../assets/images/background.png")}
            style={{ flex: 1, backgroundColor: "#000" }}
            resizeMode="cover"
        >
            <ScrollView contentContainerStyle={{ paddingBottom: 160 }} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="w-full">
                    <Header />
                </View>

                <View className="w-full px-5">
                    <Text style={{ fontFamily: 'Questrial_400Regular' }} className="text-white text-[56px] leading-[56px] mb-8 mt-4">
                        Your{'\n'}Account
                    </Text>

                    {/* Profile Card with Gradient Border Overlay */}
                    <View className="rounded-[32px] overflow-hidden mb-8">
                        <BlurView intensity={40} tint="dark" className="p-[1px]">
                            <LinearGradient
                                colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.1)']}
                                style={{ borderRadius: 32, paddingVertical: 20, paddingHorizontal: 10, position: 'relative' }}
                            >
                                {/* Gradient Border SVG (Taller to hide bottom stroke) */}
                                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                                    <Svg height="120%" width="100%">
                                        <Defs>
                                            <SvgLinearGradient id="cardBorderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.7)" stopOpacity="1" />
                                                <Stop offset="100%" stopColor="rgba(0, 0, 0, 0.7)" stopOpacity="1" />
                                            </SvgLinearGradient>
                                        </Defs>
                                        <Rect
                                            x="0.5"
                                            y="0.5"
                                            width="99.7%"
                                            height="85%" // Relative to SVG height="120%", this puts bottom edge way outside container
                                            rx="32"
                                            ry="32"
                                            stroke="url(#cardBorderGrad)"
                                            strokeWidth="1"
                                            fill="transparent"
                                        />
                                    </Svg>
                                </View>

                                {/* User Header */}
                                <View className="flex-row items-center justify-between mb-2 px-2">
                                    <View className="flex-row items-center gap-3">
                                        <View className="w-[45px] h-[45px] items-center justify-center">
                                            <GradientRingSVG />
                                            <Image
                                                source={image ? { uri: image } : require('../../assets/images/rapdxp-logo.png')}
                                                className="w-12 h-12 rounded-full"
                                                resizeMode={image ? "cover" : "contain"}
                                            />
                                        </View>
                                        <Text className="text-white text-2xl font-medium">RAPDXB</Text>
                                    </View>
                                    <TouchableOpacity
                                        className='rounded-[12px] p-[8px] bg-[rgba(255,255,255,0.12)]'
                                        onPress={() => setEditModalVisible(true)}
                                    >
                                        <Image source={require('../../assets/icons/edit.png')} className="w-5 h-5" resizeMode="contain" />
                                    </TouchableOpacity>
                                </View>

                                {/* Stats Grid */}
                                <View className="flex-row flex-wrap justify-between gap-y-3 p-2">
                                    <StatItem label="Sosh Views" value="345M" />
                                    <StatItem label="Sosh Likes" value="34.145K" />
                                    <StatItem label="Platforms" value="8" />
                                    <StatItem label="Sosh Posts" value="8" />
                                </View>
                            </LinearGradient>
                        </BlurView>
                    </View>

                    {/* Connected Accounts */}
                    <Text className="text-white text-lg font-medium mb-4">Connected accounts</Text>

                    <ConnectedAccountItem
                        icon={require('../../assets/icons/instagram.png')}
                        name="Instagram"
                        status={"Connected to \n@raptesttheworld"}
                        isConnected={true}
                        onDisconnect={() => handleDisconnectPress('Instagram')}
                    />
                    <ConnectedAccountItem
                        icon={require('../../assets/icons/tiktok.png')}
                        name="TikTok"
                        status="Not connected"
                        isConnected={false}
                        onDisconnect={() => handleDisconnectPress('TikTok')}
                    />
                    <ConnectedAccountItem
                        icon={require('../../assets/icons/youtube.png')}
                        name="YouTube"
                        status="Not connected"
                        isConnected={false}
                        onDisconnect={() => handleDisconnectPress('YouTube')}
                    />
                    <ConnectedAccountItem
                        icon={require('../../assets/icons/snapchat.png')}
                        name="Snapchat"
                        status="Not connected"
                        isConnected={false}
                        onDisconnect={() => handleDisconnectPress('Snapchat')}
                    />
                    <ConnectedAccountItem
                        icon={require('../../assets/icons/twitter.png')}
                        name="Twitter"
                        status="Not connected"
                        isConnected={false}
                        onDisconnect={() => handleDisconnectPress('Twitter')}
                    />
                    <ConnectedAccountItem
                        icon={require('../../assets/icons/facebook.png')}
                        name="Facebook"
                        status="Not connected"
                        isConnected={false}
                        onDisconnect={() => handleDisconnectPress('Facebook')}
                    />
                </View>
            </ScrollView>

            {/* Disconnect Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <View className="bg-[#0f0f0f] w-full max-w-[340px] rounded-[24px] p-6 items-center">
                        {/* Close Button */}
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            className="absolute right-4 top-4 w-9 h-9 items-center justify-center"
                        >
                            <Text className="text-white/60 text-lg font-medium">×</Text>
                        </TouchableOpacity>

                        <Text className="text-white text-center text-[22px] leading-8 mt-6 font-inter">
                            Are you sure you want to
                        </Text>
                        <Text className="text-white text-center text-[22px] leading-8 mb-8 font-inter font-bold">
                            disconnect your {selectedAccount} account?
                        </Text>

                        <TouchableOpacity
                            onPress={confirmDisconnect}
                            className="btn-modal-disconnect"
                        >
                            <Text className="text-white font-medium text-lg font-inter">Disconnect account</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', width: '100%', height: 52, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Text className="text-white font-medium text-lg font-inter">Go Back</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Edit Profile Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={editModalVisible}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <View className="bg-[#0f0f0f] w-full max-w-[340px] rounded-[24px] p-8 items-center">
                        {/* Close Button */}
                        <TouchableOpacity
                            onPress={() => setEditModalVisible(false)}
                            className="absolute right-4 top-4 w-9 h-9 items-center justify-center"
                        >
                            <Text className="text-white/60 text-lg font-medium">×</Text>
                        </TouchableOpacity>

                        {/* Profile Image with Ring */}
                        <View className="mb-6 items-center justify-center relative">
                            {/* Reusing Gradient Ring Logic but larger */}
                            <View style={{ width: 100, height: 100, alignItems: 'center', justifyContent: 'center' }}>
                                <BlurView intensity={5} style={{ width: 100, height: 100, borderRadius: 50, overflow: "hidden", alignItems: "center", justifyContent: "center" }}>
                                    <Svg width={90} height={90}>
                                        <Defs>
                                            <SvgLinearGradient id="editProfileGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                                                <Stop offset="50%" stopColor="#000000" stopOpacity="1" />
                                                <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
                                            </SvgLinearGradient>
                                        </Defs>
                                        <Circle
                                            cx={45}
                                            cy={45}
                                            r={44}
                                            stroke="url(#editProfileGrad)"
                                            strokeWidth={1}
                                            fill="transparent"
                                        />
                                    </Svg>
                                </BlurView>
                                <Image
                                    source={image ? { uri: image } : require('../../assets/images/rapdxp-logo.png')}
                                    className="w-[88px] h-[88px] absolute rounded-full"
                                    resizeMode={image ? "cover" : "contain"}
                                />
                            </View>
                        </View>

                        {/* Upload New Button */}
                        <BlurView intensity={14} tint="dark" className="upload-container w-full h-[68px]">
                            <TouchableOpacity
                                className="upload-content w-full h-full"
                                onPress={pickImage}
                            >
                                <Upload size={20} color="white" />
                                <Text className="text-white font-medium text-[16px] font-inter mt-2">Upload new</Text>
                            </TouchableOpacity>
                        </BlurView>

                        {/* Username Input */}
                        <View className="w-full mb-8">
                            <Text className="text-white font-semibold text-base mb-2 font-inter">User name</Text>
                            <BlurView intensity={14} tint="dark" className="rounded-[16px] overflow-hidden">
                                <View className="input-field justify-center">
                                    <TextInput
                                        value={username}
                                        onChangeText={setUsername}
                                        placeholder="Enter username"
                                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                                        className="flex-1 font-inter py-0 text-white"
                                        style={{ fontFamily: 'Inter_400Regular' }}
                                        textAlignVertical="center"
                                    />
                                </View>
                            </BlurView>
                        </View>

                        {/* Save Button */}
                        <TouchableOpacity
                            onPress={() => setEditModalVisible(false)}
                            className="btn-save"
                        >
                            <Text className="text-white font-medium text-lg">Save</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </Modal>



        </ImageBackground>
    );
}


function StatItem({ label, value }: { label: string, value: string }) {
    return (
        <View className="w-[150px] h-[75px] bg-[#FFFFFF1A] rounded-[11px] px-[12px] py-[3px] justify-center">
            <Text className="text-white/60 font-inter font-normal text-[14px] leading-[24px] tracking-[0px]">{label}</Text>
            <Text style={{ fontFamily: 'Questrial_400Regular' }} className="text-white text-[34px] leading-[34px] tracking-[0px] mt-1">{value}</Text>
        </View>
    );
}

function ConnectedAccountItem({ icon, name, status, isConnected, onDisconnect }: { icon: any, name: string, status: string, isConnected: boolean, onDisconnect?: () => void }) {
    return (
        <View className="flex-row items-center justify-between p-4 bg-[#1A1A1A] rounded-2xl mb-3 border border-white/10">
            <View className="flex-row items-center gap-4">
                <View className="w-12 h-12 items-center justify-center">
                    <Image source={icon} className="w-8 h-8" resizeMode="contain" />
                </View>
                <View>
                    <Text className="text-white font-medium text-base">{name}</Text>
                    <View className="flex-row items-center mt-1">
                        <View className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                        <Text className="text-white/60 text-xs">{status}</Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity
                onPress={isConnected ? onDisconnect : undefined}
                className={`btn-toggle ${isConnected ? 'btn-toggle-disconnect' : 'btn-toggle-connect'}`}
            >
                <View className="flex-row items-center gap-2">
                    {!isConnected && <Image source={require('../../assets/icons/connect.png')} style={{ width: 14, height: 14 }} resizeMode="contain" />}
                    {isConnected && <Image source={require('../../assets/icons/disconnect.png')} style={{ width: 14, height: 14 }} resizeMode="contain" />}
                    <Text className={`${isConnected ? 'text-white' : 'text-white'} font-medium text-xs`}>
                        {isConnected ? 'Disconnect' : 'Connect'}
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}
