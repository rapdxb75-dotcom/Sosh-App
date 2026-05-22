import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  RefreshCw,
  X,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";
import { SKUS, useIAP } from "../../hooks/useIAP";
import { RootState } from "../../store/store";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface PaywallProps {
  visible: boolean;
  onClose: () => void;
}

export const Paywall = ({ visible, onClose }: PaywallProps) => {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const userEmail = useSelector((state: RootState) => state.user.email);
  const { handlePurchase: purchaseIAP, handleRestore: restoreIAP } = useIAP(onClose, userEmail);

  // Selector and accordion states
  const [selectedPlan, setSelectedPlan] = useState<"Pro" | "Business">("Pro");
  const [accordionExpanded, setAccordionExpanded] = useState(false);

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

  const handlePurchase = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Toast.show({
      type: "info",
      text1: "Initiating Secure Purchase",
      text2: `Connecting to App Store for Sosh ${selectedPlan}...`,
    });

    const sku = selectedPlan === "Pro" ? SKUS.PRO : SKUS.BUSINESS;
    await purchaseIAP(sku);
  };

  const selectPlan = (plan: "Pro" | "Business") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPlan(plan);
  };

  const toggleAccordion = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAccordionExpanded(!accordionExpanded);
  };

  const proFeatures = [
    "500 AI Chats & Captions per month",
    "Custom AI trained on your brand",
    "Cross-platform (IG, TT, YT, FB, X)",
    "90-day analytics on all accounts",
    "Scheduling, video, and reel tools",
    "Smart captions per platform",
  ];

  const businessFeatures = [
    "Everything in Pro, plus:",
    "No hard limits on AI Chat/Captions*",
    "Custom AI built by experts",
    "Snapchat posting included",
    "Deeper analytics (outside Sosh too)",
    "24/7 support & Team seats",
  ];

  const currentFeatures = selectedPlan === "Pro" ? proFeatures : businessFeatures;
  const planColor = selectedPlan === "Pro" ? "#3b82f6" : "#FF8A00";

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
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Absolute Floating Close Button */}
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeButton, { top: insets.top > 0 ? insets.top + 6 : 20 }]}
            className="z-50"
            activeOpacity={0.8}
          >
            <BlurView intensity={20} tint="light" style={styles.closeBlur}>
              <X size={20} color="#fff" />
            </BlurView>
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            bounces={true}
          >
            {/* Safe Area Notch Spacer */}
            <View style={{ height: insets.top > 0 ? insets.top + 10 : 30 }} />

            {/* Full Width Top Image Header */}
            <View style={styles.imageContainer}>
              <Image
                source={require("../../assets/images/welcome_bg.png")}
                style={styles.heroImage}
                resizeMode="cover"
              />
              {/* <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.8)", "#000000"]}
                style={StyleSheet.absoluteFill}
              /> */}
            </View>

            {/* Typography Header */}
            <View className="items-center px-6 mt-2 mb-8">
              <Text className="text-white text-4xl font-bold font-inter text-center mb-3">
                Sosh Premium
              </Text>
              <Text className="text-white/60 text-[15px] font-inter text-center px-4 leading-6">
                Unleash the full power of your digital authority with advanced tools.
              </Text>
            </View>

            {/* Unified Dark Selector Container */}
            <View style={styles.selectorCard}>
              {/* Option 1: Sosh Pro */}
              <TouchableOpacity
                onPress={() => selectPlan("Pro")}
                style={[
                  styles.optionRow,
                  selectedPlan === "Pro" && styles.optionRowSelectedPro,
                ]}
                activeOpacity={0.9}
              >
                <View className="flex-row items-center flex-1">
                  {/* Custom Radio Button */}
                  <View
                    style={[
                      styles.radioCircle,
                      selectedPlan === "Pro" && styles.radioCircleSelectedPro,
                    ]}
                  >
                    {selectedPlan === "Pro" && <View style={styles.radioDotPro} />}
                  </View>

                  <View className="flex-1 pr-4">
                    <View className="flex-row items-center flex-wrap mb-0.5">
                      <Text className="text-white text-[16px] font-bold font-inter">
                        Sosh Pro
                      </Text>
                    </View>
                    <Text className="text-white/40 text-[11px] font-inter">
                      500 AI Chats & Captions • Trained on your brand
                    </Text>
                  </View>
                </View>

                {/* Pricing Info */}
                <View className="items-end">
                  <View className="flex-row items-baseline">
                    <Text className="text-white/30 text-[11px] line-through mr-1.5 font-inter">
                      $99
                    </Text>
                    <Text className="text-white text-[20px] font-bold font-inter">
                      $79
                    </Text>
                    <Text className="text-white/60 text-[11px] font-inter ml-0.5">
                      /1st mo
                    </Text>
                  </View>
                  <Text className="text-[#3b82f6] text-[9px] font-bold uppercase font-inter tracking-wider mt-0.5">
                    Save 20%
                  </Text>
                  <Text className="text-white/30 text-[8px] font-inter mt-0.5">
                    then $99/mo
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Option 2: Sosh Business */}
              <TouchableOpacity
                onPress={() => selectPlan("Business")}
                style={[
                  styles.optionRow,
                  selectedPlan === "Business" && styles.optionRowSelectedBusiness,
                ]}
                activeOpacity={0.9}
              >
                <View className="flex-row items-center flex-1">
                  {/* Custom Radio Button */}
                  <View
                    style={[
                      styles.radioCircle,
                      selectedPlan === "Business" && styles.radioCircleSelectedBusiness,
                    ]}
                  >
                    {selectedPlan === "Business" && <View style={styles.radioDotBusiness} />}
                  </View>

                  <View className="flex-1 pr-4">
                    <View className="flex-row items-center flex-wrap mb-0.5">
                      <Text className="text-white text-[16px] font-bold font-inter">
                        Sosh Business
                      </Text>
                    </View>
                    <Text className="text-white/40 text-[11px] font-inter">
                      Unlimited AI Chat • Snapchat posting • Team seats
                    </Text>
                  </View>
                </View>

                {/* Pricing Info */}
                <View className="items-end">
                  <View className="flex-row items-baseline">
                    <Text className="text-white/30 text-[11px] line-through mr-1.5 font-inter">
                      $799
                    </Text>
                    <Text className="text-white text-[20px] font-bold font-inter">
                      $599
                    </Text>
                    <Text className="text-white/60 text-[11px] font-inter ml-0.5">
                      /1st mo
                    </Text>
                  </View>
                  <Text className="text-[#FF8A00] text-[9px] font-bold uppercase font-inter tracking-wider mt-0.5">
                    Save 25%
                  </Text>
                  <Text className="text-white/30 text-[8px] font-inter mt-0.5">
                    then $799/mo
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Unified Accordion Card */}
            <View style={styles.accordionContainer}>
              <TouchableOpacity
                onPress={toggleAccordion}
                style={[
                  styles.accordionHeader,
                  accordionExpanded && styles.accordionHeaderExpanded,
                ]}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center">
                  <View
                    style={[styles.smallIconCircle, { backgroundColor: `${planColor}15` }]}
                  >
                    <CheckCircle2 size={14} color={planColor} />
                  </View>
                  <Text className="text-white text-[14px] font-semibold font-inter ml-2.5">
                    Show all details of {selectedPlan} plan
                  </Text>
                </View>
                {accordionExpanded ? (
                  <ChevronUp size={16} color="rgba(255,255,255,0.6)" />
                ) : (
                  <ChevronDown size={16} color="rgba(255,255,255,0.6)" />
                )}
              </TouchableOpacity>

              {/* Collapsed Features Content nested inside the same card */}
              {accordionExpanded && (
                <View style={styles.accordionContent}>
                  {currentFeatures.map((feature, idx) => (
                    <View key={idx} className="flex-row items-start mb-3.5 px-1">
                      <View className="w-5 h-5 items-center justify-center mr-3 mt-0.5">
                        <CheckCircle2 size={15} color={planColor} strokeWidth={2.5} />
                      </View>
                      <Text className="text-white/90 text-[13.5px] font-inter leading-5 flex-1">
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Dynamic CTA Purchase Button */}
            {selectedPlan === "Pro" ? (
              <TouchableOpacity
                style={styles.proButton}
                activeOpacity={0.9}
                onPress={handlePurchase}
              >
                <Text style={styles.proButtonText}>Subscribe Pro</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.buttonContainer}
                activeOpacity={0.9}
                onPress={handlePurchase}
              >
                <LinearGradient
                  colors={["#FF8A00", "#E67A00"]}
                  style={styles.gradientButton}
                >
                  <Text style={styles.businessButtonText}>Elevate Your Business</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Compliance Footer */}
            <View className="items-center px-6 mt-4 mb-10">
              {/* Restore Button */}
              <TouchableOpacity
                onPress={handleRestore}
                style={styles.restoreButton}
                activeOpacity={0.8}
              >
                <RefreshCw size={14} color="rgba(255,255,255,0.8)" />
                <Text className="text-white/80 text-[15px] font-semibold ml-2.5 font-inter">
                  Restore Purchases
                </Text>
              </TouchableOpacity>

              {/* Subscriptions Account Link */}
              <TouchableOpacity
                onPress={handleManageSubscriptions}
                className="flex-row items-center justify-center py-4 px-8 mb-6"
              >
                <ExternalLink size={14} color="rgba(255,255,255,0.4)" />
                <Text className="text-white/40 text-sm font-medium ml-2 font-inter underline">
                  Manage Apple App Store Subscriptions
                </Text>
              </TouchableOpacity>

              {/* Legal renewal disclosure */}
              <Text className="text-white/40 text-[11px] font-inter text-center mb-5 leading-4 px-2">
                Subscriptions automatically renew at the end of each billing period unless cancelled at least 24 hours before the renewal date. Your Apple ID account will be charged upon confirmation of purchase. You can manage or cancel your subscription at any time in your Apple ID Account Settings.
              </Text>

              {/* EULA & Privacy links */}
              <View className="flex-row justify-center gap-6 mb-6">
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(
                      "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
                    )
                  }
                >
                  <Text className="text-white/70 text-xs font-inter underline">
                    Terms of Use (EULA)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => Linking.openURL("https://sosh.digital/privacy")}
                >
                  <Text className="text-white/70 text-xs font-inter underline">
                    Privacy Policy
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Fair Use Policy */}
              <Text className="text-white/60 text-[10px] font-inter text-center px-8 leading-4">
                *Fair Use Policy: Usage has no hard limits for normal everyday use. We monitor for automated activity, resale, or abuse and may apply reasonable limits on extreme, non-typical use. We'll always notify you first.
              </Text>
            </View>
          </ScrollView>
        </Animated.View>

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
    paddingBottom: 40,
  },
  closeButton: {
    position: "absolute",
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
  imageContainer: {
    width: "100%",
    height: SCREEN_HEIGHT * 0.36,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    left: -8,
  },
  selectorCard: {
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 24,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: "transparent",
    backgroundColor: "rgba(255,255,255,0.01)",
  },
  optionRowSelectedPro: {
    borderColor: "#3b82f6",
    backgroundColor: "rgba(59,130,246,0.12)",
  },
  optionRowSelectedBusiness: {
    borderColor: "#FF8A00",
    backgroundColor: "rgba(255,138,0,0.12)",
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioCircleSelectedPro: {
    borderColor: "#3b82f6",
  },
  radioCircleSelectedBusiness: {
    borderColor: "#FF8A00",
  },
  radioDotPro: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#3b82f6",
  },
  radioDotBusiness: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF8A00",
  },
  accordionContainer: {
    marginHorizontal: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 12,
    overflow: "hidden",
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  accordionHeaderExpanded: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  smallIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  accordionContent: {
    backgroundColor: "rgba(0,0,0,0.15)",
    padding: 16,
    paddingTop: 20,
  },
  proButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  proButtonText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 17,
  },
  buttonContainer: {
    height: 56,
    borderRadius: 16,
    overflow: "hidden",
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: "#FF8A00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  gradientButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  businessButtonText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 17,
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
    marginBottom: 8,
  },
});

export default Paywall;
