import DateTimePicker from "@react-native-community/datetimepicker";
import { ResizeMode, Video } from "expo-av";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Image as ExpoImage } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "expo-router";
import { Plus, Upload, X } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ImageBackground,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    PanResponder,
    PermissionsAndroid,
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
import { DraggableGrid } from "react-native-draggable-grid";
import Svg, {
    Circle,
    Defs,
    Stop,
    LinearGradient as SvgLinearGradient,
} from "react-native-svg";
import Toast from "react-native-toast-message";
import Header from "../../components/common/Header";
import { useNotification } from "../../context/NotificationContext";
import createPostService from "../../services/api/createPost";
import poppyService from "../../services/api/poppy";
import storageService from "../../services/storage";

let Voice: any = null;
try {
    Voice = require("@react-native-voice/voice").default;
} catch (e) {
    console.log("React Native Voice is not available in Expo Go.");
}

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
    return lower.endsWith('.mp4') || lower.endsWith('.mov') || lower.startsWith('data:video');
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
            tiktok: true,
            youtube: false,
            snapchat: false,
            x: false,
            facebook: true,
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
            instagram: true,
            tiktok: true,
            youtube: true,
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
            instagram: true,
            tiktok: true,
            youtube: true,
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

export default function CreatePost() {
    const [activeTab, setActiveTab] = useState("Post");
    const { width } = useWindowDimensions();
    const { addNotification } = useNotification();
    const scrollViewRef = useRef<ScrollView>(null);

    // Scroll to top whenever this screen comes into focus
    useFocusEffect(
        useCallback(() => {
            scrollViewRef.current?.scrollTo({ y: 0, animated: false });
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
        ? previewWidth * (16 / 9)   // 9:16 tall
        : previewWidth * (5 / 4);   // 4:5 portrait

    // Tab Data State
    const [tabData, setTabData] = useState(INITIAL_TAB_DATA);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showCaptionModal, setShowCaptionModal] = useState(false);
    const [showCoverModal, setShowCoverModal] = useState(false);
    const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [tagInputText, setTagInputText] = useState("");
    const [isListening, setIsListening] = useState(false);

    // Cover scrubber — all mutable values in refs so PanResponder never has stale closures
    const coverVideoRef = useRef<any>(null);
    const thumbVideoRef = useRef<any>(null);
    const coverDurationMsRef = useRef(0);
    const scrubberPositionMsRef = useRef(0);
    const dragStartPositionMsRef = useRef(0);
    const isSeekingRef = useRef(false);          // prevent concurrent seeks
    const [coverDurationMs, setCoverDurationMs] = useState(0);
    const [scrubberPositionMs, setScrubberPositionMs] = useState(0);
    const filmStripWidth = useRef(0);
    const SELECTOR_WIDTH = 76;

    // Safe seek: silently skips if a seek is already in flight
    const safeSeek = (ms: number) => {
        if (!coverVideoRef.current || isSeekingRef.current) return;
        isSeekingRef.current = true;

        const promises = [coverVideoRef.current.setPositionAsync(ms)];
        if (thumbVideoRef.current) {
            promises.push(thumbVideoRef.current.setPositionAsync(ms));
        }

        Promise.all(promises)
            .catch(() => { })          // suppress "Seeking interrupted"
            .finally(() => { isSeekingRef.current = false; });
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
                safeSeek(newMs);        // skips if previous seek not done yet
            },
            // Final precise sync on release based on AV player's actual rest position
            onPanResponderRelease: async () => {
                isSeekingRef.current = false;
                if (!coverVideoRef.current) return;
                try {
                    // Force the actual native module to report back where it stopped
                    const status = await coverVideoRef.current.getStatusAsync();
                    if (status.isLoaded && typeof status.positionMillis === 'number') {
                        const actualMs = status.positionMillis;
                        scrubberPositionMsRef.current = actualMs;
                        setScrubberPositionMs(actualMs);
                        if (thumbVideoRef.current) {
                            thumbVideoRef.current.setPositionAsync(actualMs).catch(() => { });
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
        })
    ).current;

    // Derived State for Active Tab
    const activeData = tabData[activeTab as keyof typeof tabData];
    const { postType, selectedPlatforms, date, media, tags, thumbNailOffset } =
        activeData as any;
    const cover_img = (activeData as any).cover_img;

    // caption & tags are per-postType for Post, shared for Reel/Story
    const caption =
        activeTab === "Post"
            ? (postType === "Single"
                ? (activeData as any).singleCaption
                : (activeData as any).carouselCaption)
            : (activeData as any).caption;

    const activeTags: string[] =
        activeTab === "Post"
            ? (postType === "Single"
                ? (activeData as any).singleTags
                : (activeData as any).carouselTags)
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
    const setCaption = (value: string) => {
        if (activeTab === "Post") {
            updateActiveTab(postType === "Single" ? "singleCaption" : "carouselCaption", value);
        } else {
            updateActiveTab("caption", value);
        }
    };

    // Setup React Native Voice Listeners
    const activeTabRef = useRef(activeTab);
    useEffect(() => {
        activeTabRef.current = activeTab;
    }, [activeTab]);

    useEffect(() => {
        if (!Voice) return; // Skip in Expo Go

        // Final recognised results — commit to caption
        Voice.onSpeechResults = (event: any) => {
            if (event.value && event.value.length > 0) {
                setTabData((prev) => {
                    const currentTab = activeTabRef.current;
                    return {
                        ...prev,
                        [currentTab]: {
                            ...prev[currentTab as keyof typeof prev],
                            caption: event.value[0],
                        },
                    };
                });
            }
        };

        // Partial results — show live feedback while user is still speaking
        Voice.onSpeechPartialResults = (event: any) => {
            if (event.value && event.value.length > 0) {
                setTabData((prev) => {
                    const currentTab = activeTabRef.current;
                    return {
                        ...prev,
                        [currentTab]: {
                            ...prev[currentTab as keyof typeof prev],
                            caption: event.value[0],
                        },
                    };
                });
            }
        };

        // Speech ended (naturally or via stop) — always reset listening state
        Voice.onSpeechEnd = () => {
            setIsListening(false);
        };

        Voice.onSpeechError = (error: any) => {
            console.log("Voice Error:", error);
            setIsListening(false);
        };

        // Only remove listeners on unmount, do NOT destroy the module —
        // destroying it makes Voice unusable for the lifetime of the app.
        return () => {
            if (Voice) {
                Voice.removeAllListeners();
            }
        };
    }, []);

    const startListening = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (!Voice) {
            Toast.show({
                type: "error",
                text1: "Not Supported",
                text2: "Voice search requires a Custom Development Build.",
            });
            return;
        }
        try {
            if (Platform.OS === "android") {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    Toast.show({
                        type: "error",
                        text1: "Permission Denied",
                        text2: "Microphone access is required for voice search.",
                    });
                    return;
                }
            }
            setIsListening(true);
            await Voice.start("en-IN");
        } catch (e) {
            console.log("Start Voice Error:", e);
            setIsListening(false);
        }
    };

    const stopListening = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (!Voice) return;
        try {
            await Voice.stop();
            // onSpeechEnd will fire and set isListening to false;
            // set it here too as a safety fallback for edge cases.
            setIsListening(false);
        } catch (e) {
            console.log("Stop Voice Error:", e);
            setIsListening(false);
        }
    };

    const handleAddTag = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const trimmed = tagInputText.trim();
        const tagKey = activeTab === "Post"
            ? (postType === "Single" ? "singleTags" : "carouselTags")
            : "tags";
        if (trimmed && activeTags && !activeTags.includes(trimmed)) {
            updateActiveTab(tagKey, [...activeTags, trimmed]);
            setTagInputText("");
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const tagKey = activeTab === "Post"
            ? (postType === "Single" ? "singleTags" : "carouselTags")
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

            Toast.show({
                type: "success",
                text1: "Caption Generated",
                text2: "AI caption generated successfully",
            });

            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (error) {
            console.error("Caption generation error:", error);
            Toast.show({
                type: "error",
                text1: "Generation Failed",
                text2: "Failed to generate caption. Please try again.",
            });
        } finally {
            setIsGeneratingCaption(false);
        }
    };

    const handleGeneratePost = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        if (!currentMedia || (Array.isArray(currentMedia) && currentMedia.length === 0)) {
            Toast.show({
                type: "error",
                text1: "Media Required",
                text2: "Please attach media before generating post",
            });
            return;
        }

        try {
            setIsPublishing(true);
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

            const processMediaForUpload = (mediaItem: string) => {
                if (mediaItem.startsWith("data:")) {
                    return mediaItem; // Probably still base64 for images
                }
                if (mediaItem.startsWith("file://")) {
                    const ext = mediaItem.split('.').pop()?.toLowerCase() || 'jpg';
                    const isVideo = ext === 'mp4' || ext === 'mov';
                    let mimeType = 'image/jpeg';
                    if (isVideo) {
                        mimeType = ext === 'mov' ? 'video/quicktime' : 'video/mp4';
                    } else if (ext === 'png') {
                        mimeType = 'image/png';
                    } else if (ext === 'webp') {
                        mimeType = 'image/webp';
                    }
                    const fileName = mediaItem.split('/').pop() || `upload.${ext}`;

                    return {
                        uri: mediaItem,
                        type: mimeType,
                        name: fileName
                    } as any;
                }
                return mediaItem;
            };

            let mediaPayload: any | any[] = "";
            if (isCarousel) {
                mediaPayload = (currentMedia as unknown as string[]).map(processMediaForUpload);
            } else {
                mediaPayload = processMediaForUpload(currentMedia as string);
            }

            const activePlatforms = Object.entries(selectedPlatforms)
                .filter(([_, isSelected]) => isSelected)
                .map(([platform]) => platform);

            if (activeTab === "Reel") {
                await createPostService.createReel(
                    caption,
                    activeTags,
                    activePlatforms,
                    !date,
                    mediaPayload as any,
                    date,
                    thumbNailOffset || 0
                );
            } else if (activeTab === "Story") {
                const email = await storageService.getEmail();
                await createPostService.createStory(
                    email || "",
                    activePlatforms,
                    !date,
                    mediaPayload as any
                );
            } else if (activeTab === "Post" && isCarousel) {
                await createPostService.createCarousel(
                    caption,
                    activeTags,
                    activePlatforms,
                    Array.isArray(mediaPayload) ? mediaPayload : [mediaPayload]
                );
            } else {
                await createPostService.createPost(
                    caption,
                    activeTags,
                    activePlatforms,
                    !date,
                    isCarousel,
                    mediaPayload,
                    date
                );
            }

            addNotification({
                type: "success",
                title: "Post Generated",
                message: "Your post has been created successfully",
            });
            Toast.show({
                type: "success",
                text1: "Post Generated",
                text2: "Your post has been created successfully",
            });

            // Clear all fields upon successful publish
            setTabData(INITIAL_TAB_DATA);
            setTagInputText("");
        } catch (error) {
            console.error("Post generation error:", error);
            addNotification({
                type: "error",
                title: "Generation Failed",
                message: "Failed to create post. Please try again.",
            });
            Toast.show({
                type: "error",
                text1: "Generation Failed",
                text2: "Failed to create post. Please try again.",
            });
        } finally {
            setIsPublishing(false);
        }
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

    const pickCoverImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [9, 16],
            quality: 1,
        });

        if (!result.canceled) {
            updateActiveTab("cover_img", result.assets[0].uri);
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
            allowsEditing: !allowsMultipleSelection,
            shape: "rectangle",
            quality: 0.5,
            allowsMultipleSelection,
            selectionLimit,
        });

        if (!result.canceled) {
            if (allowsMultipleSelection) {
                const newUris = result.assets.map((a) => a.uri);
                if (isAppending && Array.isArray(currentMedia)) {
                    updateActiveTab(targetKey, [...currentMedia, ...newUris]);
                } else {
                    updateActiveTab(targetKey, newUris);
                }
            } else {
                const asset = result.assets[0];
                updateActiveTab(targetKey, asset.uri);
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
                            <>
                                <View
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
                                                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
                                                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
                                                                                                        style={{ width: '100%', height: '100%', borderRadius: 12 }}
                                                                                                        resizeMode={ResizeMode.COVER}
                                                                                                        shouldPlay
                                                                                                        isLooping
                                                                                                        isMuted
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
                                                                                            </View>
                                                                                        </View>
                                                                                    );
                                                                                }}
                                                                            />
                                                                        </View>
                                                                    );
                                                                })()
                                                            ) : (
                                                                <View style={{ padding: 14, alignItems: 'center' }}>
                                                                    <View
                                                                        style={{
                                                                            width: previewWidth,
                                                                            height: previewHeight,
                                                                            borderRadius: 16,
                                                                            overflow: 'hidden',
                                                                        }}
                                                                    >
                                                                        {isVideoUrl(currentMedia) ? (
                                                                            <Video
                                                                                source={{ uri: currentMedia as string }}
                                                                                style={{ width: '100%', height: '100%' }}
                                                                                resizeMode={ResizeMode.COVER}
                                                                                shouldPlay
                                                                                isLooping
                                                                                isMuted
                                                                            />
                                                                        ) : (
                                                                            <Image
                                                                                source={{ uri: currentMedia as string }}
                                                                                style={{ width: '100%', height: '100%' }}
                                                                                resizeMode="cover"
                                                                            />
                                                                        )}
                                                                        <TouchableOpacity
                                                                            style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.8)', padding: 6, borderRadius: 100 }}
                                                                            onPress={() =>
                                                                                updateActiveTab(
                                                                                    activeTab === "Post"
                                                                                        ? "singleMedia"
                                                                                        : activeTab === "Story"
                                                                                            ? postType === "Single" ? "photoMedia" : "videoMedia"
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
                                                                    {postType === "Carousel" && activeTab !== "Story" ? "(up to 10)" : ""}
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
                                                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
                                                                </TouchableOpacity>
                                                            </BlurView>
                                                        </View>
                                                    </View>
                                                </>
                                            )}

                                            {/* Tags */}
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
                                        </View>
                                    </BlurView>
                                </View>

                                {/* Second Card: Post Settings */}
                                <View
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
                                            <View className="post-on-container">
                                                {[
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
                                                ]
                                                    .filter((p) => {
                                                        if (activeTab === "Post" && postType === "Carousel") {
                                                            return ["instagram", "facebook"].includes(p.id);
                                                        }
                                                        if (activeTab === "Reel") {
                                                            return ["instagram", "tiktok", "youtube", "snapchat", "facebook"].includes(p.id);
                                                        }
                                                        if (activeTab === "Story") {
                                                            return ["instagram", "snapchat", "facebook"].includes(p.id);
                                                        }
                                                        return true;
                                                    })
                                                    .map((platform) => {
                                                        const isSelected = selectedPlatforms[platform.id];
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
                                                    })}
                                            </View>
                                        </View>
                                    </BlurView>
                                </View>

                                {/* Third Card: Schedule */}
                                <View
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
                                    onPress={handleGeneratePost}
                                    disabled={isPublishing}
                                >
                                    <ImageBackground
                                        source={require("../../assets/images/generate_post.jpg")}
                                        className="w-full h-full items-center justify-center"
                                        resizeMode="cover"
                                    >
                                        <View className="absolute inset-0" />
                                        {isPublishing ? (
                                            <ActivityIndicator size="small" color="#ffffff" />
                                        ) : (
                                            <Text className="text-white font-semibold text-lg">
                                                Generate post
                                            </Text>
                                        )}
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
                                    onPress={() =>
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                                    }
                                >
                                    <ImageBackground
                                        source={require("../../assets/images/post_without.jpg")}
                                        className="w-full h-full items-center justify-center"
                                        resizeMode="cover"
                                    >
                                        <View className="absolute inset-0" />
                                        <Text className="text-white font-semibold text-lg">
                                            Post without viewing
                                        </Text>
                                    </ImageBackground>
                                </TouchableOpacity>
                            </>
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
                        <BlurView intensity={14} tint="light" style={StyleSheet.absoluteFillObject} />

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
                                    <View style={{ width: 27, height: 27, alignItems: "center", justifyContent: "center" }}>
                                        <Svg width={27} height={27}>
                                            <Defs>
                                                <SvgLinearGradient id="closeBtnGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                                                    <Stop offset="50%" stopColor="#000000" stopOpacity="1" />
                                                    <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
                                                </SvgLinearGradient>
                                            </Defs>
                                            <Circle cx={13.5} cy={13.5} r={13} stroke="url(#closeBtnGrad)" strokeWidth={1} fill="transparent" />
                                        </Svg>
                                        <View style={{ position: "absolute", width: 23, height: 23, borderRadius: 11.5, backgroundColor: "#0A0A0A", alignItems: "center", justifyContent: "center", top: 2, left: 2 }}>
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
                                        source={cover_img ? { uri: cover_img } : require("../../assets/images/cover_img.png")}
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
                                    onLayout={(e) => { filmStripWidth.current = e.nativeEvent.layout.width; }}
                                    {...scrubberPan.panHandlers}
                                >
                                    {/* Film strip track — just a solid background now */}
                                    <View style={{ flex: 1, backgroundColor: "#2A2A2A", borderRadius: 16 }} />

                                    {/* Selector window — matches screenshot with video preview inside */}
                                    <View
                                        style={{
                                            position: "absolute",
                                            top: -14,
                                            bottom: -14,
                                            left: coverDurationMs && filmStripWidth.current
                                                ? Math.max(0, Math.min(
                                                    filmStripWidth.current - SELECTOR_WIDTH,
                                                    (scrubberPositionMs / coverDurationMs) * (filmStripWidth.current - SELECTOR_WIDTH)
                                                ))
                                                : 0,
                                            width: SELECTOR_WIDTH,
                                            borderWidth: 3,
                                            borderColor: "white",
                                            borderRadius: 16,
                                            backgroundColor: "black",
                                            zIndex: 10,
                                            pointerEvents: "none",
                                            overflow: "hidden"
                                        }}
                                    >
                                        {currentMedia ? (
                                            <Video
                                                ref={thumbVideoRef}
                                                source={{ uri: currentMedia as string }}
                                                style={{ width: "100%", height: "100%", borderRadius: 13 }}
                                                resizeMode={ResizeMode.COVER}
                                                shouldPlay={false}
                                                isMuted
                                            />
                                        ) : (
                                            <ExpoImage
                                                source={cover_img ? { uri: cover_img } : require("../../assets/images/cover_img.png")}
                                                style={{ width: "100%", height: "100%", borderRadius: 13 }}
                                                contentFit="cover"
                                                cachePolicy="memory-disk"
                                            />
                                        )}
                                    </View>
                                </View>

                                <TouchableOpacity onPress={pickCoverImage}>
                                    <Text style={coverModalStyles.uploadText}>
                                        or{" "}
                                        <Text style={coverModalStyles.uploadLink}>Upload image</Text>
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
