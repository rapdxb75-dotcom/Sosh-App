import { BlurView } from "expo-blur";
import { AlertCircle, CheckCircle, Info, Trash2, X } from "lucide-react-native";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { normalize } from "../../constants/Fonts";
import {
  NotificationType,
  useNotification,
} from "../../context/NotificationContext";

export default function NotificationModal() {
  const {
    isVisible,
    hideNotifications,
    notifications,
    removeNotification,
    clearNotifications,
  } = useNotification();

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "success":
        return <CheckCircle size={22} color="#34C759" strokeWidth={2.5} />;
      case "error":
        return <AlertCircle size={22} color="#FF3B30" strokeWidth={2.5} />;
      default:
        return <Info size={22} color="#0A84FF" strokeWidth={2.5} />;
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={hideNotifications}
    >
      <BlurView
        intensity={60}
        tint="dark"
        style={{
          flex: 1,
          justifyContent: "flex-start",
          alignItems: "center",
          paddingTop: normalize(80),
          paddingHorizontal: 16,
        }}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={hideNotifications}
        />

        <View className="bg-[#1C1C1E]/95 w-full max-w-[380px] rounded-[32px] p-6 max-h-[85%] border border-white/10 overflow-hidden shadow-2xl">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6 z-10">
            <Text
              className="text-white font-inter font-bold tracking-tight"
              style={{ fontSize: normalize(28) }}
            >
              Notifications
            </Text>

            <View className="flex-row items-center gap-3">
              {notifications.length > 0 && (
                <TouchableOpacity
                  onPress={clearNotifications}
                  className="w-10 h-10 items-center justify-center rounded-full bg-white/10"
                >
                  <Trash2 size={20} color="#FF3B30" strokeWidth={2.5} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={hideNotifications}
                className="w-10 h-10 items-center justify-center rounded-full bg-white/10"
              >
                <X size={22} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {notifications.length === 0 ? (
              <View className="py-12 items-center justify-center mt-4">
                <View className="w-16 h-16 rounded-full bg-white/5 items-center justify-center mb-4">
                  <Info size={32} color="rgba(255,255,255,0.6)" strokeWidth={2} />
                </View>
                <Text className="text-white/60 font-inter text-base font-medium">
                  You're all caught up!
                </Text>
                <Text className="text-white/40 font-inter text-sm mt-1 text-center">
                  No new notifications at the moment.
                </Text>
              </View>
            ) : (
              notifications.map((notif) => (
                <View
                  key={notif.id}
                  className="flex-row items-start p-4 mb-3 rounded-[24px] border border-white/5 bg-[#2C2C2E]/80 shadow-sm"
                >
                  <View className="mr-4 mt-1 bg-white/5 p-2 rounded-full">
                    {getNotificationIcon(notif.type)}
                  </View>

                  <View className="flex-1 mr-2 mt-1">
                    <View className="flex-row justify-between items-center mb-1">
                      <Text
                        className="text-white font-semibold text-base font-inter flex-1 mr-2"
                        numberOfLines={1}
                      >
                        {notif.title}
                      </Text>
                      <Text className="text-white/40 text-[11px] font-inter font-medium">
                        {notif.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                    <Text
                      className="text-white/70 text-sm font-inter leading-5"
                      numberOfLines={3}
                    >
                      {notif.message}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => removeNotification(notif.id)}
                    className="p-2 -mr-2 -mt-2"
                  >
                    <X size={18} color="rgba(255,255,255,0.5)" strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  );
}
