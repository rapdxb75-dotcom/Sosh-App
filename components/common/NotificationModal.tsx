import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Bell, Check, Info, Trash2, X } from "lucide-react-native";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { normalize } from "../../constants/Fonts";
import {
  Notification,
  NotificationType,
  useNotification,
} from "../../context/NotificationContext";

/* ────────── helpers ────────── */

/** Relative time label: "Just now", "2m ago", "1h ago", "Yesterday", etc. */
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;

  const yesterday = new Date(now.getTime());
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Accent colour per notification type */
function getTypeColor(type: NotificationType) {
  if (type === "success") return "#34C759";
  if (type === "error") return "#FF453A";
  return "#0A84FF";
}

/* ────────── per-item row ────────── */

function NotificationRow({
  notif,
  onRemove,
}: {
  notif: Notification;
  onRemove: (id: string) => void;
}) {
  const color = getTypeColor(notif.type);

  return (
    <View>
      <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: color }]}>
        {/* Icon */}
        <View style={[styles.iconCircle, { backgroundColor: color }]}>
          {notif.type === "success" ? (
            <Check size={16} color="#FFFFFF" strokeWidth={3} />
          ) : notif.type === "error" ? (
            <X size={16} color="#FFFFFF" strokeWidth={3} />
          ) : (
            <Info size={16} color="#FFFFFF" strokeWidth={3} />
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {notif.title}
            </Text>
            <Text style={styles.time}>
              {getRelativeTime(
                notif.timestamp instanceof Date
                  ? notif.timestamp
                  : new Date(notif.timestamp),
              )}
            </Text>
          </View>
          <Text style={styles.message} numberOfLines={2}>
            {notif.message}
          </Text>
        </View>

        {/* Dismiss button */}
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onRemove(notif.id);
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.dismissBtn}
        >
          <X size={14} color="rgba(255,255,255,0.35)" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ────────── main modal ────────── */

export default function NotificationModal() {
  const {
    isVisible,
    hideNotifications,
    notifications,
    removeNotification,
    clearNotifications,
  } = useNotification();
  const insets = useSafeAreaInsets();

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    hideNotifications();
  };

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    clearNotifications();
  };

  // Group notifications: Today vs Earlier
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayNotifs: Notification[] = [];
  const earlierNotifs: Notification[] = [];
  notifications.forEach((n) => {
    const ts = n.timestamp instanceof Date ? n.timestamp : new Date(n.timestamp);
    if (ts >= today) {
      todayNotifs.push(n);
    } else {
      earlierNotifs.push(n);
    }
  });

  return (
    <Modal
      animationType="fade"
      transparent
      visible={isVisible}
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <BlurView
        intensity={80}
        tint="dark"
        style={[StyleSheet.absoluteFill]}
      >
        {/* Tap-to-close overlay */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleClose}
        />

        <View
          style={[
            styles.container,
            {
              paddingTop: Math.max(insets.top + 12, 56),
              paddingBottom: Math.max(insets.bottom + 12, 24),
            },
          ]}
        >
          <View style={styles.panel}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.heading}>Notifications</Text>
                {notifications.length > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{notifications.length}</Text>
                  </View>
                )}
              </View>

              <View style={styles.headerRight}>
                {notifications.length > 0 && (
                  <TouchableOpacity onPress={handleClear} style={styles.headerBtn}>
                    <Trash2 size={18} color="#FF453A" strokeWidth={2.5} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={handleClose} style={styles.headerBtn}>
                  <X size={20} color="#FFFFFF" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Scrollable list */}
            <ScrollView
              style={{ flexShrink: 1 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
              bounces
            >
              {notifications.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIcon}>
                    <Bell size={36} color="rgba(255,255,255,0.2)" strokeWidth={1.5} />
                  </View>
                  <Text style={styles.emptyTitle}>All caught up!</Text>
                  <Text style={styles.emptySubtitle}>
                    No new notifications right now.
                  </Text>
                </View>
              ) : (
                <>
                  {todayNotifs.length > 0 && (
                    <>
                      <Text style={styles.sectionLabel}>Today</Text>
                      {todayNotifs.map((n) => (
                        <NotificationRow
                          key={n.id}
                          notif={n}
                          onRemove={removeNotification}
                        />
                      ))}
                    </>
                  )}
                  {earlierNotifs.length > 0 && (
                    <>
                      <Text style={styles.sectionLabel}>Earlier</Text>
                      {earlierNotifs.map((n) => (
                        <NotificationRow
                          key={n.id}
                          notif={n}
                          onRemove={removeNotification}
                        />
                      ))}
                    </>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

/* ────────── styles ────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 14,
  },
  panel: {
    backgroundColor: "rgba(22, 22, 24, 0.92)",
    borderRadius: 28,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexShrink: 1,
    overflow: "hidden",
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  heading: {
    color: "#FFFFFF",
    fontSize: normalize(26),
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.5,
  },
  badge: {
    backgroundColor: "#FF453A",
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  // Section labels
  sectionLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 4,
    marginLeft: 4,
  },
  // Notification card
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    overflow: "hidden",
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 1,
  },
  content: {
    flex: 1,
    marginRight: 6,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
    marginRight: 8,
  },
  time: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  message: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  dismissBtn: {
    padding: 4,
    marginTop: -2,
    marginRight: -4,
  },
  // Empty state
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 56,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  emptySubtitle: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
});
