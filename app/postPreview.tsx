import { ResizeMode, Video } from "expo-av";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import {
  Camera,
  ChevronLeft,
  MoreHorizontal,
  Volume2,
  VolumeX,
  X,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import Svg, {
  Circle,
  Defs,
  Stop,
  LinearGradient as SvgLinearGradient,
} from "react-native-svg";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";
import Header from "../components/common/Header";
import { useNotification } from "../context/NotificationContext";
import createPostService from "../services/api/createPost";
import poppyService from "../services/api/poppy";
import {
  isSpeechRecognitionAvailable,
  speechRecognitionModule,
  useOptionalSpeechRecognitionEvent,
} from "../services/speechRecognition";
import storageService from "../services/storage";
import {
  type PreviewData,
  clearPreviewData,
  getPreviewData,
  markPreviewPostSuccessReset,
  setPreviewData,
} from "../store/previewStore";
import { RootState } from "../store/store";

const isVideoUrl = (url?: string | null) => {
  if (typeof url !== "string" || !url) return false;
  const lower = url.toLowerCase();
  return (
    lower.endsWith(".mp4") ||
    lower.endsWith(".mov") ||
    lower.startsWith("data:video")
  );
};

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

const extractHandleText = (value: unknown): string => {
  if (typeof value === "string") return value.trim();

  if (Array.isArray(value)) {
    for (const item of value) {
      const parsed = extractHandleText(item);
      if (parsed) return parsed;
    }
    return "";
  }

  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return extractHandleText(obj.username ?? obj.handle ?? obj.name);
  }

  return "";
};

const formatDurationLabel = (durationMs: number): string => {
  const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

const formatScheduledAt = (scheduledDate?: Date | null): string => {
  if (!(scheduledDate instanceof Date)) {
    return "";
  }

  if (Number.isNaN(scheduledDate.getTime())) {
    return "";
  }

  return scheduledDate.toLocaleString();
};

const getPublishSuccessCopy = ({
  contentType,
  platformNames,
  scheduledDate,
}: {
  contentType: string;
  platformNames: string;
  scheduledDate?: Date | null;
}) => {
  const destination = platformNames || "selected platforms";
  const scheduledAt = formatScheduledAt(scheduledDate);

  if (scheduledAt) {
    return {
      notificationMessage: `Your ${contentType} has been scheduled to post on ${destination} at ${scheduledAt}.`,
      toastMessage: `Scheduled on ${destination} at ${scheduledAt}`,
    };
  }

  return {
    notificationMessage: `Your ${contentType} has been published to ${destination}.`,
    toastMessage: `Published to ${destination}`,
  };
};

const COVER_PREVIEW_WIDTH = 242;
const COVER_PREVIEW_ASPECT_RATIO = 9 / 16;

const parsePreviewDataParam = (
  rawParam: string | string[] | undefined,
): PreviewData | null => {
  const serialized = Array.isArray(rawParam) ? rawParam[0] : rawParam;
  if (!serialized) {
    return null;
  }

  try {
    const parsed = JSON.parse(serialized);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const normalizedDate =
      parsed.date && typeof parsed.date === "string"
        ? new Date(parsed.date)
        : null;

    return {
      activeTab: parsed.activeTab,
      postType: parsed.postType,
      currentMedia: parsed.currentMedia,
      caption: parsed.caption,
      activeTags: Array.isArray(parsed.activeTags) ? parsed.activeTags : [],
      selectedPlatforms:
        parsed.selectedPlatforms && typeof parsed.selectedPlatforms === "object"
          ? parsed.selectedPlatforms
          : {},
      date:
        normalizedDate && !Number.isNaN(normalizedDate.getTime())
          ? normalizedDate
          : null,
      thumbNailOffset:
        typeof parsed.thumbNailOffset === "number" ? parsed.thumbNailOffset : 0,
      videoResizeMode: parsed.videoResizeMode === "cover" ? "cover" : "contain",
      instagramUsername:
        typeof parsed.instagramUsername === "string"
          ? parsed.instagramUsername
          : undefined,
    };
  } catch {
    return null;
  }
};

export default function PostPreview() {
  const { width } = useWindowDimensions();
  const { previewData } = useLocalSearchParams<{ previewData?: string }>();
  const { addNotification } = useNotification();
  const globalUserName = useSelector((state: RootState) => state.user.userName);
  const globalProfilePicture = useSelector(
    (state: RootState) => state.user.profilePicture,
  );
  const [isPublishing, setIsPublishing] = useState(false);
  const [data, setData] = useState<PreviewData | null>(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [showCaptionModal, setShowCaptionModal] = useState(false);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const lastResultIndex = useRef(0);
  const lastProcessedResult = useRef(0);
  const [coverDurationMs, setCoverDurationMs] = useState(0);
  const [scrubberPositionMs, setScrubberPositionMs] = useState(0);
  const [storyDurationMs, setStoryDurationMs] = useState<number | null>(null);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const swipeBackLockRef = useRef(false);
  const coverVideoRef = useRef<any>(null);
  const thumbVideoRef = useRef<any>(null);
  const coverDurationMsRef = useRef(0);
  const scrubberPositionMsRef = useRef(0);
  const dragStartPositionMsRef = useRef(0);
  const isSeekingRef = useRef(false);
  const filmStripWidthRef = useRef(0);
  const isCarouselTouchingRef = useRef(false);
  const appStateRef = useRef(AppState.currentState);
  const publishInterruptedByBackgroundRef = useRef(false);
  const selectorWidth = 76;

  const handleBack = useCallback(() => {
    if (swipeBackLockRef.current) {
      return;
    }

    swipeBackLockRef.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, []);

  useEffect(() => {
    const inMemoryPreviewData = getPreviewData();
    if (inMemoryPreviewData) {
      setData(inMemoryPreviewData);
      return;
    }

    const paramPreviewData = parsePreviewDataParam(previewData);
    if (paramPreviewData) {
      setPreviewData(paramPreviewData);
      setData(paramPreviewData);
      return;
    }

    if (!inMemoryPreviewData) {
      router.back();
    }
  }, [previewData]);

  useEffect(() => {
    if (data) {
      setPreviewData(data);
    }
  }, [data]);

  useEffect(() => {
    setCurrentMediaIndex(0);
  }, [data?.currentMedia]);

  useEffect(() => {
    const storyMedia = Array.isArray(data?.currentMedia)
      ? data?.currentMedia[0]
      : data?.currentMedia;
    const isStoryVideoPreview =
      data?.activeTab === "Story" && isVideoUrl(storyMedia);

    if (!isStoryVideoPreview) {
      setStoryDurationMs(null);
    }
  }, [data?.activeTab, data?.currentMedia]);

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

  const waitForAppToBecomeActive = useCallback(
    () =>
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
      }),
    [],
  );

  const safeSeek = useCallback((ms: number) => {
    if (!coverVideoRef.current || isSeekingRef.current) {
      return;
    }

    isSeekingRef.current = true;

    const promises = [coverVideoRef.current.setPositionAsync(ms)];
    if (thumbVideoRef.current) {
      promises.push(thumbVideoRef.current.setPositionAsync(ms));
    }

    Promise.all(promises)
      .catch(() => {
        // Ignore interrupted seek errors while dragging scrubber.
      })
      .finally(() => {
        isSeekingRef.current = false;
      });
  }, []);

  const scrubberPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          const stripWidth = filmStripWidthRef.current;
          const durationMs = coverDurationMsRef.current;
          if (!stripWidth || !durationMs) {
            return;
          }

          const maxX = Math.max(stripWidth - selectorWidth, 0);
          const touchX = event.nativeEvent.locationX;
          const nextX = Math.max(0, Math.min(maxX, touchX - selectorWidth / 2));
          const nextMs = maxX > 0 ? (nextX / maxX) * durationMs : 0;

          scrubberPositionMsRef.current = nextMs;
          dragStartPositionMsRef.current = nextMs;
          setScrubberPositionMs(nextMs);
          safeSeek(nextMs);
        },
        onPanResponderMove: (_, gestureState) => {
          const stripWidth = filmStripWidthRef.current;
          const durationMs = coverDurationMsRef.current;
          if (!stripWidth || !durationMs) {
            return;
          }

          const maxX = Math.max(stripWidth - selectorWidth, 0);
          const startX =
            maxX > 0 ? (dragStartPositionMsRef.current / durationMs) * maxX : 0;
          const nextX = Math.max(0, Math.min(maxX, startX + gestureState.dx));
          const nextMs = maxX > 0 ? (nextX / maxX) * durationMs : 0;

          scrubberPositionMsRef.current = nextMs;
          setScrubberPositionMs(nextMs);
          safeSeek(nextMs);
        },
        onPanResponderRelease: async () => {
          isSeekingRef.current = false;
          if (!coverVideoRef.current) {
            return;
          }

          try {
            const status = await coverVideoRef.current.getStatusAsync();
            if (status?.isLoaded && typeof status.positionMillis === "number") {
              const actualMs = status.positionMillis;
              scrubberPositionMsRef.current = actualMs;
              setScrubberPositionMs(actualMs);
              if (thumbVideoRef.current) {
                thumbVideoRef.current
                  .setPositionAsync(actualMs)
                  .catch(() => {});
              }
            }
          } catch {
            safeSeek(scrubberPositionMsRef.current);
          }
        },
        onPanResponderTerminate: () => {
          isSeekingRef.current = false;
        },
      }),
    [safeSeek],
  );

  const handleGenerateCaption = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!data?.caption?.trim()) {
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

      const isReel = data?.activeTab === "Reel";

      const generatedCaption = await poppyService.generateCaption(
        data.caption,
        isReel,
        token,
      );

      setData((prev) => (prev ? { ...prev, caption: generatedCaption } : prev));

      addNotification({
        type: "success",
        title: "Caption Generated",
        message: `AI caption generated for your ${data?.activeTab}.`,
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

  useOptionalSpeechRecognitionEvent("result", (event) => {
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

      setData((prev) => {
        if (!prev) return prev;
        const currentCaption = prev.caption || "";
        const base = currentCaption.substring(0, lastResultIndex.current);

        if (final) {
          const sep = base && base.trim() ? " " : "";
          const newText = base + sep + final;
          lastResultIndex.current = newText.length;
          return { ...prev, caption: newText };
        } else if (interim) {
          const sep = base && base.trim() && interim.trim() ? " " : "";
          return { ...prev, caption: base + sep + interim };
        }

        return prev;
      });
    }
  });

  useOptionalSpeechRecognitionEvent("end", () => {
    setIsListening(false);
  });

  useOptionalSpeechRecognitionEvent("error", (event) => {
    Alert.alert("Error", event.error || "Speech recognition failed");
    setIsListening(false);
  });

  const startListening = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!speechRecognitionModule || !isSpeechRecognitionAvailable) {
      Alert.alert(
        "Voice Unavailable",
        "Speech recognition is not available in this app build. Rebuild the native app and try again.",
      );
      return;
    }

    try {
      const { status } =
        await speechRecognitionModule.requestPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission Required", "Please enable microphone access");
        return;
      }

      await speechRecognitionModule.start({
        lang: Platform.OS === "ios" ? "en-US" : undefined,
        interimResults: true,
        maxAlternatives: 1,
        continuous: true,
        requiresOnDeviceRecognition: Platform.OS === "ios",
        addsPunctuation: true,
        contextualStrings: [],
      });

      setIsListening(true);
      lastResultIndex.current = (data?.caption || "").length;
      lastProcessedResult.current = 0;
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to start recording");
    }
  };

  const stopListening = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!speechRecognitionModule || !isSpeechRecognitionAvailable) {
      setIsListening(false);
      return;
    }

    try {
      await speechRecognitionModule.stop();
      setIsListening(false);
      lastResultIndex.current = (data?.caption || "").length;
      lastProcessedResult.current = 0;
    } catch (error) {
      console.log("Stop Voice Error:", error);
      setIsListening(false);
    }
  };

  if (!data) return null;

  const {
    activeTab,
    postType,
    currentMedia,
    caption,
    activeTags,
    selectedPlatforms,
    date,
    thumbNailOffset,
    videoResizeMode,
    instagramUsername,
  } = data;
  const normalizedInstagramUsername = extractHandleText(instagramUsername);
  const normalizedGlobalUserName = extractHandleText(globalUserName);
  const displayUsername =
    normalizedInstagramUsername || normalizedGlobalUserName || "username";
  const screenHorizontalPadding = 20;
  const cardHorizontalMargin = 16;
  const cardInnerHorizontalPadding = 12;
  const isStoryPreview = activeTab === "Story";
  const isReelPreview = activeTab === "Reel";
  const isVerticalPreview = isReelPreview || isStoryPreview;
  const mediaAspectRatio = activeTab === "Post" ? 4 / 5 : 9 / 16;
  const mediaItems = Array.isArray(currentMedia)
    ? currentMedia
    : currentMedia
      ? [currentMedia]
      : [];
  const reelMediaUri =
    isReelPreview && isVideoUrl(mediaItems[0]) ? mediaItems[0] : null;
  const mediaItemWidth = Math.max(
    width - cardHorizontalMargin * 2 - cardInnerHorizontalPadding * 2,
    1,
  );
  const reelCardWidth = Math.max(width - screenHorizontalPadding * 2, 1);
  const reelMediaWidth = Math.max(reelCardWidth - 12, 1);
  const reelMediaAspectRatio = 9 / 16;
  const previewVideoResizeMode =
    videoResizeMode === "cover" ? ResizeMode.COVER : ResizeMode.CONTAIN;
  const storyMediaUri = mediaItems.length > 0 ? mediaItems[0] : null;
  const storySegmentCount = isStoryPreview ? Math.max(mediaItems.length, 4) : 0;
  const previewTitle = isStoryPreview
    ? "Story"
    : isReelPreview
      ? "Reel"
      : "Post";
  const fallbackHandle = displayUsername.replace(/\s+/g, "").toLowerCase();
  const hashtagText =
    activeTags && activeTags.length > 0
      ? activeTags.map((t: string) => `#${t}`).join(" ")
      : fallbackHandle
        ? `#${fallbackHandle}`
        : "";
  const previewProfileSource = globalProfilePicture
    ? {
        uri:
          globalProfilePicture.startsWith("data:") ||
          globalProfilePicture.startsWith("http") ||
          globalProfilePicture.startsWith("file")
            ? globalProfilePicture
            : `data:image/png;base64,${globalProfilePicture}`,
      }
    : require("../assets/images/avtar.png");
  const previewProfileResizeMode = globalProfilePicture ? "cover" : "contain";
  const activePreviewMediaUri =
    mediaItems[currentMediaIndex] ?? mediaItems[0] ?? null;
  const isActivePreviewVideo = isVideoUrl(activePreviewMediaUri);
  const isPostCarousel = activeTab === "Post" && postType === "Carousel";
  const shouldShowCarouselVoiceOverlay = isPostCarousel && isActivePreviewVideo;

  const openCoverEditor = () => {
    if (!isReelPreview || !reelMediaUri) {
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const initialOffset = Math.max(0, Number(thumbNailOffset || 0));
    scrubberPositionMsRef.current = initialOffset;
    dragStartPositionMsRef.current = initialOffset;
    setScrubberPositionMs(initialOffset);
    safeSeek(initialOffset);
    setShowCoverModal(true);
  };

  const saveCoverChanges = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const nextOffset = Math.max(0, Math.round(scrubberPositionMsRef.current));
    const updatedData: PreviewData = {
      ...data,
      thumbNailOffset: nextOffset,
    };
    setData(updatedData);
    setPreviewData(updatedData);
    setShowCoverModal(false);
  };

  const toggleVoice = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsVoiceEnabled((prev) => !prev);
  };

  const handlePost = async (isRetryAfterBackground = false) => {
    if (!isRetryAfterBackground) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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

      if (
        !currentMedia ||
        (Array.isArray(currentMedia) && currentMedia.length === 0)
      ) {
        Toast.show({
          type: "error",
          text1: "Media Required",
          text2: "Please attach media before posting",
        });
        return;
      }

      const normalizeMediaUri = (uri: string) => {
        if (
          uri.startsWith("file://") ||
          uri.startsWith("content://") ||
          uri.startsWith("ph://") ||
          uri.startsWith("assets-library://") ||
          uri.startsWith("http://") ||
          uri.startsWith("https://")
        ) {
          return uri;
        }

        return `file://${uri}`;
      };

      const processMediaForUpload = (mediaItem: string) => {
        if (mediaItem.startsWith("data:")) {
          return mediaItem;
        }

        const uploadUri = normalizeMediaUri(mediaItem);
        if (
          uploadUri.startsWith("file://") ||
          uploadUri.startsWith("content://") ||
          uploadUri.startsWith("ph://") ||
          uploadUri.startsWith("assets-library://")
        ) {
          const cleanUri = uploadUri.split("?")[0];
          const ext = cleanUri.split(".").pop()?.toLowerCase() || "jpg";
          const isVideoMedia =
            isVideoUrl(uploadUri) ||
            isVideoUrl(mediaItem) ||
            activeTab === "Reel";

          let mimeType = "image/jpeg";
          if (isVideoMedia) {
            mimeType = ext === "mov" ? "video/quicktime" : "video/mp4";
          } else if (ext === "png") {
            mimeType = "image/png";
          } else if (ext === "webp") {
            mimeType = "image/webp";
          }

          const rawName = cleanUri.split("/").pop() || "";
          const fileName = rawName.includes(".")
            ? rawName
            : isVideoMedia
              ? "upload.mp4"
              : `upload.${ext}`;

          return {
            uri: uploadUri,
            type: mimeType,
            name: fileName,
          } as any;
        }

        return mediaItem;
      };

      const activePlatforms = Object.entries(selectedPlatforms)
        .filter(([_, isSelected]) => isSelected)
        .map(([platform]) => platform);

      const platformNameMap: Record<string, string> = {
        instagram: "Instagram",
        tiktok: "TikTok",
        youtube: "YouTube",
        snapchat: "Snap",
        x: "X",
        twitter: "Twitter",
        facebook: "Facebook",
      };
      const platformNames = activePlatforms
        .map((p) => platformNameMap[p] || p)
        .join(", ");
      const isCarousel = Array.isArray(currentMedia);
      const contentType =
        activeTab === "Reel"
          ? "Reel"
          : activeTab === "Story"
            ? "Story"
            : isCarousel
              ? "Carousel Post"
              : "Post";
      const { notificationMessage, toastMessage } = getPublishSuccessCopy({
        contentType,
        platformNames,
        scheduledDate: date,
      });

      const mediaPayload = isCarousel
        ? (currentMedia as string[]).map(processMediaForUpload)
        : processMediaForUpload(currentMedia as string);

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
        message: notificationMessage,
      });
      Toast.show({
        type: "success",
        text1: `${contentType} Created`,
        text2: toastMessage,
      });

      markPreviewPostSuccessReset();
      clearPreviewData();
      router.back();
    } catch (error) {
      const isBackgroundInterruptedNetworkError =
        publishInterruptedByBackgroundRef.current &&
        !!(error as any)?.isAxiosError &&
        !(error as any)?.response;

      if (isBackgroundInterruptedNetworkError) {
        if (!isRetryAfterBackground) {
          Toast.show({
            type: "info",
            text1: "Upload Paused",
            text2: "Resuming when app becomes active...",
          });

          await waitForAppToBecomeActive();
          publishInterruptedByBackgroundRef.current = false;
          await handlePost(true);
          return;
        }

        Toast.show({
          type: "error",
          text1: "Upload Interrupted",
          text2: "Keep app open until upload is complete.",
        });
        return;
      }

      console.error("Post error:", error);
      Toast.show({
        type: "error",
        text1: `${activeTab} Creation Failed`,
        text2: "Please try again.",
      });
    } finally {
      publishInterruptedByBackgroundRef.current = false;
      if (!isRetryAfterBackground) {
        setIsPublishing(false);
      }
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "transparent" }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ width: "100%" }}>
          <Header />
        </View>

        <View
          style={{ paddingHorizontal: screenHorizontalPadding, marginTop: 16 }}
        >
          <TouchableOpacity
            onPress={handleBack}
            style={{ marginBottom: 1, alignSelf: "flex-start" }}
            activeOpacity={0.8}
          >
            <BlurView
              intensity={40}
              tint="dark"
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                padding: 4,
                paddingRight: 14,
                borderRadius: 40,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.15)",
              }}
            >
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: "white",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 8,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <ChevronLeft
                  color="black"
                  size={16}
                  strokeWidth={2.5}
                  style={{ marginLeft: -2 }}
                />
              </View>
              <Text
                style={{
                  color: "white",
                  fontSize: 13,
                  fontWeight: "700",
                  fontFamily: "Inter",
                  letterSpacing: 0.5,
                }}
              >
                Back
              </Text>
            </BlurView>
          </TouchableOpacity>
          <Text
            className="page-title text-white mb-4 mt-4"
            adjustsFontSizeToFit
            numberOfLines={2}
          >
            {isStoryPreview ? "Story" : isReelPreview ? "Reel" : "Post"}
            {"\n"}preview screen
          </Text>
        </View>

        {isStoryPreview ? (
          <View
            style={{
              alignItems: "center",
              marginHorizontal: screenHorizontalPadding,
            }}
          >
            <View
              style={{
                width: reelCardWidth,
                borderRadius: 24,
                overflow: "hidden",
                borderWidth: 0.68,
                borderColor: "rgba(255,255,255,0.4)",
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.24,
                shadowRadius: 14,
                elevation: 8,
              }}
            >
              <BlurView
                intensity={20}
                tint="light"
                style={{ backgroundColor: "#FFFFFF1A" }}
              >
                <View style={{ padding: 6 }}>
                  <View
                    style={{
                      width: reelMediaWidth,
                      alignSelf: "center",
                      aspectRatio: reelMediaAspectRatio,
                      borderRadius: 24,
                      overflow: "hidden",
                      backgroundColor: "#080808",
                    }}
                  >
                    {storyMediaUri ? (
                      isVideoUrl(storyMediaUri) ? (
                        <Video
                          source={{ uri: storyMediaUri }}
                          style={{ width: "100%", height: "100%" }}
                          resizeMode={previewVideoResizeMode}
                          shouldPlay
                          isLooping
                          isMuted={!isVoiceEnabled}
                          onLoad={(status: any) => {
                            if (
                              status?.isLoaded &&
                              typeof status.durationMillis === "number" &&
                              status.durationMillis > 0
                            ) {
                              setStoryDurationMs(status.durationMillis);
                              return;
                            }

                            setStoryDurationMs(null);
                          }}
                        />
                      ) : (
                        <Image
                          source={{ uri: storyMediaUri }}
                          style={{ width: "100%", height: "100%" }}
                          resizeMode="cover"
                        />
                      )
                    ) : null}

                    <LinearGradient
                      colors={["rgba(0,0,0,0.7)", "transparent"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: 0,
                        height: 130,
                      }}
                    />

                    <View
                      style={{
                        position: "absolute",
                        top: 10,
                        left: 12,
                        right: 12,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      {Array.from({ length: storySegmentCount }).map(
                        (_, index) => (
                          <View
                            key={`story-segment-${index}`}
                            style={{
                              flex: 1,
                              height: 2,
                              borderRadius: 999,
                              backgroundColor:
                                index === 0
                                  ? "rgba(255,255,255,0.95)"
                                  : "rgba(255,255,255,0.28)",
                            }}
                          />
                        ),
                      )}
                    </View>

                    <View
                      style={{
                        position: "absolute",
                        top: 22,
                        left: 12,
                        right: 12,
                        flexDirection: "row",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <View
                          style={{
                            width: 42,
                            height: 42,
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 8,
                          }}
                        >
                          <BlurView
                            intensity={5}
                            style={{
                              position: "absolute",
                              width: 42,
                              height: 42,
                              borderRadius: 21,
                              overflow: "hidden",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Svg width={42} height={42}>
                              <Defs>
                                <SvgLinearGradient
                                  id="previewStoryRing"
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
                                cx={21}
                                cy={21}
                                r={20}
                                stroke="url(#previewStoryRing)"
                                strokeWidth={1}
                                fill="transparent"
                              />
                            </Svg>
                          </BlurView>
                          <View
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 18,
                              overflow: "hidden",
                              backgroundColor: "#333",
                            }}
                          >
                            <Image
                              source={previewProfileSource}
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 18,
                              }}
                              resizeMode={previewProfileResizeMode}
                            />
                          </View>
                        </View>
                        <Text
                          style={{
                            color: "white",
                            fontSize: 14,
                            fontWeight: "600",
                            fontFamily: "Inter",
                            lineHeight: 28,
                            letterSpacing: -0.89,
                          }}
                        >
                          {displayUsername}
                        </Text>
                      </View>

                      <View style={{ alignItems: "flex-end" }}>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <MoreHorizontal
                            color="white"
                            size={16}
                            strokeWidth={2.2}
                          />
                          <X color="white" size={18} strokeWidth={2.2} />
                          {isVideoUrl(storyMediaUri) ? (
                            <TouchableOpacity
                              onPress={toggleVoice}
                              activeOpacity={0.75}
                              style={{
                                width: 25,
                                height: 25,
                                borderRadius: 12.5,
                                overflow: "hidden",
                                borderWidth: 1,
                                borderColor: "rgba(255,255,255,0.16)",
                              }}
                            >
                              <BlurView
                                intensity={36}
                                tint="dark"
                                style={{
                                  flex: 1,
                                  alignItems: "center",
                                  justifyContent: "center",
                                  backgroundColor: "rgba(0,0,0,0.28)",
                                }}
                              >
                                {isVoiceEnabled ? (
                                  <Volume2
                                    color="white"
                                    size={15}
                                    strokeWidth={2.2}
                                  />
                                ) : (
                                  <VolumeX
                                    color="white"
                                    size={15}
                                    strokeWidth={2.2}
                                  />
                                )}
                              </BlurView>
                            </TouchableOpacity>
                          ) : null}
                        </View>
                        {storyDurationMs !== null ? (
                          <Text
                            style={{
                              color: "rgba(255,255,255,0.72)",
                              fontSize: 11,
                              fontFamily: "Inter",
                              marginTop: 4,
                            }}
                          >
                            {formatDurationLabel(storyDurationMs)}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  </View>
                </View>
              </BlurView>
            </View>
          </View>
        ) : isReelPreview ? (
          <View
            style={{
              alignItems: "center",
              marginHorizontal: screenHorizontalPadding,
            }}
          >
            <View
              style={{
                width: reelCardWidth,
                borderRadius: 24,
                overflow: "hidden",
                borderWidth: 0.68,
                borderColor: "rgba(255,255,255,0.4)",
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.24,
                shadowRadius: 14,
                elevation: 8,
              }}
            >
              <BlurView
                intensity={14}
                tint="dark"
                style={{ backgroundColor: "#FFFFFF1A" }}
              >
                <View style={{ padding: 6 }}>
                  <View
                    style={{
                      width: reelMediaWidth,
                      alignSelf: "center",
                      aspectRatio: reelMediaAspectRatio,
                      borderRadius: 24,
                      overflow: "hidden",
                      backgroundColor: "#080808",
                    }}
                  >
                    {mediaItems.length > 0 ? (
                      isVideoUrl(mediaItems[currentMediaIndex]) ? (
                        <Video
                          source={{ uri: mediaItems[currentMediaIndex] }}
                          style={{ width: "100%", height: "100%" }}
                          resizeMode={previewVideoResizeMode}
                          shouldPlay
                          isLooping
                          isMuted={!isVoiceEnabled}
                        />
                      ) : (
                        <Image
                          source={{ uri: mediaItems[currentMediaIndex] }}
                          style={{ width: "100%", height: "100%" }}
                          resizeMode="cover"
                        />
                      )
                    ) : null}

                    <LinearGradient
                      colors={["transparent", "rgba(0,0,0,0.75)"]}
                      start={{ x: 0, y: 0.25 }}
                      end={{ x: 0, y: 1 }}
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: 180,
                      }}
                    />

                    <View
                      style={{
                        position: "absolute",
                        top: 14,
                        left: 12,
                      }}
                    >
                      <ChevronLeft color="white" size={22} strokeWidth={2.2} />
                    </View>

                    <View
                      style={{
                        position: "absolute",
                        top: 14,
                        right: 12,
                      }}
                    >
                      <Camera color="white" size={22} strokeWidth={2.2} />
                    </View>

                    <View
                      style={{
                        position: "absolute",
                        right: 12,
                        bottom: 18,
                        alignItems: "center",
                        gap: 16,
                      }}
                    >
                      <Image
                        source={require("../assets/icons/post_like.png")}
                        style={{ width: 26, height: 26 }}
                        resizeMode="contain"
                      />
                      <Image
                        source={require("../assets/icons/post_commnent.png")}
                        style={{ width: 26, height: 26 }}
                        resizeMode="contain"
                      />
                      <Image
                        source={require("../assets/icons/post_repost.png")}
                        style={{ width: 26, height: 26 }}
                        resizeMode="contain"
                      />
                      <Image
                        source={require("../assets/icons/post_send.png")}
                        style={{ width: 26, height: 26 }}
                        resizeMode="contain"
                      />
                      {isActivePreviewVideo ? (
                        <TouchableOpacity
                          onPress={toggleVoice}
                          activeOpacity={0.75}
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 13,
                            overflow: "hidden",
                            borderWidth: 1,
                            borderColor: "rgba(255,255,255,0.16)",
                          }}
                        >
                          <BlurView
                            intensity={36}
                            tint="dark"
                            style={{
                              flex: 1,
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: "rgba(0,0,0,0.28)",
                            }}
                          >
                            {isVoiceEnabled ? (
                              <Volume2
                                color="white"
                                size={17}
                                strokeWidth={2.2}
                              />
                            ) : (
                              <VolumeX
                                color="white"
                                size={17}
                                strokeWidth={2.2}
                              />
                            )}
                          </BlurView>
                        </TouchableOpacity>
                      ) : null}
                    </View>

                    <View
                      style={{
                        position: "absolute",
                        left: 12,
                        bottom: 16,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <View
                        style={{
                          width: 34,
                          height: 34,
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 8,
                        }}
                      >
                        <BlurView
                          intensity={5}
                          style={{
                            position: "absolute",
                            width: 34,
                            height: 34,
                            borderRadius: 17,
                            overflow: "hidden",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Svg width={34} height={34}>
                            <Defs>
                              <SvgLinearGradient
                                id="previewReelRing"
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
                              cx={17}
                              cy={17}
                              r={16}
                              stroke="url(#previewReelRing)"
                              strokeWidth={1}
                              fill="transparent"
                            />
                          </Svg>
                        </BlurView>
                        <View
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 14,
                            overflow: "hidden",
                            backgroundColor: "#333",
                          }}
                        >
                          <Image
                            source={previewProfileSource}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 14,
                            }}
                            resizeMode={previewProfileResizeMode}
                          />
                        </View>
                      </View>
                      <Text
                        style={{
                          color: "white",
                          fontSize: 20,
                          fontWeight: "600",
                          fontFamily: "Inter",
                        }}
                      >
                        {displayUsername}
                      </Text>
                    </View>
                  </View>
                </View>
              </BlurView>
            </View>
          </View>
        ) : (
          <View
            style={{
              borderRadius: 30,
              marginHorizontal: cardHorizontalMargin,
              overflow: "hidden",
              borderWidth: 0.68,
              borderColor: "rgba(255,255,255,0.4)",
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.24,
              shadowRadius: 14,
              elevation: 8,
            }}
          >
            <BlurView
              intensity={24}
              tint="dark"
              style={{
                borderRadius: 30,
                overflow: "hidden",
              }}
            >
              <LinearGradient
                colors={["rgba(0, 0, 0, 0.4)", "rgba(0, 0, 0, 0.4)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderTopWidth: 0.68,
                  borderTopColor: "#FFFFFF66",
                  paddingTop: 10,
                  paddingBottom: 14,
                }}
              >
                {/* Post Header */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: cardInnerHorizontalPadding,
                    paddingBottom: 10,
                  }}
                >
                  {/* Profile Picture with Gradient Ring */}
                  <View
                    style={{
                      width: 42,
                      height: 42,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 10,
                    }}
                  >
                    <BlurView
                      intensity={5}
                      style={{
                        position: "absolute",
                        width: 42,
                        height: 42,
                        borderRadius: 21,
                        overflow: "hidden",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Svg width={42} height={42}>
                        <Defs>
                          <SvgLinearGradient
                            id="previewRing"
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
                          cx={21}
                          cy={21}
                          r={20}
                          stroke="url(#previewRing)"
                          strokeWidth={1}
                          fill="transparent"
                        />
                      </Svg>
                    </BlurView>
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        overflow: "hidden",
                        backgroundColor: "#333",
                      }}
                    >
                      <Image
                        source={previewProfileSource}
                        style={{ width: 36, height: 36, borderRadius: 18 }}
                        resizeMode={previewProfileResizeMode}
                      />
                    </View>
                  </View>
                  <View>
                    <Text
                      style={{
                        color: "white",
                        fontSize: 14,
                        fontWeight: "600",
                        lineHeight: 28,
                        letterSpacing: -0.89,
                        fontFamily: "Inter",
                      }}
                    >
                      {displayUsername}
                    </Text>
                  </View>
                </View>

                {/* Media Preview */}
                <View
                  style={{
                    alignSelf: "center",
                    width: mediaItemWidth,
                    aspectRatio: mediaAspectRatio,
                    borderRadius: 30,
                    overflow: "hidden",
                    backgroundColor: "#111",
                  }}
                >
                  {mediaItems.length > 1 ? (
                    <ScrollView
                      horizontal
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      onTouchStart={() => {
                        isCarouselTouchingRef.current = true;
                      }}
                      onTouchEnd={() => {
                        isCarouselTouchingRef.current = false;
                      }}
                      onTouchCancel={() => {
                        isCarouselTouchingRef.current = false;
                      }}
                      onMomentumScrollEnd={(event) => {
                        isCarouselTouchingRef.current = false;
                        const nextIndex = Math.round(
                          event.nativeEvent.contentOffset.x / mediaItemWidth,
                        );
                        setCurrentMediaIndex(
                          Math.min(
                            Math.max(nextIndex, 0),
                            mediaItems.length - 1,
                          ),
                        );
                      }}
                    >
                      {mediaItems.map((uri, idx) => (
                        <View
                          key={idx}
                          style={{
                            width: mediaItemWidth,
                            aspectRatio: mediaAspectRatio,
                          }}
                        >
                          {isVideoUrl(uri) ? (
                            <Video
                              source={{ uri }}
                              style={{ width: "100%", height: "100%" }}
                              resizeMode={previewVideoResizeMode}
                              shouldPlay
                              isLooping
                              isMuted={!isVoiceEnabled}
                            />
                          ) : (
                            <Image
                              source={{ uri }}
                              style={{ width: "100%", height: "100%" }}
                              resizeMode="cover"
                            />
                          )}
                        </View>
                      ))}
                    </ScrollView>
                  ) : mediaItems.length === 1 ? (
                    isVideoUrl(mediaItems[0]) ? (
                      <Video
                        source={{ uri: mediaItems[0] }}
                        style={{ width: "100%", height: "100%" }}
                        resizeMode={previewVideoResizeMode}
                        shouldPlay
                        isLooping
                        isMuted={!isVoiceEnabled}
                      />
                    ) : (
                      <Image
                        source={{ uri: mediaItems[0] }}
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="cover"
                      />
                    )
                  ) : null}

                  {mediaItems.length > 1 && (
                    <View
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        borderRadius: 12,
                        backgroundColor: "rgba(0,0,0,0.45)",
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                      }}
                    >
                      <Text
                        style={{
                          color: "rgba(255,255,255,0.9)",
                          fontSize: 12,
                          fontFamily: "Inter",
                          fontWeight: "500",
                        }}
                      >
                        {`${currentMediaIndex + 1}/${mediaItems.length}`}
                      </Text>
                    </View>
                  )}

                  <View
                    style={{
                      position: "absolute",
                      left: 16,
                      bottom: 16,
                      width: 30,
                      height: 30,
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      source={require("../assets/images/post_avtar.png")}
                      style={{
                        width: 30,
                        height: 30,
                      }}
                      resizeMode={previewProfileResizeMode}
                    />
                  </View>

                  {shouldShowCarouselVoiceOverlay ? (
                    <TouchableOpacity
                      onPress={toggleVoice}
                      activeOpacity={0.75}
                      style={{
                        position: "absolute",
                        right: 16,
                        bottom: 16,
                        width: 30,
                        height: 30,
                        borderRadius: 15,
                        zIndex: 30,
                        elevation: 10,
                        overflow: "hidden",
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.16)",
                      }}
                    >
                      <BlurView
                        intensity={36}
                        tint="dark"
                        style={{
                          flex: 1,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "rgba(0,0,0,0.28)",
                        }}
                      >
                        {isVoiceEnabled ? (
                          <Volume2 color="white" size={16} strokeWidth={2.2} />
                        ) : (
                          <VolumeX color="white" size={16} strokeWidth={2.2} />
                        )}
                      </BlurView>
                    </TouchableOpacity>
                  ) : null}
                </View>

                {/* Carousel Dots */}
                {mediaItems.length > 1 && (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      paddingTop: 10,
                      paddingBottom: 4,
                      gap: 6,
                    }}
                  >
                    {mediaItems.map((_, idx) => (
                      <View
                        key={idx}
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor:
                            idx === currentMediaIndex
                              ? "rgba(255,255,255,0.95)"
                              : "rgba(255,255,255,0.32)",
                        }}
                      />
                    ))}
                  </View>
                )}

                {/* Instagram Action Icons */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: 16,
                    paddingTop: 22,
                    paddingBottom: 8,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 18,
                    }}
                  >
                    <Image
                      source={require("../assets/icons/post_like.png")}
                      style={{ width: 25, height: 25 }}
                      resizeMode="contain"
                    />
                    <Image
                      source={require("../assets/icons/post_commnent.png")}
                      style={{ width: 25, height: 25 }}
                      resizeMode="contain"
                    />
                    <Image
                      source={require("../assets/icons/post_repost.png")}
                      style={{ width: 25, height: 25 }}
                      resizeMode="contain"
                    />
                    <Image
                      source={require("../assets/icons/post_send.png")}
                      style={{ width: 25, height: 25 }}
                      resizeMode="contain"
                    />
                    {isActivePreviewVideo && !isPostCarousel ? (
                      <TouchableOpacity
                        onPress={toggleVoice}
                        activeOpacity={0.75}
                        style={{
                          width: 25,
                          height: 25,
                          borderRadius: 12.5,
                          overflow: "hidden",
                          borderWidth: 1,
                          borderColor: "rgba(255,255,255,0.16)",
                        }}
                      >
                        <BlurView
                          intensity={36}
                          tint="dark"
                          style={{
                            flex: 1,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "rgba(0,0,0,0.28)",
                          }}
                        >
                          {isVoiceEnabled ? (
                            <Volume2
                              color="white"
                              size={15}
                              strokeWidth={2.2}
                            />
                          ) : (
                            <VolumeX
                              color="white"
                              size={15}
                              strokeWidth={2.2}
                            />
                          )}
                        </BlurView>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                  <Image
                    source={require("../assets/icons/post_favourite.png")}
                    style={{ width: 24, height: 24 }}
                    resizeMode="contain"
                  />
                </View>
              </LinearGradient>
            </BlurView>
          </View>
        )}

        {/* Caption Section */}
        {!isStoryPreview ? (
          <View style={{ marginHorizontal: 16, marginTop: 18 }}>
            <Text
              style={{
                color: "white",
                fontSize: 16,
                fontWeight: "600",
                fontFamily: "Inter",
                marginBottom: 12,
              }}
            >
              Caption
            </Text>

            <View
              style={{
                borderRadius: 32,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <BlurView
                intensity={14}
                tint="dark"
                style={{ backgroundColor: "#FFFFFF1A" }}
              >
                <View
                  style={{
                    minHeight: 160,
                    paddingHorizontal: 20,
                    paddingTop: 22,
                    paddingBottom: 16,
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.55)",
                      fontSize: 15,
                      fontFamily: "Inter",
                      lineHeight: 22,
                    }}
                  >
                    {caption || "Write your caption..."}
                  </Text>

                  <View
                    style={{
                      marginTop: 14,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.55)",
                        fontSize: 14,
                        fontFamily: "Inter",
                        flex: 1,
                        marginRight: 12,
                      }}
                      numberOfLines={1}
                    >
                      {hashtagText}
                    </Text>

                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setShowCaptionModal(true);
                      }}
                      style={{
                        borderRadius: 12,
                        padding: 8,
                        backgroundColor: "rgba(255,255,255,0.12)",
                        alignItems: "center",
                        justifyContent: "center",
                        shadowColor: "#000000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 6,
                      }}
                      activeOpacity={0.7}
                    >
                      <Image
                        source={require("../assets/icons/edit.png")}
                        style={{ width: 20, height: 20 }}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </BlurView>
            </View>
          </View>
        ) : null}

        {isReelPreview ? (
          <View
            style={{
              marginHorizontal: 16,
              marginTop: caption.trim() ? 16 : 18,
            }}
          >
            <TouchableOpacity
              style={{
                height: 52,
                borderRadius: 26,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255,255,255,0.1)",
              }}
              onPress={openCoverEditor}
              activeOpacity={0.85}
            >
              <Text
                style={{
                  color: "white",
                  fontFamily: "Inter",
                  fontWeight: "600",
                  fontSize: 16,
                }}
              >
                Edit cover
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Post Button */}
        <View
          style={{
            marginHorizontal: isVerticalPreview ? 0 : 16,
            width: isVerticalPreview ? reelCardWidth : undefined,
            alignSelf: isVerticalPreview ? "center" : undefined,
            marginTop: 24,
            marginBottom: Platform.OS === "ios" ? 50 : 32,
          }}
        >
          <TouchableOpacity
            style={{ height: 56, borderRadius: 28, overflow: "hidden" }}
            onPress={() => {
              handlePost();
            }}
            disabled={isPublishing}
          >
            <ImageBackground
              source={require("../assets/images/generate_post.jpg")}
              style={{
                width: "100%",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}
              resizeMode="cover"
            >
              {isPublishing ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text
                  style={{ color: "white", fontWeight: "600", fontSize: 18 }}
                >
                  Post
                </Text>
              )}
            </ImageBackground>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
                <TextInput
                  style={captionModalStyles.textInput}
                  placeholder="Write your caption..."
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  multiline
                  scrollEnabled={true}
                  value={caption}
                  onChangeText={(text) => {
                    setData((prev) =>
                      prev ? { ...prev, caption: text } : prev,
                    );
                  }}
                />

                <TouchableOpacity
                  style={captionModalStyles.collapseBtn}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowCaptionModal(false);
                  }}
                >
                  <Image
                    source={require("../assets/icons/move_out.png")}
                    style={{ width: 44, height: 44 }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>

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
                          source={require("../assets/icons/chat_ai.png")}
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
                            source={require("../assets/icons/caption_mike.png")}
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

      <Modal
        visible={showCoverModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCoverModal(false)}
      >
        <BlurView
          intensity={14}
          tint="dark"
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.45)",
          }}
        >
          <View
            style={{
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
              overflow: "hidden",
            }}
          >
            <View style={{ flex: 1, paddingTop: 4 }}>
              <View
                style={{
                  height: 60,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 20,
                }}
              >
                <TouchableOpacity
                  onPress={() => setShowCoverModal(false)}
                  style={{
                    position: "absolute",
                    left: 20,
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: "rgba(255,255,255,0.08)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X color="white" size={16} />
                </TouchableOpacity>
                <Text
                  style={{
                    color: "white",
                    fontSize: 14,
                    fontWeight: "600",
                    fontFamily: "Inter",
                  }}
                >
                  Edit cover
                </Text>
              </View>

              <View
                style={{
                  width: COVER_PREVIEW_WIDTH,
                  aspectRatio: COVER_PREVIEW_ASPECT_RATIO,
                  alignSelf: "center",
                  borderRadius: 24,
                  overflow: "hidden",
                  backgroundColor: "#080808",
                }}
              >
                {reelMediaUri ? (
                  <Video
                    ref={coverVideoRef}
                    source={{ uri: reelMediaUri }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode={ResizeMode.COVER}
                    shouldPlay={false}
                    isMuted
                    onLoad={(status: any) => {
                      const durationMs = status?.durationMillis ?? 0;
                      coverDurationMsRef.current = durationMs;
                      setCoverDurationMs(durationMs);

                      // Explicitly pause the video
                      coverVideoRef.current?.pauseAsync();

                      const nextMs = Math.min(
                        scrubberPositionMsRef.current,
                        durationMs,
                      );
                      scrubberPositionMsRef.current = nextMs;
                      setScrubberPositionMs(nextMs);
                      safeSeek(nextMs);
                    }}
                  />
                ) : null}
              </View>

              <View
                style={{
                  padding: 20,
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: "100%",
                    height: 60,
                    backgroundColor: "#1C1C1C",
                    borderRadius: 16,
                    marginBottom: 20,
                    paddingHorizontal: 2,
                    flexDirection: "row",
                    alignItems: "center",
                    position: "relative",
                  }}
                  onLayout={(event) => {
                    filmStripWidthRef.current = event.nativeEvent.layout.width;
                  }}
                  {...scrubberPanResponder.panHandlers}
                >
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: "#2A2A2A",
                      borderRadius: 16,
                    }}
                  />

                  <View
                    style={{
                      position: "absolute",
                      top: -14,
                      bottom: -14,
                      left:
                        coverDurationMs && filmStripWidthRef.current
                          ? Math.max(
                              0,
                              Math.min(
                                filmStripWidthRef.current - selectorWidth,
                                (scrubberPositionMs / coverDurationMs) *
                                  (filmStripWidthRef.current - selectorWidth),
                              ),
                            )
                          : 0,
                      width: selectorWidth,
                      borderWidth: 3,
                      borderColor: "white",
                      borderRadius: 16,
                      backgroundColor: "black",
                      zIndex: 10,
                      pointerEvents: "none",
                      overflow: "hidden",
                    }}
                  >
                    {reelMediaUri ? (
                      <Video
                        ref={thumbVideoRef}
                        source={{ uri: reelMediaUri }}
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: 13,
                        }}
                        resizeMode={ResizeMode.COVER}
                        shouldPlay={false}
                        isMuted
                      />
                    ) : null}
                  </View>
                </View>

                <TouchableOpacity
                  style={{
                    width: "100%",
                    height: 48,
                    backgroundColor: "white",
                    borderRadius: 26,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={saveCoverChanges}
                >
                  <Text
                    style={{
                      color: "black",
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </BlurView>
      </Modal>
    </View>
  );
}
