import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { ResizeMode, Video } from "expo-av";
import { BlurView } from "expo-blur";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import { Image as ExpoImage } from "expo-image";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { Maximize, Minimize, Plus, Upload, X } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  AppState,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  NativeEventEmitter,
  NativeModules,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from "react-native";
import {
  Video as CompressorVideo,
  getFileSize as compressorGetFileSize,
  getRealPath as compressorGetRealPath,
} from "react-native-compressor";
import { DraggableGrid } from "react-native-draggable-grid";
import ImageCropPicker from "react-native-image-crop-picker";
import Svg, {
  Circle,
  Defs,
  Stop,
  LinearGradient as SvgLinearGradient,
} from "react-native-svg";
import Toast from "react-native-toast-message";
import { showEditor } from "react-native-video-trim";
import { useSelector } from "react-redux";
import Header from "../../components/common/Header";
import { useNotification } from "../../context/NotificationContext";
import createPostService from "../../services/api/createPost";
import poppyService from "../../services/api/poppy";
import { listenToUserData } from "../../services/firebase";
import storageService from "../../services/storage";
import {
  type PreviewData,
  consumePreviewPostSuccessReset,
  setPreviewData,
} from "../../store/previewStore";
import { RootState } from "../../store/store";

const captionModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.72)",
  },
  card: {
    width: "90%",
    maxWidth: 500,
    height: 420,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 14,
    elevation: 14,
  },
  cardInner: {
    flex: 1,
    borderRadius: 23,
    overflow: "hidden",
  },
  textInput: {
    flex: 1,
    color: "white",
    fontSize: 15,
    fontFamily: "Inter",
    padding: 20,
    textAlignVertical: "top",
  },
  collapseBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  saveBtn: {
    backgroundColor: "white",
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 30,
  },
  saveBtnText: {
    color: "black",
    fontWeight: "600",
    fontSize: 14,
  },
  iconRow: {
    flexDirection: "row",
    gap: 12,
  },
  iconBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
});

const coverModalStyles = StyleSheet.create({
  card: {
    width: "90%",
    maxWidth: 500,
    height: "85%",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 14,
    elevation: 14,
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  closeBtn: {
    position: "absolute",
    left: 20,
    width: 27,
    height: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter",
  },
  previewContainer: {
    width: 242,
    height: 444,
    position: "absolute",
    top: 56,
    alignSelf: "center",
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  bottomSection: {
    padding: 20,
    alignItems: "center",
  },
  filmStrip: {
    width: "100%",
    height: 60,
    backgroundColor: "#1C1C1C",
    borderRadius: 16,
    marginBottom: 20,
    paddingHorizontal: 2,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  uploadText: {
    color: "white",
    fontSize: 14,
    fontFamily: "Inter",
  },
  uploadLink: {
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  doneBtn: {
    width: "100%",
    height: 48,
    backgroundColor: "white",
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  doneBtnText: {
    color: "black",
    fontSize: 16,
    fontWeight: "600",
  },
});
const isVideoUrl = (url?: string | null) => {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.endsWith(".mp4") ||
    lower.endsWith(".mov") ||
    lower.startsWith("data:video")
  );
};

const INITIAL_TAB_DATA = {
  Post: {
    postType: "Single",
    singleCaption: "",
    singleTags: [] as string[],
    carouselCaption: "",
    carouselTags: [] as string[],
    selectedPlatforms: {
      instagram: false,
      tiktok: false,
      youtube: false,
      snapchat: false,
      x: false,
      facebook: false,
    } as Record<string, boolean>,
    date: null as Date | null,
    singleMedia: null as string | null,
    carouselMedia: null as string[] | null,
    media: null,
  },
  Reel: {
    postType: "Single",
    caption: "",
    selectedPlatforms: {
      instagram: false,
      tiktok: false,
      youtube: false,
      snapchat: false,
      x: false,
      facebook: false,
    } as Record<string, boolean>,
    date: null as Date | null,
    media: null as string | null,
    cover_img: null as string | null,
    thumbNailOffset: 0 as number,
    tags: [] as string[],
  },
  Story: {
    postType: "Single", // Single=Photo, Carousel=Video
    caption: "",
    selectedPlatforms: {
      instagram: false,
      tiktok: false,
      youtube: false,
      snapchat: false,
      x: false,
      facebook: false,
    } as Record<string, boolean>,
    date: null as Date | null,
    photoMedia: null as string | null,
    videoMedia: null as string | null,
    tags: [] as string[],
  },
};

interface SocialMediaData {
  [key: string]: string[] | undefined;
}

export default function CreatePost() {
  const [activeTab, setActiveTab] = useState("Post");
  const { width } = useWindowDimensions();
  const { addNotification } = useNotification();
  const scrollViewRef = useRef<ScrollView>(null);

  // Get user email from Redux
  const globalEmail = useSelector((state: RootState) => state.user.email);
  const globalUserName = useSelector((state: RootState) => state.user.userName);
  const globalProfilePicture = useSelector(
    (state: RootState) => state.user.profilePicture,
  );

  // Social media connections state
  const [socialMediaData, setSocialMediaData] = useState<SocialMediaData>({});

  // Fetch connected social media accounts from Firebase
  useEffect(() => {
    if (!globalEmail) {
      return;
    }

    const unsubscribe = listenToUserData(
      globalEmail,
      (userData) => {
        if (userData) {
          const socialData: SocialMediaData = {};
          const platformKeys = [
            "instagram",
            "tiktok",
            "youtube",
            "snapchat",
            "twitter",
            "facebook",
          ];
          platformKeys.forEach((key) => {
            const data = userData[key];
            if (data && Array.isArray(data) && data.length > 0) {
              socialData[key] = data;
            }
          });
          setSocialMediaData(socialData);
        }
      },
      (error) => {
        console.error("Firebase listener error in createPost:", error);
      },
    );

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [globalEmail]);

  // Scroll to top whenever this screen comes into focus
  useFocusEffect(
    useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });

      if (consumePreviewPostSuccessReset()) {
        setTabData(INITIAL_TAB_DATA);
        setTagInputText("");
        setCoverDurationMs(0);
        setScrubberPositionMs(0);
        coverDurationMsRef.current = 0;
        scrubberPositionMsRef.current = 0;
      }
    }, []),
  );
  const tabs = ["Post", "Reel", "Story"];

  // The available width for the carousel is screen width minus outer horizontal padding:
  // px-5 (20px) + glass-card-gradient (20px) = 40px on each side = 80px total.
  const containerWidth = width - 80;
  // We want 4px space on all sides of each image.
  // Each item-slot (1/3 of container) will have 4px padding.
  const paddingEdge = 4;
  const itemWidth = containerWidth / 3;

  // Instagram-accurate preview dimensions for single media
  // Post Single: 4:5 portrait | Reel: 9:16 | Story: 9:16
  const isReelOrStory = activeTab === "Reel" || activeTab === "Story";
  const previewWidth = containerWidth * (isReelOrStory ? 0.42 : 0.38);
  const previewHeight = isReelOrStory
    ? previewWidth * (16 / 9) // 9:16 tall
    : previewWidth * (5 / 4); // 4:5 portrait

  // Tab Data State
  const [tabData, setTabData] = useState(INITIAL_TAB_DATA);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCaptionModal, setShowCaptionModal] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [tagInputText, setTagInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [videoResizeMode, setVideoResizeMode] = useState<ResizeMode>(
    ResizeMode.CONTAIN,
  );
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const lastResultIndex = useRef<number>(0);
  const lastProcessedResult = useRef<number>(0);
  const activeTabRef = useRef(activeTab);
  const postTypeRef = useRef<string>("Single");
  const appStateRef = useRef(AppState.currentState);
  const publishInterruptedByBackgroundRef = useRef(false);

  // Cover scrubber — all mutable values in refs so PanResponder never has stale closures
  const coverVideoRef = useRef<any>(null);
  const thumbVideoRef = useRef<any>(null);
  const coverDurationMsRef = useRef(0);
  const scrubberPositionMsRef = useRef(0);
  const dragStartPositionMsRef = useRef(0);
  const isSeekingRef = useRef(false); // prevent concurrent seeks
  const [coverDurationMs, setCoverDurationMs] = useState(0);
  const [scrubberPositionMs, setScrubberPositionMs] = useState(0);
  const filmStripWidth = useRef(0);
  const SELECTOR_WIDTH = 76;

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      const movingToBackground =
        nextState === "background" || nextState === "inactive";

      if (
        isPublishing &&
        appStateRef.current === "active" &&
        movingToBackground
      ) {
        publishInterruptedByBackgroundRef.current = true;
      }

      appStateRef.current = nextState;
    });

    return () => subscription.remove();
  }, [isPublishing]);

  // Safe seek: silently skips if a seek is already in flight
  const safeSeek = (ms: number) => {
    if (!coverVideoRef.current || isSeekingRef.current) return;
    isSeekingRef.current = true;

    const promises = [coverVideoRef.current.setPositionAsync(ms)];
    if (thumbVideoRef.current) {
      promises.push(thumbVideoRef.current.setPositionAsync(ms));
    }

    Promise.all(promises)
      .catch(() => {}) // suppress "Seeking interrupted"
      .finally(() => {
        isSeekingRef.current = false;
      });
  };

  const scrubberPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      // Snap selector to tapped position
      onPanResponderGrant: (e) => {
        const stripW = filmStripWidth.current;
        const dur = coverDurationMsRef.current;
        if (!stripW || !dur) return;
        const maxX = stripW - SELECTOR_WIDTH;
        const touchX = e.nativeEvent.locationX;
        const newX = Math.max(0, Math.min(maxX, touchX - SELECTOR_WIDTH / 2));
        const newMs = (newX / maxX) * dur;
        scrubberPositionMsRef.current = newMs;
        dragStartPositionMsRef.current = newMs;
        setScrubberPositionMs(newMs);
        safeSeek(newMs);
      },
      // Smooth drag
      onPanResponderMove: (_, gs) => {
        const stripW = filmStripWidth.current;
        const dur = coverDurationMsRef.current;
        if (!stripW || !dur) return;
        const maxX = stripW - SELECTOR_WIDTH;
        const startX = (dragStartPositionMsRef.current / dur) * maxX;
        const newX = Math.max(0, Math.min(maxX, startX + gs.dx));
        const newMs = (newX / maxX) * dur;
        scrubberPositionMsRef.current = newMs;
        setScrubberPositionMs(newMs);
        safeSeek(newMs); // skips if previous seek not done yet
      },
      // Final precise sync on release based on AV player's actual rest position
      onPanResponderRelease: async () => {
        isSeekingRef.current = false;
        if (!coverVideoRef.current) return;
        try {
          // Force the actual native module to report back where it stopped
          const status = await coverVideoRef.current.getStatusAsync();
          if (status.isLoaded && typeof status.positionMillis === "number") {
            const actualMs = status.positionMillis;
            scrubberPositionMsRef.current = actualMs;
            setScrubberPositionMs(actualMs);
            if (thumbVideoRef.current) {
              thumbVideoRef.current.setPositionAsync(actualMs).catch(() => {});
            }
          } else {
            // Fallback just in case getStatus fails
            safeSeek(scrubberPositionMsRef.current);
          }
        } catch (e) {
          safeSeek(scrubberPositionMsRef.current);
        }
      },
      onPanResponderTerminate: () => {
        isSeekingRef.current = false;
      },
    }),
  ).current;

  // Update refs when tab or postType changes
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  // Derived State for Active Tab
  const activeData = tabData[activeTab as keyof typeof tabData];
  const { postType, selectedPlatforms, date, media, tags, thumbNailOffset } =
    activeData as any;
  const cover_img = (activeData as any).cover_img;

  // Update postType ref
  useEffect(() => {
    postTypeRef.current = postType;
  }, [postType]);

  // caption & tags are per-postType for Post, shared for Reel/Story
  const caption =
    activeTab === "Post"
      ? postType === "Single"
        ? (activeData as any).singleCaption
        : (activeData as any).carouselCaption
      : (activeData as any).caption;

  const activeTags: string[] =
    activeTab === "Post"
      ? postType === "Single"
        ? (activeData as any).singleTags
        : (activeData as any).carouselTags
      : ((activeData as any).tags ?? []);

  let currentMedia = media;
  if (activeTab === "Post") {
    currentMedia =
      postType === "Single"
        ? (activeData as any).singleMedia
        : (activeData as any).carouselMedia;
  } else if (activeTab === "Story") {
    currentMedia =
      postType === "Single"
        ? (activeData as any).photoMedia
        : (activeData as any).videoMedia;
  }

  // Setters
  const updateActiveTab = (key: string, value: any) => {
    setTabData((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  const setPostType = (value: string) => updateActiveTab("postType", value);
  const setCaption = (value: string | ((prev: string) => string)) => {
    const currentTab = activeTabRef.current;
    const currentPostType = postTypeRef.current;

    // Get current caption value
    const getCurrentCaption = () => {
      const data = tabData[currentTab as keyof typeof tabData];
      if (currentTab === "Post") {
        return currentPostType === "Single"
          ? (data as any).singleCaption
          : (data as any).carouselCaption;
      } else {
        return (data as any).caption;
      }
    };

    const newValue =
      typeof value === "function" ? value(getCurrentCaption()) : value;

    if (currentTab === "Post") {
      const key =
        currentPostType === "Single" ? "singleCaption" : "carouselCaption";
      setTabData((prev) => ({
        ...prev,
        Post: {
          ...prev.Post,
          [key]: newValue,
        },
      }));
    } else if (currentTab === "Reel") {
      setTabData((prev) => ({
        ...prev,
        Reel: {
          ...prev.Reel,
          caption: newValue,
        },
      }));
    } else if (currentTab === "Story") {
      setTabData((prev) => ({
        ...prev,
        Story: {
          ...prev.Story,
          caption: newValue,
        },
      }));
    }
  };

  // Pulse animation for mic button while listening
  useEffect(() => {
    if (isListening) {
      pulseAnim.setValue(1);
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => {
        pulse.stop();
        pulseAnim.setValue(1);
      };
    } else {
      pulseAnim.stopAnimation(() => {
        pulseAnim.setValue(1);
      });
    }
  }, [isListening]);

  // Event: Process speech results
  useSpeechRecognitionEvent("result", (event) => {
    if (isListening) {
      let interim = "";
      let final = "";

      const startIdx = Math.max(0, lastProcessedResult.current);

      for (let i = startIdx; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result?.transcript || "";

        if (text) {
          if ((result as any).isFinal === true) {
            final += text;
            lastProcessedResult.current = i + 1;
          } else {
            interim += text;
          }
        }
      }

      setCaption((prev) => {
        const base = prev.substring(0, lastResultIndex.current);

        if (final) {
          const sep = base && base.trim() ? " " : "";
          const newText = base + sep + final;
          lastResultIndex.current = newText.length;
          return newText;
        } else if (interim) {
          const sep = base && base.trim() && interim.trim() ? " " : "";
          return base + sep + interim;
        }

        return prev;
      });
    }
  });

  // Event: Recognition ended
  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
  });

  // Event: Error occurred
  useSpeechRecognitionEvent("error", (event) => {
    Alert.alert("Error", event.error || "Speech recognition failed");
    setIsListening(false);
  });

  const startListening = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { status } =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission Required", "Please enable microphone access");
        return;
      }

      await ExpoSpeechRecognitionModule.start({
        lang: Platform.OS === "ios" ? "en-US" : undefined,
        interimResults: true,
        maxAlternatives: 1,
        continuous: true,
        requiresOnDeviceRecognition: Platform.OS === "ios",
        addsPunctuation: true,
        contextualStrings: [],
      });

      setIsListening(true);
      lastResultIndex.current = caption.length;
      lastProcessedResult.current = 0;
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to start recording");
    }
  };

  const stopListening = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await ExpoSpeechRecognitionModule.stop();
      setIsListening(false);
      lastResultIndex.current = caption.length;
      lastProcessedResult.current = 0;
    } catch (error) {
      console.log("Stop Voice Error:", error);
      setIsListening(false);
    }
  };

  // Stop speech recognition when switching tabs
  useEffect(() => {
    if (isListening) {
      stopListening();
    }
  }, [activeTab]);

  const handleAddTag = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const trimmed = tagInputText.trim();
    const tagKey =
      activeTab === "Post"
        ? postType === "Single"
          ? "singleTags"
          : "carouselTags"
        : "tags";
    if (trimmed && activeTags && !activeTags.includes(trimmed)) {
      updateActiveTab(tagKey, [...activeTags, trimmed]);
      setTagInputText("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const tagKey =
      activeTab === "Post"
        ? postType === "Single"
          ? "singleTags"
          : "carouselTags"
        : "tags";
    updateActiveTab(
      tagKey,
      activeTags.filter((t: string) => t !== tagToRemove),
    );
  };

  // AI Caption Generation Handler
  const handleGenerateCaption = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!caption.trim()) {
      Toast.show({
        type: "error",
        text1: "Caption Required",
        text2: "Please enter a caption prompt first",
      });
      return;
    }

    try {
      setIsGeneratingCaption(true);
      const token = await storageService.getToken();

      if (!token) {
        Toast.show({
          type: "error",
          text1: "Authentication Error",
          text2: "Please login again",
        });
        return;
      }

      // Determine if it's a reel
      const isReel = activeTab === "Reel";

      const generatedCaption = await poppyService.generateCaption(
        caption,
        isReel,
        token,
      );

      // Update caption with generated content
      setCaption(generatedCaption);

      addNotification({
        type: "success",
        title: "Caption Generated",
        message: `AI caption generated for your ${activeTab}.`,
      });
      Toast.show({
        type: "success",
        text1: "Caption Generated",
        text2: "AI caption generated successfully",
      });

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error("Caption generation error:", error);
      addNotification({
        type: "error",
        title: "Caption Generation Failed",
        message: "Failed to generate caption. Please try again.",
      });
      Toast.show({
        type: "error",
        text1: "Generation Failed",
        text2: "Failed to generate caption. Please try again.",
      });
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const waitForAppToBecomeActive = () =>
    new Promise<void>((resolve) => {
      if (appStateRef.current === "active") {
        resolve();
        return;
      }

      const resumeSubscription = AppState.addEventListener(
        "change",
        (nextState) => {
          appStateRef.current = nextState;
          if (nextState === "active") {
            resumeSubscription.remove();
            resolve();
          }
        },
      );
    });

  const handleGeneratePost = async (isRetryAfterBackground = false) => {
    if (!isRetryAfterBackground) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (
      !currentMedia ||
      (Array.isArray(currentMedia) && currentMedia.length === 0)
    ) {
      Toast.show({
        type: "error",
        text1: "Media Required",
        text2: "Please attach media before generating post",
      });
      return;
    }

    if (!caption.trim() && activeTab !== "Story") {
      Toast.show({
        type: "error",
        text1: "Caption Required",
        text2: "Please enter a caption before posting",
      });
      return;
    }

    const activePlatformsCheck = Object.values(selectedPlatforms).some(
      (isSelected) => isSelected,
    );
    if (!activePlatformsCheck) {
      Toast.show({
        type: "error",
        text1: "Platform Required",
        text2: "Please select at least one platform",
      });
      return;
    }

    try {
      publishInterruptedByBackgroundRef.current = false;
      if (!isRetryAfterBackground) {
        setIsPublishing(true);
      }
      const token = await storageService.getToken();

      if (!token) {
        Toast.show({
          type: "error",
          text1: "Authentication Error",
          text2: "Please login again",
        });
        return;
      }

      const isCarousel = Array.isArray(currentMedia);

      const getFileSizeInMB = async (uri: string) => {
        const parseBytesToMB = (bytesValue: unknown) => {
          const bytesNum = Number(bytesValue);
          if (!Number.isFinite(bytesNum) || bytesNum <= 0) {
            return null;
          }
          return bytesNum / (1024 * 1024);
        };

        try {
          const fileInfo = await FileSystem.getInfoAsync(uri);
          if (!fileInfo.exists || fileInfo.size === undefined) {
            console.log("[UploadDebug] File info missing", { uri });
          } else {
            const sizeMB = parseBytesToMB(fileInfo.size);
            if (sizeMB) {
              console.log("[UploadDebug] File size fetched", {
                uri,
                sizeMB: Number(sizeMB.toFixed(2)),
                source: "expo-file-system",
              });
              return sizeMB;
            }
          }
        } catch (error) {
          console.log("[UploadDebug] File size fetch failed", { uri });
          console.log("[UploadDebug] File size fetch error detail", {
            uri,
            error,
          });
        }

        try {
          const realPath = await compressorGetRealPath(uri, "video").catch(
            () => uri,
          );
          const sizeBytes = await compressorGetFileSize(realPath);
          const sizeMB = parseBytesToMB(sizeBytes);
          if (sizeMB) {
            console.log("[UploadDebug] File size fetched", {
              uri,
              realPath,
              sizeMB: Number(sizeMB.toFixed(2)),
              source: "react-native-compressor",
            });
            return sizeMB;
          }
        } catch (error) {
          console.log("[UploadDebug] Compressor file size fetch failed", {
            uri,
            error,
          });
        }

        return null;
      };

      const normalizeMediaUri = (uri: string) => {
        if (
          uri.startsWith("file://") ||
          uri.startsWith("content://") ||
          uri.startsWith("ph://") ||
          uri.startsWith("assets-library://")
        ) {
          return uri;
        }
        return `file://${uri}`;
      };

      const ensureLocalFileUri = async (uri: string) => {
        if (
          uri.startsWith("data:") ||
          uri.startsWith("http://") ||
          uri.startsWith("https://")
        ) {
          return uri;
        }

        if (uri.startsWith("file://")) {
          return uri;
        }

        try {
          const maybeRealPath = await compressorGetRealPath(uri, "video").catch(
            () => uri,
          );
          const sourceUri = normalizeMediaUri(maybeRealPath || uri);
          const ext = sourceUri.split(".").pop()?.toLowerCase() || "mp4";
          const baseDir =
            (FileSystem as any).Paths?.cache?.uri ||
            (FileSystem as any).cacheDirectory ||
            (FileSystem as any).documentDirectory ||
            "file:///tmp/";
          const localUri = `${baseDir}upload-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          await FileSystem.copyAsync({ from: sourceUri, to: localUri });
          console.log("[UploadDebug] Local file prepared", {
            originalUri: uri,
            sourceUri,
            localUri,
          });
          return localUri;
        } catch {
          const fallbackUri = normalizeMediaUri(uri);
          console.log("[UploadDebug] Local file prepare fallback", {
            originalUri: uri,
            fallbackUri,
          });
          return fallbackUri;
        }
      };

      const compressVideoIfNeeded = async (mediaItem: string) => {
        const localMediaUri = await ensureLocalFileUri(mediaItem);
        const isVideoMedia =
          isVideoUrl(localMediaUri) ||
          isVideoUrl(mediaItem) ||
          (activeTab === "Story" && postType === "Carousel") ||
          activeTab === "Reel";

        console.log("[UploadDebug] Compression check", {
          activeTab,
          postType,
          mediaItem,
          localMediaUri,
          isVideoMedia,
        });

        if (!localMediaUri.startsWith("file://") || !isVideoMedia) {
          return mediaItem;
        }

        const maxSizeMB = activeTab === "Story" ? 100 : 300;
        const targetSizeMB = activeTab === "Story" ? 95 : 290;
        const initialSizeMB = await getFileSizeInMB(localMediaUri);

        const shouldForceCompression = activeTab === "Story" && isVideoMedia;

        if (initialSizeMB && initialSizeMB <= maxSizeMB) {
          console.log("[UploadDebug] Compression skipped (under threshold)", {
            localMediaUri,
            initialSizeMB,
            maxSizeMB,
          });
          return localMediaUri;
        }

        if (!initialSizeMB && !shouldForceCompression) {
          console.log("[UploadDebug] Compression skipped (size unknown)", {
            localMediaUri,
            activeTab,
            postType,
          });
          return localMediaUri;
        }

        if (!initialSizeMB && shouldForceCompression) {
          console.log(
            "[UploadDebug] Forcing Story video compression because size is unknown",
            {
              localMediaUri,
              maxSizeMB,
              targetSizeMB,
            },
          );
        }

        Toast.show({
          type: "info",
          text1: "Compressing Video",
          text2: `Video is larger than ${maxSizeMB}MB. Optimizing before upload...`,
        });

        let compressedUri = localMediaUri;
        let currentSizeMB = initialSizeMB ?? Number.MAX_SAFE_INTEGER;
        const maxSizeSteps = [1280, 960, 720];

        for (const maxSize of maxSizeSteps) {
          if (currentSizeMB <= targetSizeMB) {
            break;
          }

          const nextUri = await CompressorVideo.compress(compressedUri, {
            compressionMethod: "auto",
            maxSize,
          });

          compressedUri = normalizeMediaUri(nextUri);
          const nextSizeMB = await getFileSizeInMB(compressedUri);
          console.log("[UploadDebug] Compression step", {
            maxSize,
            previousSizeMB: currentSizeMB,
            nextSizeMB,
            compressedUri,
          });
          if (!nextSizeMB || nextSizeMB >= currentSizeMB) {
            break;
          }
          currentSizeMB = nextSizeMB;
        }

        const finalSizeMB = await getFileSizeInMB(compressedUri);
        console.log("[UploadDebug] Compression result", {
          localMediaUri,
          compressedUri,
          initialSizeMB,
          finalSizeMB,
          maxSizeMB,
          targetSizeMB,
        });

        if (!finalSizeMB || finalSizeMB > maxSizeMB) {
          throw new Error(
            `Compression did not produce valid reduced file. initial=${initialSizeMB}, final=${finalSizeMB}`,
          );
        }

        if (initialSizeMB && finalSizeMB >= initialSizeMB) {
          throw new Error(
            `Compression did not produce valid reduced file. initial=${initialSizeMB}, final=${finalSizeMB}`,
          );
        }

        return compressedUri;
      };

      const processMediaForUpload = async (mediaItem: string) => {
        const processedMediaItem = await compressVideoIfNeeded(mediaItem);

        if (processedMediaItem.startsWith("data:")) {
          return processedMediaItem; // Probably still base64 for images
        }
        if (
          processedMediaItem.startsWith("file://") ||
          processedMediaItem.startsWith("content://") ||
          processedMediaItem.startsWith("ph://") ||
          processedMediaItem.startsWith("assets-library://")
        ) {
          const ext =
            processedMediaItem.split(".").pop()?.toLowerCase() || "jpg";
          const isVideo =
            isVideoUrl(processedMediaItem) ||
            isVideoUrl(mediaItem) ||
            (activeTab === "Story" && postType === "Carousel") ||
            activeTab === "Reel";
          let mimeType = "image/jpeg";
          if (isVideo) {
            mimeType = ext === "mov" ? "video/quicktime" : "video/mp4";
          } else if (ext === "png") {
            mimeType = "image/png";
          } else if (ext === "webp") {
            mimeType = "image/webp";
          }
          const rawName = processedMediaItem.split("/").pop() || "";
          const fileName = rawName.includes(".")
            ? rawName
            : isVideo
              ? "upload.mp4"
              : `upload.${ext}`;

          return {
            uri: processedMediaItem,
            type: mimeType,
            name: fileName,
          } as any;
        }
        return processedMediaItem;
      };

      let mediaPayload: any | any[] = "";
      if (isCarousel) {
        mediaPayload = await Promise.all(
          (currentMedia as unknown as string[]).map(processMediaForUpload),
        );
      } else {
        mediaPayload = await processMediaForUpload(currentMedia as string);
      }

      console.log("[UploadDebug] Final media payload prepared", {
        activeTab,
        isCarousel,
        payload: mediaPayload,
      });

      const activePlatforms = Object.entries(selectedPlatforms)
        .filter(([_, isSelected]) => isSelected)
        .map(([platform]) => platform);

      // Build platform names for notification
      const platformNameMap: Record<string, string> = {
        instagram: "Instagram",
        tiktok: "TikTok",
        youtube: "YouTube",
        snapchat: "Snapchat",
        x: "X",
        twitter: "Twitter",
        facebook: "Facebook",
      };
      const platformNames = activePlatforms
        .map((p) => platformNameMap[p] || p)
        .join(", ");
      const contentType =
        activeTab === "Reel"
          ? "Reel"
          : activeTab === "Story"
            ? "Story"
            : isCarousel
              ? "Carousel Post"
              : "Post";

      if (activeTab === "Reel") {
        await createPostService.createReel(
          caption,
          activeTags,
          activePlatforms,
          !date,
          mediaPayload as any,
          date,
          thumbNailOffset || 0,
        );
      } else if (activeTab === "Story") {
        const email = await storageService.getEmail();
        await createPostService.createStory(
          email || "",
          activePlatforms,
          !date,
          mediaPayload as any,
        );
      } else if (activeTab === "Post" && isCarousel) {
        await createPostService.createCarousel(
          caption,
          activeTags,
          activePlatforms,
          Array.isArray(mediaPayload) ? mediaPayload : [mediaPayload],
        );
      } else {
        await createPostService.createPost(
          caption,
          activeTags,
          activePlatforms,
          !date,
          isCarousel,
          mediaPayload,
          date,
        );
      }

      addNotification({
        type: "success",
        title: `${contentType} Created`,
        message: `Your ${contentType.toLowerCase()} has been published to ${platformNames}.`,
      });
      Toast.show({
        type: "success",
        text1: `${contentType} Created`,
        text2: `Published to ${platformNames}`,
      });

      // Clear all fields upon successful publish
      setTabData(INITIAL_TAB_DATA);
      setTagInputText("");
      setCoverDurationMs(0);
      setScrubberPositionMs(0);
      coverDurationMsRef.current = 0;
      scrubberPositionMsRef.current = 0;
    } catch (error) {
      console.error("Post generation error:", error);

      const isBackgroundInterruptedNetworkError =
        publishInterruptedByBackgroundRef.current &&
        axios.isAxiosError(error) &&
        !error.response;

      if (isBackgroundInterruptedNetworkError) {
        if (!isRetryAfterBackground) {
          addNotification({
            type: "neutral",
            title: "Upload Paused",
            message:
              "Upload paused while app was in background. Resuming automatically.",
          });
          Toast.show({
            type: "info",
            text1: "Upload Paused",
            text2: "Resuming when app becomes active...",
          });

          await waitForAppToBecomeActive();
          publishInterruptedByBackgroundRef.current = false;
          await handleGeneratePost(true);
          return;
        }

        addNotification({
          type: "neutral",
          title: "Upload Interrupted",
          message:
            "Upload was interrupted because the app moved to background. Keep app open until posting completes.",
        });
        Toast.show({
          type: "error",
          text1: "Upload Interrupted",
          text2: "Keep app open until upload is complete.",
        });
        return;
      }

      if (
        error instanceof Error &&
        error.message.includes("Compression did not produce valid reduced file")
      ) {
        Toast.show({
          type: "error",
          text1: "Video Compression Failed",
          text2:
            "Could not prepare reduced video URL. Please try a different file.",
        });
      }
      addNotification({
        type: "error",
        title: `${activeTab} Creation Failed`,
        message: `Failed to create ${activeTab.toLowerCase()}. Please try again.`,
      });
      Toast.show({
        type: "error",
        text1: `${activeTab} Creation Failed`,
        text2: `Failed to create ${activeTab.toLowerCase()}. Please try again.`,
      });
    } finally {
      publishInterruptedByBackgroundRef.current = false;
      if (!isRetryAfterBackground) {
        setIsPublishing(false);
      }
    }
  };

  const handlePreviewPost = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (
      !currentMedia ||
      (Array.isArray(currentMedia) && currentMedia.length === 0)
    ) {
      Toast.show({
        type: "error",
        text1: "Media Required",
        text2: "Please attach media before previewing",
      });
      return;
    }

    if (!caption.trim() && activeTab !== "Story") {
      Toast.show({
        type: "error",
        text1: "Caption Required",
        text2: "Please enter a caption before previewing",
      });
      return;
    }

    const activePlatformsCheck = Object.values(selectedPlatforms).some(
      (isSelected) => isSelected,
    );
    if (!activePlatformsCheck) {
      Toast.show({
        type: "error",
        text1: "Platform Required",
        text2: "Please select at least one platform",
      });
      return;
    }

    const nextVideoResizeMode: "cover" | "contain" =
      videoResizeMode === ResizeMode.COVER ? "cover" : "contain";

    const previewPayload: PreviewData = {
      activeTab,
      postType,
      currentMedia,
      caption,
      activeTags,
      selectedPlatforms,
      date,
      thumbNailOffset,
      videoResizeMode: nextVideoResizeMode,
      instagramUsername:
        Array.isArray(socialMediaData.instagram) &&
        socialMediaData.instagram.length >= 3
          ? socialMediaData.instagram[2]
          : socialMediaData.instagram?.[0],
    };

    setPreviewData(previewPayload);
    router.push({
      pathname: "/postPreview",
      params: {
        previewData: JSON.stringify({
          ...previewPayload,
          date: previewPayload.date ? previewPayload.date.toISOString() : null,
        }),
      },
    });
  };

  const setDate = (value: Date | null) => updateActiveTab("date", value);

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }

    if (Platform.OS === "android") {
      setShowDatePicker(false);
      if (selectedDate) {
        setDate(selectedDate);
      }
    } else {
      if (selectedDate) {
        setDate(selectedDate);
      }
    }
  };

  const togglePlatform = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newPlatforms = {
      ...selectedPlatforms,
      [id]: !selectedPlatforms[id],
    };
    updateActiveTab("selectedPlatforms", newPlatforms);
  };

  // Helper function to crop image with specified aspect ratio
  const cropImage = async (
    imageUri: string,
    width: number,
    height: number,
  ): Promise<string | null> => {
    try {
      // Wait for iOS to fully dismiss the previous picker modal
      // before presenting the cropper view controller
      if (Platform.OS === "ios") {
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
      const result = await ImageCropPicker.openCropper({
        path: imageUri,
        width,
        height,
        mediaType: "photo",
        includeBase64: false,
        forceJpg: true,
      });
      return result.path;
    } catch (error: any) {
      if (
        error?.code === "E_PICKER_CANCELLED" ||
        error?.message?.includes("cancelled") ||
        error?.message?.includes("canceled")
      ) {
        return null;
      }
      console.error("Image cropping error:", error);
      Toast.show({
        type: "error",
        text1: "Crop Failed",
        text2: "Unable to crop image. Using original.",
      });
      return imageUri;
    }
  };

  const trimVideo = (
    videoUri: string,
    maxDuration: number = 60,
  ): Promise<string> => {
    return new Promise((resolve) => {
      const eventEmitter = new NativeEventEmitter(NativeModules.VideoTrim);
      const subscription = eventEmitter.addListener(
        "VideoTrim",
        (event: any) => {
          switch (event.name) {
            case "onFinishTrimming":
              subscription.remove();
              resolve(event.outputPath);
              break;
            case "onCancelTrimming":
              subscription.remove();
              resolve(videoUri);
              break;
            case "onError":
              subscription.remove();
              console.error("Video trim error:", event.message);
              Toast.show({
                type: "error",
                text1: "Trim Failed",
                text2: "Could not trim video. Using original.",
              });
              resolve(videoUri);
              break;
          }
        },
      );

      const editorConfig: any = {
        enableSaveDialog: false,
      };
      if (maxDuration > 0) {
        editorConfig.maxDuration = maxDuration;
      }
      showEditor(videoUri, editorConfig);
    });
  };

  const pickCoverImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      const originalUri = result.assets[0].uri;
      // Crop image with 9:16 aspect ratio for cover
      const croppedUri = await cropImage(originalUri, 1080, 1920);
      if (croppedUri) {
        updateActiveTab("cover_img", croppedUri);
      }
    }
  };

  const pickMedia = async (isAppending = false) => {
    let mediaTypes = ImagePicker.MediaTypeOptions.Images;
    let allowsMultipleSelection = false;
    let selectionLimit = 1;
    let targetKey = "media";

    if (activeTab === "Post") {
      if (postType === "Carousel") {
        mediaTypes = ImagePicker.MediaTypeOptions.All;
        allowsMultipleSelection = true;
        const currentCount = Array.isArray(currentMedia)
          ? currentMedia.length
          : 0;
        selectionLimit = isAppending ? Math.max(0, 10 - currentCount) : 10;
        if (selectionLimit <= 0) {
          Toast.show({
            type: "error",
            text1: "Limit Reached",
            text2: "You can only select up to 10 items.",
          });
          return;
        }
        targetKey = "carouselMedia";
      } else {
        targetKey = "singleMedia";
      }
    } else if (activeTab === "Reel") {
      mediaTypes = ImagePicker.MediaTypeOptions.Videos;
    } else if (activeTab === "Story") {
      if (postType === "Carousel") {
        mediaTypes = ImagePicker.MediaTypeOptions.Videos;
        targetKey = "videoMedia";
      } else {
        targetKey = "photoMedia";
      }
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes,
      allowsEditing: false,
      shape: "rectangle",
      quality: 0.5,
      allowsMultipleSelection,
      selectionLimit,
    });

    if (!result.canceled) {
      const handleImageConversion = async (uri: string) => {
        if (!isVideoUrl(uri)) {
          try {
            let compressionRatio = 1;

            // Compress image if posting to Instagram and it is > 8MB
            if (activeTab === "Post" && selectedPlatforms["instagram"]) {
              const fileInfo = await FileSystem.getInfoAsync(uri);
              if (fileInfo.exists && fileInfo.size !== undefined) {
                const sizeInMB = fileInfo.size / (1024 * 1024);
                if (sizeInMB > 8) {
                  compressionRatio = Math.max(0.1, Math.min(0.9, 7 / sizeInMB));
                }
              }
            }

            // Resize carousel images to proper dimensions (same as single posts)
            let resizeAction: any[] = [];
            if (activeTab === "Post" && postType === "Carousel") {
              resizeAction = [{ resize: { width: 1080, height: 1350 } }];
            }

            const manipResult = await ImageManipulator.manipulateAsync(
              uri,
              resizeAction,
              {
                compress: compressionRatio,
                format: ImageManipulator.SaveFormat.JPEG,
              },
            );
            return manipResult.uri;
          } catch (error) {
            console.error("Image conversion error:", error);
            return uri;
          }
        }
        return uri;
      };

      if (allowsMultipleSelection) {
        const newUris = await Promise.all(
          result.assets.map(async (a) => {
            let processedUri = a.uri;
            processedUri = await handleImageConversion(processedUri);
            return processedUri;
          }),
        );
        if (isAppending && Array.isArray(currentMedia)) {
          updateActiveTab(targetKey, [...currentMedia, ...newUris]);
        } else {
          updateActiveTab(targetKey, newUris);
        }
      } else {
        const asset = result.assets[0];
        let processedUri = asset.uri;

        // Offer cropping for image selections (not videos)
        if (!isVideoUrl(asset.uri)) {
          let cropWidth = 1080;
          let cropHeight = 1080;

          // Set aspect ratio based on post type
          if (activeTab === "Post" && postType === "Single") {
            cropWidth = 1080;
            cropHeight = 1350; // Instagram feed 4:5
          } else if (activeTab === "Reel") {
            cropWidth = 1080;
            cropHeight = 1920; // 9:16
          } else if (activeTab === "Story") {
            cropWidth = 1080;
            cropHeight = 1920; // 9:16
          }

          const croppedUri = await cropImage(
            processedUri,
            cropWidth,
            cropHeight,
          );
          if (croppedUri) {
            processedUri = croppedUri;
          }
        }

        processedUri = await handleImageConversion(processedUri);

        // Trim video for Reel or Story video uploads
        if (
          isVideoUrl(processedUri) &&
          (activeTab === "Reel" ||
            (activeTab === "Story" && postType === "Carousel"))
        ) {
          // Story: max 90 sec, Reel: no limit (user can trim freely)
          const trimMax = activeTab === "Story" ? 60 : 0;
          processedUri = await trimVideo(processedUri, trimMax);
        }

        updateActiveTab(targetKey, processedUri);
      }
    }
  };

  return (
    <View className="flex-1">
      <ScrollView
        ref={scrollViewRef}
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
            Create{"\n"}Content
          </Text>

          {/* Content Type Tabs */}
          <View
            className="content-tabs-container w-full mb-8"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.45,
              shadowRadius: 24,
              elevation: 10,
            }}
          >
            <BlurView intensity={50} tint="light" className="content-tabs-blur">
              {tabs.map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      if (activeTab !== tab) {
                        setTabData((prev) => ({
                          ...prev,
                          [activeTab]: {
                            ...INITIAL_TAB_DATA[
                              activeTab as keyof typeof INITIAL_TAB_DATA
                            ],
                          },
                        }));
                        setTagInputText("");
                      }
                      setActiveTab(tab);
                    }}
                    className={`content-tab-btn ${isActive ? "content-tab-active" : ""}`}
                    style={
                      isActive
                        ? {
                            shadowColor: "#04C4FF",
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.31,
                            shadowRadius: 14,
                            elevation: 8,
                          }
                        : undefined
                    }
                  >
                    <Text
                      className={`content-tab-text ${isActive ? "text-black" : "text-white/60"}`}
                    >
                      {tab}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </BlurView>
          </View>

          {/* Main Content Area */}
          {(activeTab === "Post" ||
            activeTab === "Reel" ||
            activeTab === "Story") && (
            <View key={activeTab}>
              <View
                key={`first-card-${activeTab}`}
                className="glass-card-container"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.45,
                  shadowRadius: 24,
                  elevation: 8,
                }}
              >
                <BlurView intensity={14} tint="dark" className="flex-1">
                  <View className="glass-card-gradient">
                    {(activeTab === "Post" || activeTab === "Story") && (
                      <>
                        <Text className="input-label">Post type</Text>
                        <View className="glass-input flex-row rounded-full p-1 mb-6">
                          <BlurView
                            intensity={5}
                            tint="light"
                            className="flex-1 flex-row"
                          >
                            <TouchableOpacity
                              className={`post-type-btn ${postType === "Single" ? "post-type-btn-active" : ""}`}
                              onPress={() => {
                                Haptics.impactAsync(
                                  Haptics.ImpactFeedbackStyle.Light,
                                );
                                setPostType("Single");
                              }}
                            >
                              <Text
                                className={`post-type-btn-label ${postType === "Single" ? "post-type-btn-label-active" : ""}`}
                              >
                                {activeTab === "Story"
                                  ? "Photo"
                                  : "Single post"}
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              className={`post-type-btn ${postType === "Carousel" ? "post-type-btn-active" : ""}`}
                              onPress={() => {
                                Haptics.impactAsync(
                                  Haptics.ImpactFeedbackStyle.Light,
                                );
                                setPostType("Carousel");
                              }}
                            >
                              <Text
                                className={`post-type-btn-label ${postType === "Carousel" ? "post-type-btn-label-active" : ""}`}
                              >
                                {activeTab === "Story"
                                  ? "Video"
                                  : "Carousel post"}
                              </Text>
                            </TouchableOpacity>
                          </BlurView>
                        </View>
                      </>
                    )}

                    {/* Choose Template */}
                    {/* <Text className="input-label">Choose template</Text>
                                        <TouchableOpacity className="glass-input mb-6" onPress={() => { }}>
                                            <BlurView intensity={5} tint="light" className="py-4 items-center">
                                                <Text className="text-white/80 font-inter text-sm">Select template</Text>
                                            </BlurView>
                                        </TouchableOpacity> */}

                    {/* Upload Media */}
                    <Text className="input-label">
                      {activeTab === "Reel" ? "Upload video" : "Upload media"}
                    </Text>
                    <View
                      className={`glass-input mb-6 overflow-hidden ${currentMedia ? "" : "border-dashed"}`}
                    >
                      <BlurView intensity={5} tint="light">
                        {currentMedia ? (
                          <View>
                            {Array.isArray(currentMedia) ? (
                              (() => {
                                const mediaArray = currentMedia as string[];
                                const gridData = mediaArray.map((uri, idx) => ({
                                  key: uri,
                                  uri,
                                  index: idx,
                                }));
                                if (gridData.length < 10) {
                                  gridData.push({
                                    key: "ADD_MORE_BUTTON",
                                    uri: "ADD_MORE_BUTTON",
                                    index: gridData.length,
                                  });
                                }
                                // Calculate number of rows and derive the explicit height required
                                const numRows = Math.ceil(gridData.length / 3);
                                const gridHeight = numRows * itemWidth + 30;

                                return (
                                  <View
                                    style={{
                                      height: gridHeight,
                                      width: "100%",
                                      paddingTop: 14,
                                    }}
                                  >
                                    <DraggableGrid
                                      numColumns={3}
                                      itemHeight={itemWidth}
                                      data={gridData}
                                      onDragRelease={(newData) => {
                                        const updatedMedia = newData
                                          .filter(
                                            (item: any) =>
                                              item.key !== "ADD_MORE_BUTTON",
                                          )
                                          .map((item: any) => item.uri);
                                        updateActiveTab(
                                          "carouselMedia",
                                          updatedMedia,
                                        );
                                      }}
                                      renderItem={(item: any) => {
                                        if (item.uri === "ADD_MORE_BUTTON") {
                                          return (
                                            <View
                                              style={{
                                                width: itemWidth,
                                                height: itemWidth,
                                                padding: paddingEdge,
                                              }}
                                            >
                                              <TouchableOpacity
                                                key={item.key}
                                                style={{ flex: 1 }}
                                                className="rounded-xl bg-white/5 items-center justify-center border border-white/20 border-dashed"
                                                onPress={() => pickMedia(true)}
                                              >
                                                <Plus
                                                  color="white"
                                                  size={24}
                                                  className="mb-2"
                                                />
                                                <Text className="text-white font-inter text-xs">
                                                  Add more
                                                </Text>
                                              </TouchableOpacity>
                                            </View>
                                          );
                                        }

                                        return (
                                          <View
                                            style={{
                                              width: itemWidth,
                                              height: itemWidth,
                                              padding: paddingEdge,
                                            }}
                                          >
                                            <View
                                              key={item.key}
                                              style={{ flex: 1 }}
                                              className="relative rounded-xl overflow-hidden"
                                            >
                                              {isVideoUrl(item.uri) ? (
                                                <Video
                                                  source={{ uri: item.uri }}
                                                  style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    borderRadius: 12,
                                                  }}
                                                  resizeMode={videoResizeMode}
                                                  shouldPlay
                                                  isLooping
                                                />
                                              ) : (
                                                <Image
                                                  source={{ uri: item.uri }}
                                                  className="w-full h-full rounded-xl"
                                                  resizeMode="cover"
                                                />
                                              )}
                                              <TouchableOpacity
                                                className="absolute top-2 right-2 bg-black/80 p-1.5 rounded-full"
                                                onPress={() => {
                                                  const newMedia = (
                                                    currentMedia as string[]
                                                  ).filter(
                                                    (uri) => uri !== item.uri,
                                                  );
                                                  updateActiveTab(
                                                    "carouselMedia",
                                                    newMedia.length > 0
                                                      ? newMedia
                                                      : null,
                                                  );
                                                }}
                                              >
                                                <X color="white" size={12} />
                                              </TouchableOpacity>
                                              {isVideoUrl(item.uri) && (
                                                <TouchableOpacity
                                                  className="absolute top-2 right-10 bg-black/80 p-1.5 rounded-full"
                                                  onPress={() => {
                                                    setVideoResizeMode(
                                                      (prev) =>
                                                        prev ===
                                                        ResizeMode.COVER
                                                          ? ResizeMode.CONTAIN
                                                          : ResizeMode.COVER,
                                                    );
                                                  }}
                                                >
                                                  {videoResizeMode ===
                                                  ResizeMode.COVER ? (
                                                    <Minimize
                                                      color="white"
                                                      size={12}
                                                    />
                                                  ) : (
                                                    <Maximize
                                                      color="white"
                                                      size={12}
                                                    />
                                                  )}
                                                </TouchableOpacity>
                                              )}
                                            </View>
                                          </View>
                                        );
                                      }}
                                    />
                                  </View>
                                );
                              })()
                            ) : (
                              <View
                                style={{ padding: 14, alignItems: "center" }}
                              >
                                <View
                                  style={{
                                    width: previewWidth,
                                    height: previewHeight,
                                    borderRadius: 16,
                                    overflow: "hidden",
                                  }}
                                >
                                  {isVideoUrl(currentMedia) ? (
                                    <Video
                                      source={{ uri: currentMedia as string }}
                                      style={{ width: "100%", height: "100%" }}
                                      resizeMode={videoResizeMode}
                                      shouldPlay
                                      isLooping
                                    />
                                  ) : (
                                    <Image
                                      source={{ uri: currentMedia as string }}
                                      style={{ width: "100%", height: "100%" }}
                                      resizeMode="cover"
                                    />
                                  )}
                                  {isVideoUrl(currentMedia) && (
                                    <TouchableOpacity
                                      style={{
                                        position: "absolute",
                                        top: 8,
                                        right: 44,
                                        backgroundColor: "rgba(0,0,0,0.8)",
                                        padding: 6,
                                        borderRadius: 100,
                                      }}
                                      onPress={() => {
                                        setVideoResizeMode((prev) =>
                                          prev === ResizeMode.COVER
                                            ? ResizeMode.CONTAIN
                                            : ResizeMode.COVER,
                                        );
                                      }}
                                    >
                                      {videoResizeMode === ResizeMode.COVER ? (
                                        <Minimize color="white" size={12} />
                                      ) : (
                                        <Maximize color="white" size={12} />
                                      )}
                                    </TouchableOpacity>
                                  )}
                                  <TouchableOpacity
                                    style={{
                                      position: "absolute",
                                      top: 8,
                                      right: 8,
                                      backgroundColor: "rgba(0,0,0,0.8)",
                                      padding: 6,
                                      borderRadius: 100,
                                    }}
                                    onPress={() =>
                                      updateActiveTab(
                                        activeTab === "Post"
                                          ? "singleMedia"
                                          : activeTab === "Story"
                                            ? postType === "Single"
                                              ? "photoMedia"
                                              : "videoMedia"
                                            : "media",
                                        null,
                                      )
                                    }
                                  >
                                    <X color="white" size={12} />
                                  </TouchableOpacity>
                                </View>
                              </View>
                            )}
                          </View>
                        ) : (
                          <TouchableOpacity
                            className="py-8 items-center justify-center"
                            onPress={() => pickMedia(false)}
                          >
                            <Upload color="white" size={24} className="mb-2" />
                            <Text className="text-white font-inter text-sm">
                              Select {activeTab === "Reel" ? "video" : "media"}{" "}
                              <Text className="text-white/40">
                                {postType === "Carousel" &&
                                activeTab !== "Story"
                                  ? "(up to 10)"
                                  : ""}
                              </Text>
                            </Text>
                          </TouchableOpacity>
                        )}
                      </BlurView>
                    </View>

                    {/* Edit Cover Button for Reels */}
                    {activeTab === "Reel" && (
                      <TouchableOpacity
                        className="w-full h-[52px] bg-white/10 rounded-full items-center justify-center mb-6 shadow-sm"
                        onPress={() => {
                          Haptics.impactAsync(
                            Haptics.ImpactFeedbackStyle.Light,
                          );
                          setShowCoverModal(true);
                        }}
                      >
                        <Text className="text-white font-inter font-semibold text-base">
                          Edit cover
                        </Text>
                      </TouchableOpacity>
                    )}

                    {/* Caption */}
                    {activeTab !== "Story" && (
                      <>
                        <Text className="input-label">Caption</Text>
                        <View
                          className="flex-row gap-3 mb-6"
                          style={{ alignItems: "stretch" }}
                        >
                          {/* Text Input */}
                          <View className="flex-1 glass-input">
                            <BlurView
                              intensity={5}
                              tint="light"
                              className="p-4"
                            >
                              <TextInput
                                className="text-white input-text-regular py-0"
                                style={{ minHeight: 120, maxHeight: 120 }}
                                placeholder="Write your caption..."
                                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                multiline
                                scrollEnabled={true}
                                textAlignVertical="top"
                                value={caption}
                                onChangeText={setCaption}
                              />
                            </BlurView>
                          </View>

                          {/* Right Action Buttons - Pill Container */}
                          <View
                            className="overflow-hidden w-full"
                            style={{ width: 42, height: 147, borderRadius: 20 }}
                          >
                            <BlurView
                              intensity={20}
                              tint="light"
                              style={{
                                flex: 1,
                                paddingHorizontal: 8,
                                justifyContent: "space-evenly",
                                alignItems: "center",
                                backgroundColor: "#FFFFFF1A",
                              }}
                            >
                              {/* Move / Expand */}
                              <TouchableOpacity
                                style={{
                                  alignItems: "center",
                                  justifyContent: "center",
                                  marginBottom: 14,
                                }}
                                onPress={() => {
                                  Haptics.impactAsync(
                                    Haptics.ImpactFeedbackStyle.Light,
                                  );
                                  setShowCaptionModal(true);
                                }}
                              >
                                <Image
                                  source={require("../../assets/icons/move.png")}
                                  style={{ width: 30, height: 30 }}
                                  resizeMode="contain"
                                />
                              </TouchableOpacity>

                              {/* AI */}
                              <TouchableOpacity
                                style={{
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                                onPress={handleGenerateCaption}
                                disabled={isGeneratingCaption}
                              >
                                {isGeneratingCaption ? (
                                  <ActivityIndicator
                                    size="small"
                                    color="#fff"
                                  />
                                ) : (
                                  <Image
                                    source={require("../../assets/icons/chat_ai.png")}
                                    style={{ width: 30, height: 30 }}
                                    resizeMode="contain"
                                  />
                                )}
                              </TouchableOpacity>

                              {/* Voice */}
                              <TouchableOpacity
                                style={{
                                  alignItems: "center",
                                  justifyContent: "center",
                                  marginTop: 14,
                                }}
                                onPress={
                                  isListening ? stopListening : startListening
                                }
                              >
                                <Animated.View
                                  style={{ transform: [{ scale: pulseAnim }] }}
                                >
                                  {isListening ? (
                                    <View
                                      style={{
                                        width: 14,
                                        height: 14,
                                        backgroundColor: "#ff4444",
                                        borderRadius: 2,
                                      }}
                                    />
                                  ) : (
                                    <Image
                                      source={require("../../assets/icons/caption_mike.png")}
                                      style={{ width: 30, height: 30 }}
                                      resizeMode="contain"
                                    />
                                  )}
                                </Animated.View>
                              </TouchableOpacity>
                            </BlurView>
                          </View>
                        </View>
                      </>
                    )}

                    {/* Tags */}
                    {activeTab !== "Story" && (
                      <>
                        <Text className="input-label">Tags</Text>
                        <View className="flex-row gap-3 mb-6">
                          <View className="flex-1 glass-input flex-row items-center">
                            <BlurView
                              intensity={0}
                              tint="light"
                              className="flex-1 flex-row px-4"
                            >
                              <Text className="text-white/40 mr-2 input-text-regular">
                                @
                              </Text>
                              <TextInput
                                className="text-white font-inter font-semibold py-0 flex-1"
                                placeholder="Add a tag"
                                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                value={tagInputText}
                                onChangeText={setTagInputText}
                                onSubmitEditing={handleAddTag}
                                blurOnSubmit={false}
                              />
                            </BlurView>
                          </View>
                          <TouchableOpacity
                            className="w-[61px] h-[52px] rounded-[20px] overflow-hidden bg-[#FFFFFF1A]"
                            onPress={handleAddTag}
                          >
                            <BlurView
                              intensity={14}
                              tint="light"
                              className="flex-1 items-center justify-center"
                            >
                              <Text className="text-white font-inter font-medium text-sm">
                                Add
                              </Text>
                            </BlurView>
                          </TouchableOpacity>
                        </View>

                        {/* Render Added Tags */}
                        {activeTags && activeTags.length > 0 && (
                          <View className="flex-row flex-wrap gap-2 mb-6 mt-[-8px]">
                            {activeTags.map((tag: string, index: number) => (
                              <View
                                key={index}
                                className="flex-row items-center bg-[#FFFFFF1A] px-3 py-2.5 rounded-full"
                              >
                                <Text className="text-white font-inter text-lg mr-2">
                                  @{tag}
                                </Text>
                                <TouchableOpacity
                                  onPress={() => handleRemoveTag(tag)}
                                  className="bg-black/30 rounded-full p-0.5"
                                >
                                  <X color="white" size={16} />
                                </TouchableOpacity>
                              </View>
                            ))}
                          </View>
                        )}
                      </>
                    )}
                  </View>
                </BlurView>
              </View>

              {/* Second Card: Post Settings */}
              <View
                key={`second-card-${activeTab}`}
                className="glass-card-container"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.45,
                  shadowRadius: 24,
                  elevation: 8,
                }}
              >
                <BlurView intensity={14} tint="dark" className="flex-1">
                  <View className="glass-card-gradient">
                    {/* Post On (Platforms) */}
                    <Text className="input-label">Post on</Text>
                    <View
                      key={`platforms-${activeTab}-${postType}`}
                      className="post-on-container"
                    >
                      {(() => {
                        // Check if there are ANY connected accounts at all
                        const hasAnyConnectedAccounts = Object.keys(
                          socialMediaData,
                        ).some(
                          (key) =>
                            Array.isArray(socialMediaData[key]) &&
                            socialMediaData[key]!.length > 0,
                        );

                        if (!hasAnyConnectedAccounts) {
                          return (
                            <View className="w-full py-6 items-center justify-center">
                              <Text className="text-white/60 text-center font-inter text-base">
                                No Connected Accounts!{"\n"}Please Connect
                                First!
                              </Text>
                            </View>
                          );
                        }

                        const filteredPlatforms = [
                          {
                            id: "instagram",
                            name: "Instagram",
                            icon: require("../../assets/icons/instagram.png"),
                          },
                          {
                            id: "tiktok",
                            name: "TikTok",
                            icon: require("../../assets/icons/tiktok.png"),
                          },
                          {
                            id: "youtube",
                            name: "Youtube",
                            icon: require("../../assets/icons/youtube.png"),
                          },
                          {
                            id: "snapchat",
                            name: "Snapchat",
                            icon: require("../../assets/icons/snapchat.png"),
                          },
                          {
                            id: "x",
                            name: "X",
                            icon: require("../../assets/icons/twitter.png"),
                          },
                          {
                            id: "facebook",
                            name: "Facebook",
                            icon: require("../../assets/icons/facebook.png"),
                          },
                        ].filter((p) => {
                          // Check if platform key exists for Twitter (stored as 'twitter' in backend)
                          const platformKey = p.id === "x" ? "twitter" : p.id;

                          // Only show connected accounts
                          const isConnected =
                            socialMediaData[platformKey] &&
                            Array.isArray(socialMediaData[platformKey]) &&
                            socialMediaData[platformKey]!.length > 0;

                          if (!isConnected) return false;

                          // Platform-specific content type restrictions
                          if (activeTab === "Post") {
                            if (postType === "Single") {
                              // Single Post: disable YouTube and Snapchat
                              return !["youtube", "snapchat"].includes(p.id);
                            } else if (postType === "Carousel") {
                              // Carousel: Only Instagram, Facebook, X (Twitter)
                              return ["instagram", "facebook", "x"].includes(
                                p.id,
                              );
                            }
                          }

                          if (activeTab === "Reel") {
                            // Reel: All except X (Twitter)
                            return p.id !== "x";
                          }

                          if (activeTab === "Story") {
                            // Story: Only Instagram, Facebook, Snapchat
                            return [
                              "instagram",
                              "facebook",
                              "snapchat",
                            ].includes(p.id);
                          }

                          return true;
                        });

                        return filteredPlatforms.map((platform) => {
                          const isSelected = selectedPlatforms[platform.id];

                          // Determine if platform should be disabled due to content constraints
                          let isDisabled = false;

                          if (
                            activeTab === "Post" &&
                            postType === "Carousel" &&
                            currentMedia &&
                            Array.isArray(currentMedia)
                          ) {
                            // Facebook doesn't support carousel with videos
                            if (platform.id === "facebook") {
                              const hasVideo = currentMedia.some((url) =>
                                isVideoUrl(url),
                              );
                              if (hasVideo) {
                                isDisabled = true;
                              }
                            }

                            // Twitter (X) only supports max 4 media items
                            if (
                              platform.id === "x" &&
                              currentMedia.length > 4
                            ) {
                              isDisabled = true;
                            }
                          }
                          return (
                            <TouchableOpacity
                              key={platform.id}
                              className={`post-on-btn ${isSelected ? "post-on-btn-selected" : ""}`}
                              onPress={() => togglePlatform(platform.id)}
                            >
                              <BlurView
                                intensity={isSelected ? 0 : 5}
                                tint="light"
                                className="post-on-content"
                              >
                                <Image
                                  source={platform.icon}
                                  className={`post-on-icon ${isSelected ? "post-on-icon-selected" : ""}`}
                                  resizeMode="contain"
                                />
                                <Text
                                  className={`post-on-platform-name ${isSelected ? "post-on-platform-name-selected" : "post-on-platform-name-default"}`}
                                >
                                  {platform.name}
                                </Text>
                              </BlurView>
                            </TouchableOpacity>
                          );
                        });
                      })()}
                    </View>
                  </View>
                </BlurView>
              </View>

              {/* Third Card: Schedule */}
              <View
                key={`third-card-${activeTab}`}
                className="glass-card-container"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.45,
                  shadowRadius: 24,
                  elevation: 8,
                }}
              >
                <BlurView intensity={14} tint="dark" className="flex-1">
                  <View className="glass-card-gradient">
                    {/* Schedule */}
                    <Text className="input-label">Schedule</Text>
                    <TouchableOpacity
                      className="schedule-input flex-row items-center w-full"
                      onPress={() => setShowDatePicker(true)}
                    >
                      <BlurView
                        intensity={5}
                        tint="light"
                        className="flex-1 flex-row items-center px-4 py-3"
                      >
                        <Image
                          source={require("../../assets/icons/calender.png")}
                          className="w-5 h-5 mr-3"
                          resizeMode="contain"
                          style={{ tintColor: "rgba(255, 255, 255, 0.6)" }}
                        />
                        <Text className="text-white/60 input-text-regular">
                          {date ? date.toLocaleString() : "Select date & time"}
                        </Text>
                      </BlurView>
                    </TouchableOpacity>
                  </View>
                </BlurView>
              </View>
              {/* Generate Post Button */}
              <TouchableOpacity
                className="w-full h-14 overflow-hidden rounded-full mb-6"
                onPress={handlePreviewPost}
                disabled={isPublishing}
              >
                <ImageBackground
                  source={require("../../assets/images/generate_post.jpg")}
                  className="w-full h-full items-center justify-center"
                  resizeMode="cover"
                >
                  <View className="absolute inset-0" />

                  <Text className="text-white font-semibold text-lg">
                    Generate Post
                  </Text>
                </ImageBackground>
              </TouchableOpacity>

              {/* Separator */}
              <View className="flex-row items-center w-full mb-6 px-2">
                <View className="flex-1 h-[1px] bg-white/80" />
                <Text className="text-white mx-4 font-inter text-base">or</Text>
                <View className="flex-1 h-[1px] bg-white/80" />
              </View>

              {/* Post Without Viewing Button */}
              <TouchableOpacity
                className="w-full h-14 overflow-hidden rounded-full mb-10"
                onPress={() => {
                  handleGeneratePost();
                }}
              >
                <ImageBackground
                  source={require("../../assets/images/post_without.jpg")}
                  className="w-full h-full items-center justify-center"
                  resizeMode="cover"
                >
                  <View className="absolute inset-0" />
                  {isPublishing ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text className="text-white font-semibold text-lg">
                      Post without viewing
                    </Text>
                  )}
                </ImageBackground>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {showDatePicker &&
        (Platform.OS === "ios" ? (
          <Modal
            transparent={true}
            animationType="fade"
            visible={showDatePicker}
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View className="flex-1 justify-center items-center bg-black/50">
              <View className="bg-[#1A1A1A] border border-white/10 rounded-[20px] p-5 w-[80%] items-center shadow-lg">
                <DateTimePicker
                  testID="dateTimePicker"
                  value={date || new Date()}
                  mode="datetime"
                  is24Hour={true}
                  onChange={onDateChange}
                  display="spinner"
                  textColor="white"
                  themeVariant="dark"
                />
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowDatePicker(false);
                  }}
                  className="mt-4 bg-white py-3 px-8 rounded-full"
                >
                  <Text className="text-black font-inter font-medium">
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            testID="dateTimePicker"
            value={date || new Date()}
            mode="datetime"
            is24Hour={true}
            onChange={onDateChange}
          />
        ))}
      {/* Expanded Caption Modal */}
      <Modal
        visible={showCaptionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCaptionModal(false)}
      >
        <KeyboardAvoidingView
          behavior="padding"
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <View style={captionModalStyles.overlay}>
            <BlurView
              intensity={14}
              tint="light"
              style={StyleSheet.absoluteFillObject}
            />

            {/* Background Dismiss Tracker */}
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={StyleSheet.absoluteFillObject} />
            </TouchableWithoutFeedback>

            <View style={captionModalStyles.card}>
              <View style={captionModalStyles.cardInner}>
                {/* Text Input Area */}
                <TextInput
                  style={captionModalStyles.textInput}
                  placeholder="Write your caption..."
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  multiline
                  scrollEnabled={true}
                  value={caption}
                  onChangeText={setCaption}
                />

                {/* Collapse Button Top Right */}
                <TouchableOpacity
                  style={captionModalStyles.collapseBtn}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowCaptionModal(false);
                  }}
                >
                  <Image
                    source={require("../../assets/icons/move_out.png")}
                    style={{ width: 44, height: 44 }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>

                {/* Bottom Bar */}
                <View style={captionModalStyles.bottomBar}>
                  <TouchableOpacity
                    style={captionModalStyles.saveBtn}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setShowCaptionModal(false);
                    }}
                  >
                    <Text style={captionModalStyles.saveBtnText}>Save</Text>
                  </TouchableOpacity>

                  <View style={captionModalStyles.iconRow}>
                    <TouchableOpacity
                      style={captionModalStyles.iconBtn}
                      onPress={handleGenerateCaption}
                      disabled={isGeneratingCaption}
                    >
                      {isGeneratingCaption ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Image
                          source={require("../../assets/icons/chat_ai.png")}
                          style={{ width: 44, height: 44 }}
                          resizeMode="contain"
                        />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={captionModalStyles.iconBtn}
                      onPress={isListening ? stopListening : startListening}
                    >
                      <Animated.View
                        style={{ transform: [{ scale: pulseAnim }] }}
                      >
                        {isListening ? (
                          <View
                            style={{
                              width: 22,
                              height: 22,
                              backgroundColor: "#ff4444",
                              borderRadius: 4,
                            }}
                          />
                        ) : (
                          <Image
                            source={require("../../assets/icons/caption_mike.png")}
                            style={{ width: 44, height: 44 }}
                            resizeMode="contain"
                          />
                        )}
                      </Animated.View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Cover Modal */}
      <Modal
        visible={showCoverModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCoverModal(false)}
      >
        <BlurView
          intensity={14}
          tint="light"
          style={captionModalStyles.overlay}
        >
          <View style={coverModalStyles.card}>
            <View style={captionModalStyles.cardInner}>
              {/* Header */}
              <View style={coverModalStyles.header}>
                <TouchableOpacity
                  style={coverModalStyles.closeBtn}
                  onPress={() => setShowCoverModal(false)}
                >
                  <View
                    style={{
                      width: 27,
                      height: 27,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Svg width={27} height={27}>
                      <Defs>
                        <SvgLinearGradient
                          id="closeBtnGrad"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <Stop
                            offset="0%"
                            stopColor="#FFFFFF"
                            stopOpacity="1"
                          />
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
                        cx={13.5}
                        cy={13.5}
                        r={13}
                        stroke="url(#closeBtnGrad)"
                        strokeWidth={1}
                        fill="transparent"
                      />
                    </Svg>
                    <View
                      style={{
                        position: "absolute",
                        width: 23,
                        height: 23,
                        borderRadius: 11.5,
                        backgroundColor: "#0A0A0A",
                        alignItems: "center",
                        justifyContent: "center",
                        top: 2,
                        left: 2,
                      }}
                    >
                      <X color="white" size={14} />
                    </View>
                  </View>
                </TouchableOpacity>
                <Text style={coverModalStyles.title}>Edit cover</Text>
              </View>

              {/* Preview — shows the current scrub position */}
              <View style={coverModalStyles.previewContainer}>
                {currentMedia ? (
                  <Video
                    ref={coverVideoRef}
                    source={{ uri: currentMedia as string }}
                    style={coverModalStyles.previewImage}
                    resizeMode={ResizeMode.CONTAIN}
                    shouldPlay={false}
                    isMuted
                    onLoad={(status: any) => {
                      const dur = status?.durationMillis ?? 0;
                      coverDurationMsRef.current = dur;
                      setCoverDurationMs(dur);
                      // Start playing after load
                      coverVideoRef.current?.playAsync();
                    }}
                  />
                ) : (
                  <ExpoImage
                    source={
                      cover_img
                        ? { uri: cover_img }
                        : require("../../assets/images/cover_img.png")
                    }
                    style={coverModalStyles.previewImage}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={200}
                  />
                )}
              </View>

              <View style={{ height: 444 }} />

              {/* Bottom Controls */}
              <View style={coverModalStyles.bottomSection}>
                {/* Film strip with draggable selector — PanResponder on whole strip */}
                <View
                  style={coverModalStyles.filmStrip}
                  onLayout={(e) => {
                    filmStripWidth.current = e.nativeEvent.layout.width;
                  }}
                  {...scrubberPan.panHandlers}
                >
                  {/* Film strip track — just a solid background now */}
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: "#2A2A2A",
                      borderRadius: 16,
                    }}
                  />

                  {/* Selector window — matches screenshot with video preview inside */}
                  <View
                    style={{
                      position: "absolute",
                      top: -14,
                      bottom: -14,
                      left:
                        coverDurationMs && filmStripWidth.current
                          ? Math.max(
                              0,
                              Math.min(
                                filmStripWidth.current - SELECTOR_WIDTH,
                                (scrubberPositionMs / coverDurationMs) *
                                  (filmStripWidth.current - SELECTOR_WIDTH),
                              ),
                            )
                          : 0,
                      width: SELECTOR_WIDTH,
                      borderWidth: 3,
                      borderColor: "white",
                      borderRadius: 16,
                      backgroundColor: "black",
                      zIndex: 10,
                      pointerEvents: "none",
                      overflow: "hidden",
                    }}
                  >
                    {currentMedia ? (
                      <Video
                        ref={thumbVideoRef}
                        source={{ uri: currentMedia as string }}
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: 13,
                        }}
                        resizeMode={ResizeMode.COVER}
                        shouldPlay={false}
                        isMuted
                      />
                    ) : (
                      <ExpoImage
                        source={
                          cover_img
                            ? { uri: cover_img }
                            : require("../../assets/images/cover_img.png")
                        }
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: 13,
                        }}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                      />
                    )}
                  </View>
                </View>

                <TouchableOpacity onPress={pickCoverImage}>
                  <Text style={coverModalStyles.uploadText}>
                    or{" "}
                    <Text style={coverModalStyles.uploadLink}>
                      Upload image
                    </Text>
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={coverModalStyles.doneBtn}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    // Save the scrubbed position as the thumbnail offset
                    updateActiveTab("thumbNailOffset", scrubberPositionMs);
                    setShowCoverModal(false);
                  }}
                >
                  <Text style={coverModalStyles.doneBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </BlurView>
      </Modal>
    </View>
  );
}
