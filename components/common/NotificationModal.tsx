import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { normalize } from '../../constants/Fonts';
import { NotificationType, useNotification } from '../../context/NotificationContext';

export default function NotificationModal() {
    const { isVisible, hideNotifications, notifications, removeNotification, clearNotifications } = useNotification();

    const getNotificationClass = (type: NotificationType) => {
        switch (type) {
            case 'success': return 'notification-success';
            case 'error': return 'notification-error';
            default: return 'notification-neutral';
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible}
            onRequestClose={hideNotifications}
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-start', alignItems: 'center', paddingTop: normalize(110), paddingHorizontal: 20 }}>
                <View className="bg-[#0f0f0f] w-full max-w-[340px] rounded-[24px] p-6 max-h-[80%]">
                    {/* Close Button */}
                    <TouchableOpacity
                        onPress={hideNotifications}
                        className="absolute right-4 top-4 w-10 h-10 items-center justify-center z-10"
                    >
                        <Text className="text-white/60 text-lg font-medium">×</Text>
                    </TouchableOpacity>

                    <View className="flex-row justify-between items-end mb-8 mt-2">
                        <Text
                            className="text-white font-inter"
                            style={{ fontSize: normalize(34), lineHeight: normalize(40) }}
                        >
                            Last{'\n'}notifications
                        </Text>
                        {notifications.length > 0 && (
                            <TouchableOpacity onPress={clearNotifications} className="mb-1">
                                <Text className="text-white/40 text-xs font-inter uppercase tracking-widest">Clear all</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {notifications.length === 0 ? (
                            <View className="py-10 items-center">
                                <Text className="text-white/40 font-inter">No new notifications</Text>
                            </View>
                        ) : (
                            notifications.map((notif) => (
                                <View key={notif.id} className={`notification-card ${getNotificationClass(notif.type)} mb-3`}>
                                    <View className="flex-1 pr-2">
                                        <View className="flex-row justify-between items-start mb-1">
                                            <Text className="text-white font-semibold text-base font-inter flex-1 mr-2">{notif.title}</Text>
                                            <Text className="text-white/40 text-[10px] font-inter mt-1 whitespace-nowrap">
                                                {notif.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {notif.timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </Text>
                                        </View>
                                        <Text className="text-white/60 text-sm font-inter">{notif.message}</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => removeNotification(notif.id)}
                                        className="notification-close-btn"
                                    >
                                        <Text className="text-white/80 text-lg text-center">×</Text>
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}
