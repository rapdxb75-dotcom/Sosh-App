import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { CheckCircle2, ExternalLink, RefreshCw, X } from "lucide-react-native";
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { SKUS, useIAP } from "../../hooks/useIAP";
import { BusinessTierIcon, ProTierIcon } from "./TierIcons";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface PaywallProps {
  visible: boolean;
  onClose: () => void;
}

const PlanFeature = ({ text, icon: Icon, color = "#fff" }: { text: string; icon: any; color?: string }) => (
  <View className="flex-row items-center mb-3">
    <View className="w-5 h-5 items-center justify-center mr-3">
      <Icon size={16} color={color} strokeWidth={2.5} />
    </View>
    <Text className="text-white/90 text-[14px] font-inter leading-5 flex-1">{text}</Text>
  </View>
);

export const Paywall = ({ visible, onClose }: PaywallProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const { handlePurchase: purchaseIAP, handleRestore: restoreIAP } = useIAP(onClose);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    }
  }, [visible]);

  const handleRestore = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Toast.show({
      type: "info",
      text1: "Restoring Purchases",
      text2: "Checking your Apple ID for active subscriptions...",
    });

    await restoreIAP();
  };

  const handleManageSubscriptions = () => {
    Linking.openURL("https://apps.apple.com/account/subscriptions");
  };

  const handlePurchase = async (plan: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Toast.show({
      type: "info",
      text1: "Initiating Secure Purchase",
      text2: `Connecting to App Store for Sosh ${plan}...`,
    });

    const sku = plan === "Pro" ? SKUS.PRO : SKUS.BUSINESS;
    await purchaseIAP(sku);
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            className="z-50"
          >
            <BlurView intensity={20} tint="light" style={styles.closeBlur}>
              <X size={20} color="#fff" />
            </BlurView>
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Hero Section */}
            <View className="items-center mb-10 mt-4">
              <View className="w-20 h-20 rounded-[22px] bg-black items-center justify-center mb-6 shadow-2xl overflow-hidden">
                <Image
                  source={require("../../assets/images/logo.png")}
                  style={{ width: "75%", height: "75%" }}
                  resizeMode="contain"
                />
              </View>
              <Text className="text-white text-4xl font-bold font-inter text-center mb-2">
                Sosh Premium
              </Text>
              <Text className="text-white/60 text-lg font-inter text-center px-6">
                Unleash the full power of your digital authority.
              </Text>
            </View>

            {/* Pro Plan Card */}
            <View
              style={{ marginBottom: 24, position: "relative", zIndex: 10 }}
            >
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>Most Popular</Text>
              </View>
              <LinearGradient
                colors={["rgba(59, 130, 246, 0.25)", "rgba(10, 20, 42, 0.4)"]}
                style={[styles.planCard, styles.proBorder]}
              >
                <View className="flex-row justify-between items-start mb-6">
                  <View>
                    <View className="flex-row items-center mb-1">
                      <ProTierIcon size={20} color="#3b82f6" />
                      <Text className="text-[#3b82f6] text-xs font-bold uppercase tracking-[2px] ml-2">Pro Tier</Text>
                    </View>
                    <Text className="text-white text-3xl font-bold font-inter">Sosh Pro</Text>
                  </View>
                  <View className="items-end">
                    <View className="flex-row items-baseline">
                      <Text className="text-white/30 text-sm line-through mr-2 font-inter">$99</Text>
                      <Text className="text-white text-2xl font-bold font-inter">$79</Text>
                      <Text className="text-white/60 text-xs font-inter ml-1">/month</Text>
                    </View>
                    <Text className="text-white/40 text-[10px] font-bold uppercase tracking-widest text-right">first month{"\n"}(20% off beta sale)</Text>
                    <Text className="text-white/30 text-[10px] font-inter text-right mt-1">Auto-renews monthly</Text>
                  </View>
                </View>

                <View className="mb-8">
                  <PlanFeature icon={CheckCircle2} color="#3b82f6" text="Always-on AI Chat & Caption Generator*" />
                  <PlanFeature icon={CheckCircle2} color="#3b82f6" text="Custom AI trained on your brand" />
                  <PlanFeature icon={CheckCircle2} color="#3b82f6" text="Cross-platform (IG, TT, YT, FB, X)" />
                  <PlanFeature icon={CheckCircle2} color="#3b82f6" text="90-day analytics on all accounts" />
                  <PlanFeature icon={CheckCircle2} color="#3b82f6" text="Scheduling, video, and reel tools" />
                  <PlanFeature icon={CheckCircle2} color="#3b82f6" text="Smart captions per platform" />
                </View>

                <TouchableOpacity
                  style={styles.proButton}
                  activeOpacity={0.9}
                  onPress={() => handlePurchase("Pro")}
                >
                  <Text style={styles.proButtonText}>Subscribe Pro</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>

            {/* Business Plan Card */}
            <View
              className="mb-8"
            >
              <LinearGradient
                colors={["rgba(255, 138, 0, 0.2)", "rgba(25, 15, 0, 0.6)"]}
                style={[styles.planCard, styles.businessBorder]}
              >
                <View className="flex-row justify-between items-start mb-6">
                  <View>
                    <View className="flex-row items-center mb-1">
                      <BusinessTierIcon size={20} color="#FF8A00" />
                      <Text className="text-[#FF8A00] text-xs font-bold uppercase tracking-[2px] ml-2">Enterprise</Text>
                    </View>
                    <Text className="text-white text-3xl font-bold font-inter">Sosh Business</Text>
                  </View>
                  <View className="items-end">
                    <View className="flex-row items-baseline">
                      <Text className="text-white/30 text-sm line-through mr-2 font-inter">$799</Text>
                      <Text className="text-white text-2xl font-bold font-inter">$599</Text>
                      <Text className="text-white/60 text-xs font-inter ml-1">/month</Text>
                    </View>
                    <Text className="text-white/40 text-[10px] font-bold uppercase tracking-widest text-right">first month{"\n"}(25% off beta sale)</Text>
                    <Text className="text-white/30 text-[10px] font-inter text-right mt-1">Auto-renews monthly</Text>
                  </View>
                </View>

                <View className="mb-8">
                  <PlanFeature icon={CheckCircle2} color="#FF8A00" text="Everything in Pro, plus:" />
                  <PlanFeature icon={CheckCircle2} color="#FF8A00" text="No hard limits on AI Chat/Captions*" />
                  <PlanFeature icon={CheckCircle2} color="#FF8A00" text="Custom AI built by experts" />
                  <PlanFeature icon={CheckCircle2} color="#FF8A00" text="Snapchat posting included" />
                  <PlanFeature icon={CheckCircle2} color="#FF8A00" text="Deeper analytics (outside Sosh too)" />
                  <PlanFeature icon={CheckCircle2} color="#FF8A00" text="24/7 support & Team seats" />
                </View>

                <TouchableOpacity
                  style={styles.buttonContainer}
                  activeOpacity={0.9}
                  onPress={() => handlePurchase("Business")}
                >
                  <LinearGradient
                    colors={["#FF8A00", "#E67A00"]}
                    style={styles.gradientButton}
                  >
                    <Text style={styles.businessButtonText}>Elevate Your Business</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>

            {/* Compliance & Links */}
            <View className="items-center mb-10">
              <TouchableOpacity
                onPress={handleRestore}
                style={styles.restoreButton}
              >
                <RefreshCw size={16} color="rgba(255,255,255,0.8)" />
                <Text className="text-white/80 text-base font-medium ml-3 font-inter">Restore Purchases</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleManageSubscriptions}
                className="flex-row items-center justify-center py-4 px-8 mb-8 w-full"
              >
                <ExternalLink size={14} color="rgba(255,255,255,0.4)" />
                <Text className="text-white/40 text-sm font-medium ml-2 font-inter underline">
                  Manage Apple App Store Subscriptions
                </Text>
              </TouchableOpacity>

              {/* Auto-Renewal Legal Disclosure – Required by Apple Guideline 3.1.2(c) */}
              <Text className="text-white/40 text-[11px] font-inter text-center mb-5 px-4 leading-[16px]">
                Subscriptions automatically renew at the end of each billing period unless cancelled at least 24 hours before the renewal date. Your Apple ID account will be charged upon confirmation of purchase. You can manage or cancel your subscription at any time in your Apple ID Account Settings.
              </Text>

              <View className="flex-row justify-center gap-6">
                <TouchableOpacity onPress={() => Linking.openURL("https://sosh.digital/terms")}>
                  <Text className="text-white/70 text-xs font-inter">Terms of Use (EULA)</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Linking.openURL("https://sosh.digital/privacy")}>
                  <Text className="text-white/70 text-xs font-inter">Privacy Policy</Text>
                </TouchableOpacity>
              </View>

              <Text className="text-white/60 text-[10px] font-inter text-center mt-6 px-10 leading-4">
                *Fair Use Policy: Usage has no hard limits for normal everyday use. We monitor for automated activity, resale, or abuse and may apply reasonable limits on extreme, non-typical use. We'll always notify you first.
              </Text>
            </View>
          </ScrollView>
        </Animated.View>

        {/* Render Toast inside Modal so it's visible on top */}
        <Toast position="bottom" bottomOffset={40} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 40,
  },
  closeButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    right: 20,
  },
  closeBlur: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  planCard: {
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    overflow: "visible", // Ensure absolute children aren't clipped
  },
  proBorder: {
    borderWidth: 1.5,
    borderColor: "rgba(59, 130, 246, 0.4)",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  businessBorder: {
    borderWidth: 1.5,
    borderColor: "rgba(255, 138, 0, 0.5)",
    shadowColor: "#FF8A00",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  popularBadge: {
    position: "absolute",
    top: -12,
    right: 24,
    backgroundColor: "#3b82f6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 999, // Ensure it's on top of everything
    elevation: 10,
  },
  popularText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  buttonContainer: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradientButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  proButton: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  proButtonText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 18,
  },
  businessButtonText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 18,
  },
  restoreButton: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Paywall;
