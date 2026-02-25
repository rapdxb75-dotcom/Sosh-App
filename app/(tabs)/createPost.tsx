import DateTimePicker from "@react-native-community/datetimepicker";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Image as ExpoImage } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Plus, Upload, X } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ImageBackground,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
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

export default function CreatePost() {
    const [activeTab, setActiveTab] = useState("Post");
    const { width } = useWindowDimensions();
    const { addNotification } = useNotification();
    const tabs = ["Post", "Reel", "Story"];

    // The available width for the carousel is screen width minus outer horizontal padding:
    // px-5 (20px) + glass-card-gradient (20px) = 40px on each side = 80px total.
    const containerWidth = width - 80;
    // We want 4px space on all sides of each image.
    // Each item-slot (1/3 of container) will have 4px padding.
    const paddingEdge = 4;
    const itemWidth = containerWidth / 3;

    // Tab Data State
    const [tabData, setTabData] = useState({
        Post: {
            postType: "Single",
            caption: "",
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
            tags: [] as string[],
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
            media: null as string | null,
            tags: [] as string[],
        },
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showCaptionModal, setShowCaptionModal] = useState(false);
    const [showCoverModal, setShowCoverModal] = useState(false);
    const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [tagInputText, setTagInputText] = useState("");
    const [isListening, setIsListening] = useState(false);

    // Derived State for Active Tab
    const activeData = tabData[activeTab as keyof typeof tabData];
    const { postType, caption, selectedPlatforms, date, media, tags } =
        activeData;
    const cover_img = (activeData as any).cover_img;

    let currentMedia = media;
    if (activeTab === "Post") {
        currentMedia =
            postType === "Single"
                ? (activeData as any).singleMedia
                : (activeData as any).carouselMedia;
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
    const setCaption = (value: string) => updateActiveTab("caption", value);

    // Setup React Native Voice Listeners
    const activeTabRef = useRef(activeTab);
    useEffect(() => {
        activeTabRef.current = activeTab;
    }, [activeTab]);

    useEffect(() => {
        if (!Voice) return; // Skip in Expo Go

        Voice.onSpeechResults = (event: any) => {
            if (event.value && event.value.length > 0) {
                // Update specific active tab without relying on closure
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

        Voice.onSpeechError = (error: any) => {
            console.log("Voice Error:", error);
            setIsListening(false);
        };

        return () => {
            if (Voice) {
                Voice.destroy().then(Voice.removeAllListeners).catch(console.error);
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
            setIsListening(false);
        } catch (e) {
            console.log("Stop Voice Error:", e);
            setIsListening(false);
        }
    };

    const handleAddTag = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const trimmed = tagInputText.trim();
        if (trimmed && tags && !tags.includes(trimmed)) {
            updateActiveTab("tags", [...tags, trimmed]);
            setTagInputText("");
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        updateActiveTab(
            "tags",
            tags.filter((t: string) => t !== tagToRemove),
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

            // The images are already in base64 format starting with data:image/jpeg;base64,... due to pickMedia logic
            let mediaBase64: string | string[] = "";
            if (isCarousel) {
                mediaBase64 = currentMedia as unknown as string[];
            } else {
                mediaBase64 = currentMedia as string;
            }

            const activePlatforms = Object.entries(selectedPlatforms)
                .filter(([_, isSelected]) => isSelected)
                .map(([platform]) => platform);

            await createPostService.createPost(
                caption,
                tags,
                activePlatforms,
                !date, // publishNow is true if no date is selected
                isCarousel,
                mediaBase64,
                date
            );

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
                // Video logic mapping
                mediaTypes = ImagePicker.MediaTypeOptions.Videos;
            }
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes,
            allowsEditing: !allowsMultipleSelection,
            shape: "rectangle",
            quality: 0.5, // Reduced quality for smaller robust base64 payload
            allowsMultipleSelection,
            selectionLimit,
            base64: true,
        });

        if (!result.canceled) {
            if (allowsMultipleSelection) {
                // Return base64 images if available, otherwise just try to get it using FileSystem if needed
                // It's much safer to just use ImagePicker's `base64` option as requested by the user. "pass image same as update profile"
                const newUris = result.assets.map((a) => a.base64 ? `data:image/jpeg;base64,${a.base64}` : a.uri);
                if (isAppending && Array.isArray(currentMedia)) {
                    updateActiveTab(targetKey, [...currentMedia, ...newUris]);
                } else {
                    updateActiveTab(targetKey, newUris);
                }
            } else {
                const asset = result.assets[0];
                updateActiveTab(targetKey, asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri);
            }
        }
    };

    return (
        <View className="flex-1">
            <ScrollView
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
                                                                                                <Image
                                                                                                    source={{ uri: item.uri }}
                                                                                                    className="w-full h-full rounded-xl"
                                                                                                    resizeMode="cover"
                                                                                                />
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
                                                                <View>
                                                                    <TouchableOpacity
                                                                        onPress={() => pickMedia(false)}
                                                                        activeOpacity={0.9}
                                                                    >
                                                                        <Image
                                                                            source={{ uri: currentMedia }}
                                                                            className="w-full h-40"
                                                                            resizeMode="contain"
                                                                        />
                                                                    </TouchableOpacity>
                                                                    <TouchableOpacity
                                                                        onPress={() =>
                                                                            updateActiveTab(
                                                                                activeTab === "Post"
                                                                                    ? "singleMedia"
                                                                                    : "media",
                                                                                null,
                                                                            )
                                                                        }
                                                                        className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full"
                                                                    >
                                                                        <X color="white" size={16} />
                                                                    </TouchableOpacity>
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
                                                                    {postType === "Carousel" ? "(up to 10)" : ""}
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
                                            {tags && tags.length > 0 && (
                                                <View className="flex-row flex-wrap gap-2 mb-6 mt-[-8px]">
                                                    {tags.map((tag: string, index: number) => (
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
                                                    .filter((p) =>
                                                        activeTab === "Reel" || activeTab === "Story"
                                                            ? ["instagram", "tiktok", "youtube"].includes(p.id)
                                                            : true,
                                                    )
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

                            {/* Preview */}
                            <View style={coverModalStyles.previewContainer}>
                                <ExpoImage
                                    source={
                                        cover_img || media
                                            ? { uri: cover_img || media }
                                            : require("../../assets/images/cover_img.png")
                                    }
                                    style={coverModalStyles.previewImage}
                                    contentFit="cover"
                                    cachePolicy="memory-disk"
                                    transition={200}
                                />
                            </View>

                            <View style={{ height: 444 }} />

                            {/* Bottom Controls */}
                            <View style={coverModalStyles.bottomSection}>
                                <View style={coverModalStyles.filmStrip}>
                                    {/* Placeholder for video frames */}
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <View
                                            key={i}
                                            style={{
                                                flex: 1,
                                                backgroundColor: "rgba(255,255,255,0.05)",
                                                marginHorizontal: 1,
                                                borderRadius: 4,
                                            }}
                                        />
                                    ))}
                                    {/* Selected frame indicator highlight */}
                                    <View
                                        style={{
                                            position: "absolute",
                                            right: 40,
                                            top: -12,
                                            bottom: -12,
                                            width: 72,
                                            borderWidth: 2,
                                            borderColor: "white",
                                            borderRadius: 16,
                                            backgroundColor: "#000",
                                            overflow: "hidden",
                                            zIndex: 10,
                                        }}
                                    >
                                        <ExpoImage
                                            source={
                                                cover_img || media
                                                    ? { uri: cover_img || media }
                                                    : require("../../assets/images/cover_img.png")
                                            }
                                            style={{ width: "100%", height: "100%" }}
                                            contentFit="cover"
                                            cachePolicy="memory-disk"
                                        />
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
