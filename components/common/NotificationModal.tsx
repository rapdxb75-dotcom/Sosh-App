import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { useNotification } from '../../context/NotificationContext';

export default function NotificationModal() {
    const { isVisible, hideNotifications } = useNotification();

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible}
            onRequestClose={hideNotifications}
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-start', alignItems: 'center', paddingTop: 110, paddingHorizontal: 20 }}>
                <View className="bg-[#0f0f0f] w-full max-w-[340px] rounded-[24px] p-6">
                    {/* Close Button */}
                    <TouchableOpacity
                        onPress={hideNotifications}
                        className="absolute right-4 top-4 w-10 h-10 items-center justify-center z-10"
                    >
                        <Text className="text-white/60 text-lg font-medium">×</Text>
                    </TouchableOpacity>

                    <Text className="text-white text-[34px] leading-[40px] font-inter mb-8 mt-2">
                        Last{'\n'}notifications
                    </Text>

                    {/* Neutral Notification */}
                    <View className="notification-card notification-neutral">
                        <View>
                            <Text className="text-white font-semibold text-base mb-1 font-inter">Neutral notifications</Text>
                            <Text className="text-white/60 text-sm font-inter">It´s a secondary notification state</Text>
                        </View>
                        <TouchableOpacity className="notification-close-btn">
                            <Text className="text-white/80 text-1g text-center">×</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Successful Notification */}
                    <View className="notification-card notification-success">
                        <View>
                            <Text className="text-white font-semibold text-base mb-1 font-inter">Successfulnotifications</Text>
                            <Text className="text-white/60 text-1g font-inter">It´s a green notification state</Text>
                        </View>
                        <TouchableOpacity className="notification-close-btn">
                            <Text className="text-white/80 text-1g text-center">×</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Error Notification */}
                    <View className="notification-card notification-error">
                        <View>
                            <Text className="text-white font-semibold text-base mb-1 font-inter">Error notifications</Text>
                            <Text className="text-white/60 text-sm font-inter">It's a red notification state</Text>
                        </View>
                        <TouchableOpacity className="notification-close-btn">
                            <Text className="text-white/80 text-1g text-center">×</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>
    );
}
