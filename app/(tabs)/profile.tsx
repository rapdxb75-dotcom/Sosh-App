import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { Upload } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  Rect,
  Stop,
  LinearGradient as SvgLinearGradient,
} from "react-native-svg";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import Header from "../../components/common/Header";
import { useNotification } from "../../context/NotificationContext";
import userService from "../../services/api/user";
import { listenToUserData } from "../../services/firebase";
import storageService from "../../services/storage";
import type { AppDispatch } from "../../store/store";
import { RootState } from "../../store/store";
import { updateUser } from "../../store/userSlice";
import { formatNumber } from "../../utils/format";

let ImageCropPicker: any = null;
try {
  ImageCropPicker = require("react-native-image-crop-picker").default;
} catch (e) {
  console.log("react-native-image-crop-picker is not available. Falling back to expo-image-picker.");
}

// Social media platform configuration
const SOCIAL_PLATFORMS = [
  {
    key: "instagram",
    name: "Instagram",
    icon: require("../../assets/icons/instagram.png"),
  },
  {
    key: "tiktok",
    name: "TikTok",
    icon: require("../../assets/icons/tiktok.png"),
  },
  {
    key: "youtube",
    name: "YouTube",
    icon: require("../../assets/icons/youtube.png"),
  },
  {
    key: "snapchat",
    name: "Snapchat",
    icon: require("../../assets/icons/snapchat.png"),
  },
  {
    key: "twitter",
    name: "Twitter",
    icon: require("../../assets/icons/twitter.png"),
  },
  {
    key: "facebook",
    name: "Facebook",
    icon: require("../../assets/icons/facebook.png"),
  },
] as const;

type SocialPlatformKey = (typeof SOCIAL_PLATFORMS)[number]["key"];

interface SocialMediaData {
  [key: string]: string[] | undefined;
}

/* ---------- Gradient Ring Component ---------- */
const GradientRingSVG = () => {
  const size = 50;
  const strokeWidth = 1;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  return (
    <View style={ringStyles.container}>
      <BlurView intensity={5} style={ringStyles.blurContainer}>
        <Svg width={size} height={size}>
          <Defs>
            <SvgLinearGradient
              id="profileGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
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
  const dispatch = useDispatch<AppDispatch>();
  const { addNotification } = useNotification();
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  // Global User State from Redux
  const globalUserName = useSelector((state: RootState) => state.user.userName);
  const globalProfilePicture = useSelector(
    (state: RootState) => state.user.profilePicture,
  );
  const globalEmail = useSelector((state: RootState) => state.user.email);

  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [selectedPlatformKey, setSelectedPlatformKey] = useState<string | null>(
    null,
  );

  // Local state for the edit modal
  const [username, setUsername] = useState(globalUserName);
  const [image, setImage] = useState<string | null>(globalProfilePicture);
  const [loading, setLoading] = useState(false);

  // Social media connections state
  const [socialMediaData, setSocialMediaData] = useState<SocialMediaData>({});
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(
    null,
  );

  const [analytics, setAnalytics] = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalViews: 0,
  });

  // Sync local state when modal opens or global state changes
  useEffect(() => {
    if (editModalVisible) {
      setUsername(globalUserName);
      setImage(globalProfilePicture);
    }
  }, [editModalVisible, globalUserName, globalProfilePicture]);

  // Fetch social media data from Firebase when profile loads
  useEffect(() => {
    if (!globalEmail) {
      return;
    }

    // Set up listener for social media data only
    const unsubscribe = listenToUserData(
      globalEmail,
      (userData) => {
        if (userData) {
          // Extract analytics data
          if (userData?.totalAnalytics) {
            const { totalPosts, totalLikes, totalViews } = userData.totalAnalytics;
            setAnalytics({
              totalPosts: totalPosts || 0,
              totalLikes: totalLikes || 0,
              totalViews: totalViews || 0,
            });
          } else {
            setAnalytics({ totalPosts: 0, totalLikes: 0, totalViews: 0 });
          }

          // Extract social media data
          const socialData: SocialMediaData = {};
          SOCIAL_PLATFORMS.forEach((platform) => {
            const data = userData[platform.key];
            if (data && Array.isArray(data) && data.length > 0) {
              socialData[platform.key] = data;
            }
          });
          setSocialMediaData(socialData);
        }
      },
      (error) => {
        console.error("Firebase listener error in profile:", error);
      },
    );

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [globalEmail]);

  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Use react-native-image-crop-picker for circular crop if available
    if (ImageCropPicker) {
      try {
        const result = await ImageCropPicker.openPicker({
          width: 400,
          height: 400,
          cropping: true,
          cropperCircleOverlay: true,
          includeBase64: true,
          mediaType: "photo",
          compressImageQuality: 0.5,
        });

        if (result.data) {
          const mime = result.mime || "image/jpeg";
          setImage(`data:${mime};base64,${result.data}`);
        } else if (result.path) {
          setImage(result.path);
        }
        return;
      } catch (e: any) {
        if (e?.code === "E_PICKER_CANCELLED") return;
        console.log("ImageCropPicker error, falling back:", e);
      }
    }

    // Fallback to expo-image-picker
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      if (asset.base64) {
        setImage(`data:image/jpeg;base64,${asset.base64}`);
      } else {
        setImage(asset.uri);
      }
    }
  };

  const handleSaveProfile = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      setLoading(true);

      // First update via API
      const payload = {
        userName: username,
        profilePicture: image || "",
      };
      console.log("[Profile Update API Payload]:", {
        ...payload,
        profilePicture: payload.profilePicture
          ? `${payload.profilePicture.substring(0, 50)}... (truncated)`
          : "",
      });

      const response = await userService.updateProfile(payload);

      if (response.success) {
        // Then Update Redux (which also updates storage via our thunk-like action)
        // @ts-ignore - dispatch type is complex with thunks
        await dispatch(
          updateUser({
            userName: username,
            profilePicture: image,
          }),
        );

        // Consolidated Notifications
        const isPicUpdated = image !== globalProfilePicture;
        const isNameUpdated = username !== globalUserName;

        if (isPicUpdated && isNameUpdated) {
          addNotification({
            type: "success",
            title: "Profile Updated",
            message: "Successfully changed your username and profile photo.",
          });
          Toast.show({
            type: "success",
            text1: "Profile Updated",
            text2: "Username and profile photo updated successfully",
          });
        } else if (isPicUpdated) {
          addNotification({
            type: "success",
            title: "Profile Picture Updated",
            message: "Successfully changed your profile photo.",
          });
          Toast.show({
            type: "success",
            text1: "Profile Updated",
            text2: "Profile photo updated successfully",
          });
        } else if (isNameUpdated) {
          addNotification({
            type: "success",
            title: "Username Updated",
            message: `Your username is now ${username}`,
          });
          Toast.show({
            type: "success",
            text1: "Profile Updated",
            text2: "Username updated successfully",
          });
        } else {
          // Nothing changed, but we show a generic success if API was called
          Toast.show({
            type: "success",
            text1: "Profile Saved",
            text2: "Settings saved successfully",
          });
        }
        setEditModalVisible(false);
      } else {
        Toast.show({
          type: "error",
          text1: "Update Failed",
          text2: response.message || "Could not update profile",
        });
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Update Error",
        text2: error.message || "An error occurred while saving",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectPress = (accountName: string, platformKey: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedAccount(accountName);
    setSelectedPlatformKey(platformKey);
    setModalVisible(true);
  };

  const confirmDisconnect = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!selectedPlatformKey || !globalEmail) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Missing platform or email information",
      });
      return;
    }

    try {
      setLoading(true);
      await userService.disconnectSocialMedia(globalEmail, selectedPlatformKey);

      // Show success notification
      Toast.show({
        type: "success",
        text1: `${selectedAccount} disconnected successfully`,
        text2: "",
        visibilityTime: 2000,
      });

      addNotification({
        type: "success",
        title: "Account Disconnected",
        message: `${selectedAccount} disconnected successfully`,
      });

      setModalVisible(false);
      setSelectedAccount(null);
      setSelectedPlatformKey(null);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Disconnect Failed",
        text2: error.message || "Failed to disconnect account",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if a platform is connected
  const isPlatformConnected = (platformKey: SocialPlatformKey): boolean => {
    const data = socialMediaData[platformKey];
    return !!(data && Array.isArray(data) && data.length > 0);
  };

  // Helper function to get platform URL
  const getPlatformUrl = (platformKey: SocialPlatformKey): string | null => {
    const data = socialMediaData[platformKey];
    if (data && Array.isArray(data) && data.length >= 2) {
      return data[1]; // URL is at index 1
    }
    return null;
  };

  // Helper function to get platform status
  const getPlatformStatus = (platformKey: SocialPlatformKey): string => {
    return isPlatformConnected(platformKey) ? "Connected" : "Not connected";
  };

  // Helper function to get platform username
  const getPlatformUsername = (platformKey: SocialPlatformKey): string | null => {
    const data = socialMediaData[platformKey];
    if (data && Array.isArray(data) && data.length >= 3) {
      return data[2]; // Username is at index 2
    }
    return null;
  };

  const handleConnectSocialMedia = async (
    platform: string,
    platformName: string,
  ) => {
    try {
      setConnectingPlatform(platform);

      const userEmail = await storageService.getEmail();
      if (!userEmail) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "User email not found",
        });
        return;
      }

      const token = await storageService.getToken();
      if (!token) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Authentication token not found",
        });
        return;
      }

      const response = await userService.connectSocialMedia(
        userEmail,
        token,
        platform,
      );
      console.log("response : ", response);
      if (
        response &&
        Array.isArray(response) &&
        response.length > 0 &&
        response[0].url
      ) {
        await Linking.openURL(response[0].url);
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Connection Failed",
        text2: error.message || `Failed to connect ${platformName}`,
      });
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleConnectPress = (platformKey: SocialPlatformKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const platform = SOCIAL_PLATFORMS.find((p) => p.key === platformKey);
    if (platform) {
      handleConnectSocialMedia(platformKey, platform.name);
    }
  };

  return (
    <View className="flex-1">
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="w-full">
          <Header />
        </View>

        <View className="w-full px-5">
          <Text className="page-title text-white mb-4 mt-8">
            Your{"\n"}Account
          </Text>

          {/* Profile Card with Gradient Border Overlay */}
          <View
            className="rounded-[32px] overflow-hidden mb-8"
            style={{
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.45,
              shadowRadius: 24,
              elevation: 12,
            }}
          >
            <BlurView intensity={30} tint="light" className="p-[1px]">
              <LinearGradient
                colors={[
                  "rgba(255, 255, 255, 0.1)",
                  "rgba(255, 255, 255, 0.1)",
                ]}
                style={{
                  borderRadius: 32,
                  paddingVertical: 20,
                  paddingHorizontal: 10,
                  position: "relative",
                }}
              >
                {/* Gradient Border SVG (Taller to hide bottom stroke) */}
                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                  <Svg height="120%" width="100%">
                    <Defs>
                      <SvgLinearGradient
                        id="cardBorderGrad"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <Stop
                          offset="0%"
                          stopColor="rgba(255, 255, 255, 0.7)"
                          stopOpacity="1"
                        />
                        <Stop
                          offset="100%"
                          stopColor="rgba(0, 0, 0, 0.7)"
                          stopOpacity="1"
                        />
                      </SvgLinearGradient>
                    </Defs>
                    <Rect
                      x="0.5"
                      y="0.5"
                      width="99.7%"
                      height="87%" // Relative to SVG height="120%", this puts bottom edge way outside container
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
                    <View className="w-[50px] h-[50px] items-center justify-center">
                      <GradientRingSVG />
                      <Image
                        source={
                          image
                            ? {
                              uri:
                                image.startsWith("http") ||
                                  image.startsWith("file") ||
                                  image.startsWith("data:")
                                  ? image
                                  : `data:image/png;base64,${image}`,
                            }
                            : require("../../assets/images/avtar.png")
                        }
                        className="w-[45px] h-[45px] rounded-full"
                        resizeMode={image ? "cover" : "contain"}
                      />
                    </View>
                    <Text className="profile-username text-white">
                      {username}
                    </Text>
                  </View>
                  <TouchableOpacity
                    className="rounded-[12px] p-[8px] bg-[rgba(255,255,255,0.12)]"
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setEditModalVisible(true);
                    }}
                    style={{
                      shadowColor: "#000000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 6,
                    }}
                  >
                    <Image
                      source={require("../../assets/icons/edit.png")}
                      className="w-5 h-5"
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>

                {/* Stats Grid */}
                <View className="flex-row flex-wrap gap-3 p-2">
                  <StatItem
                    label="Sosh Views"
                    value={analytics.totalViews > 0 ? formatNumber(analytics.totalViews) : "0"}
                  />
                  <StatItem
                    label="Sosh Likes"
                    value={analytics.totalLikes > 0 ? formatNumber(analytics.totalLikes) : "0"}
                  />
                  <StatItem
                    label="Platforms"
                    value={SOCIAL_PLATFORMS.filter(p => isPlatformConnected(p.key)).length.toString()}
                  />
                  <StatItem
                    label="Sosh Posts"
                    value={analytics.totalPosts > 0 ? formatNumber(analytics.totalPosts) : "0"}
                  />
                </View>
              </LinearGradient>
            </BlurView>
          </View>

          {/* Connected Accounts */}
          <Text className="text-white text-lg font-medium mb-4">
            Connected accounts
          </Text>

          {SOCIAL_PLATFORMS.map((platform) => (
            <ConnectedAccountItem
              key={platform.key}
              icon={platform.icon}
              name={platform.name}
              status={getPlatformStatus(platform.key)}
              connectedUsername={getPlatformUsername(platform.key)}
              isConnected={isPlatformConnected(platform.key)}
              isConnecting={connectingPlatform === platform.key}
              onConnect={() => handleConnectPress(platform.key)}
              onDisconnect={() =>
                handleDisconnectPress(platform.name, platform.key)
              }
            />
          ))}
        </View>
      </ScrollView>

      {/* Disconnect Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.7)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
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
              className={`btn-modal-disconnect ${loading ? "opacity-70" : ""}`}
              disabled={loading}
            >
              <Text className="text-white font-medium text-lg font-inter">
                {loading ? "Disconnecting..." : "Disconnect account"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              disabled={loading}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                width: "100%",
                height: 52,
                borderRadius: 13,
                alignItems: "center",
                justifyContent: "center",
                opacity: loading ? 0.7 : 1,
              }}
            >
              <Text className="text-white font-medium text-lg font-inter">
                Go Back
              </Text>
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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.7)",
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
            }}
          >
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
                <View
                  style={{
                    width: 100,
                    height: 100,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <BlurView
                    intensity={5}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 50,
                      overflow: "hidden",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Svg width={90} height={90}>
                      <Defs>
                        <SvgLinearGradient
                          id="editProfileGrad"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                          <Stop
                            offset="50%"
                            stopColor="#000000"
                            stopOpacity="1"
                          />
                          <Stop
                            offset="100%"
                            stopColor="#FFFFFF"
                            stopOpacity="1"
                          />
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
                    source={
                      image
                        ? {
                          uri:
                            image.startsWith("http") ||
                              image.startsWith("file") ||
                              image.startsWith("data:")
                              ? image
                              : `data:image/png;base64,${image}`,
                        }
                        : require("../../assets/images/avtar.png")
                    }
                    className="w-[82px] h-[82px] absolute rounded-full"
                    resizeMode={image ? "cover" : "contain"}
                  />
                </View>
              </View>

              {/* Upload New Button */}
              <BlurView
                intensity={14}
                tint="dark"
                className="upload-container w-full h-[68px]"
              >
                <TouchableOpacity
                  className="upload-content w-full h-full"
                  onPress={pickImage}
                >
                  <Upload size={20} color="white" />
                  <Text className="text-white font-medium text-[16px] font-inter mt-2">
                    Upload new
                  </Text>
                </TouchableOpacity>
              </BlurView>

              {/* Username Input */}
              <View className="w-full mb-8">
                <Text className="text-white font-semibold text-base mb-2 font-inter">
                  User name
                </Text>
                <BlurView
                  intensity={14}
                  tint="dark"
                  className="rounded-[16px] overflow-hidden"
                >
                  <View className="input-field justify-center">
                    <TextInput
                      value={username}
                      onChangeText={setUsername}
                      placeholder="Enter username"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      className="flex-1 font-inter py-0 text-white"
                      style={{ fontFamily: "Inter_400Regular" }}
                      textAlignVertical="center"
                    />
                  </View>
                </BlurView>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                onPress={handleSaveProfile}
                className={`btn-save ${loading ? "opacity-70" : ""}`}
                disabled={loading}
              >
                <Text className="text-white font-medium text-lg">
                  {loading ? "Saving..." : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View className="stat-item flex-1 min-w-[45%]">
      <Text className="stat-item-label">{label}</Text>
      <Text
        style={{ fontFamily: "Questrial_400Regular" }}
        className="text-white text-[34px] leading-[34px] tracking-[0px] mt-1"
      >
        {value}
      </Text>
    </View>
  );
}

function ConnectedAccountItem({
  icon,
  name,
  status,
  connectedUsername,
  isConnected,
  isConnecting,
  onConnect,
  onDisconnect,
}: {
  icon: any;
  name: string;
  status: string;
  connectedUsername?: string | null;
  isConnected: boolean;
  isConnecting?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
}) {
  const handlePress = () => {
    if (isConnecting) return;
    if (isConnected) {
      onDisconnect?.();
    } else {
      onConnect?.();
    }
  };

  return (
    <View className="connected-account-card">
      <View className="flex-row items-center gap-4">
        <View className="w-12 h-12 items-center justify-center mb-6">
          <Image
            source={icon}
            className="w-[36px] h-[36px]"
            resizeMode="contain"
          />
        </View>
        <View>
          <Text className="platform-card-name">{name}</Text>
          <View className="flex-row items-start mt-1">
            <View
              className={`w-2.5 h-2.5 rounded-full mr-3 mt-1.5 ${isConnected ? "bg-[#11B259]" : "bg-red-500"}`}
            />
            <View>
              <Text className="text-white/60 font-inter text-[13px]">
                {isConnected && connectedUsername ? "Connected to" : status}
              </Text>
              {isConnected && connectedUsername && (
                <Text className="text-white/80 font-inter text-[13px] font-medium mt-0.5 tracking-tight">
                  {`@${connectedUsername}`}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={handlePress}
        disabled={isConnecting}
        className={`btn-toggle ${isConnected ? "btn-toggle-disconnect" : "btn-toggle-connect"} ${isConnecting ? "opacity-70" : ""}`}
      >
        <View className="flex-row items-center gap-1">
          {/* Fixed 14×14 slot — matches icon size so button never resizes */}
          <View
            style={{
              width: 14,
              height: 14,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isConnecting ? (
              <ActivityIndicator
                size="small"
                color="#ffffff"
                style={{ transform: [{ scale: 0.6 }] }}
              />
            ) : isConnected ? (
              <Image
                source={require("../../assets/icons/disconnect.png")}
                style={{ width: 14, height: 14 }}
                resizeMode="contain"
              />
            ) : (
              <Image
                source={require("../../assets/icons/connect.png")}
                style={{ width: 14, height: 14 }}
                resizeMode="contain"
              />
            )}
          </View>
          <Text className="btn-toggle-label">
            {isConnected ? "Disconnect" : "Connect"}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
