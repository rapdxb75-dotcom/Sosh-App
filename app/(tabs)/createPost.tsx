import DateTimePicker from "@react-native-community/datetimepicker";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { Upload, X } from "lucide-react-native";
import { useState } from "react";
import {
    ActivityIndicator,
    Image,
    ImageBackground,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import Toast from "react-native-toast-message";
import Header from "../../components/common/Header";
import poppyService from "../../services/api/poppy";
import storageService from "../../services/storage";

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
        height: "60%",
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

export default function CreatePost() {
    const [activeTab, setActiveTab] = useState("Post");
    const tabs = ["Post", "Reel", "Story"];

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
    const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
    const [tagInputText, setTagInputText] = useState("");

    // Derived State for Active Tab
    const activeData = tabData[activeTab as keyof typeof tabData];
    const { postType, caption, selectedPlatforms, date, media, tags } = activeData;

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
        updateActiveTab("tags", tags.filter((t: string) => t !== tagToRemove));
    };

    // AI Caption Generation Handler
    const handleGenerateCaption = async () => {
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

    const pickMedia = async () => {
        let mediaTypes = ImagePicker.MediaTypeOptions.Images;
        let allowsMultipleSelection = false;
        let selectionLimit = 1;
        let targetKey = "media";

        if (activeTab === "Post") {
            if (postType === "Carousel") {
                mediaTypes = ImagePicker.MediaTypeOptions.All;
                allowsMultipleSelection = true;
                selectionLimit = 10;
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
            quality: 1,
            allowsMultipleSelection,
            selectionLimit,
        });

        if (!result.canceled) {
            if (allowsMultipleSelection) {
                updateActiveTab(
                    targetKey,
                    result.assets.map((a) => a.uri),
                );
            } else {
                updateActiveTab(targetKey, result.assets[0].uri);
            }
        }
    };

    return (
        <View className="flex-1">
            <ScrollView
                contentContainerStyle={{ paddingBottom: 160 }}
                showsVerticalScrollIndicator={false}
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
                                        onPress={() => setActiveTab(tab)}
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
                                                                onPress={() => setPostType("Single")}
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
                                                                onPress={() => setPostType("Carousel")}
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
                                                                <ScrollView
                                                                    horizontal
                                                                    showsHorizontalScrollIndicator={false}
                                                                    className="h-40"
                                                                >
                                                                    {currentMedia.map((uri, index) => (
                                                                        <View
                                                                            key={index}
                                                                            className="relative w-40 h-40 mr-2"
                                                                        >
                                                                            <Image
                                                                                source={{ uri }}
                                                                                className="w-full h-full rounded-xl"
                                                                                resizeMode="cover"
                                                                            />
                                                                            <TouchableOpacity
                                                                                className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full"
                                                                                onPress={() => {
                                                                                    const newMedia = (
                                                                                        currentMedia as string[]
                                                                                    ).filter((_, i) => i !== index);
                                                                                    updateActiveTab(
                                                                                        "carouselMedia",
                                                                                        newMedia.length > 0 ? newMedia : null,
                                                                                    );
                                                                                }}
                                                                            >
                                                                                <X color="white" size={16} />
                                                                            </TouchableOpacity>
                                                                        </View>
                                                                    ))}
                                                                </ScrollView>
                                                            ) : (
                                                                <View>
                                                                    <TouchableOpacity
                                                                        onPress={pickMedia}
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
                                                            onPress={pickMedia}
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

                                            {/* Caption */}
                                            <Text className="input-label">Caption</Text>
                                            <View
                                                className="flex-row gap-3 mb-6"
                                                style={{ alignItems: "stretch" }}
                                            >
                                                {/* Text Input */}
                                                <View className="flex-1 glass-input">
                                                    <BlurView intensity={5} tint="light" className="p-4">
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
                                                            onPress={() => setShowCaptionModal(true)}
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
                                                                <ActivityIndicator size="small" color="#fff" />
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
                                                        >
                                                            <Image
                                                                source={require("../../assets/icons/caption_mike.png")}
                                                                style={{ width: 30, height: 30 }}
                                                                resizeMode="contain"
                                                            />
                                                        </TouchableOpacity>
                                                    </BlurView>
                                                </View>
                                            </View>

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
                                                            className="flex-row items-center bg-[#FFFFFF1A] px-3 py-1.5 rounded-full"
                                                        >
                                                            <Text className="text-white font-inter text-sm mr-2">
                                                                @{tag}
                                                            </Text>
                                                            <TouchableOpacity
                                                                onPress={() => handleRemoveTag(tag)}
                                                                className="bg-black/30 rounded-full p-0.5"
                                                            >
                                                                <X color="white" size={14} />
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
                                    className="w-full h-14 overflow-hidden rounded-full mb-10"
                                    onPress={() =>
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                                    }
                                >
                                    <ImageBackground
                                        source={require("../../assets/images/generate_post1.png")}
                                        className="w-full h-full items-center justify-center"
                                        resizeMode="cover"
                                    >
                                        <View className="absolute inset-0" />
                                        <Text className="text-white font-semibold text-lg">
                                            Generate Post
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
                                    onPress={() => setShowDatePicker(false)}
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
                animationType="fade"
                onRequestClose={() => setShowCaptionModal(false)}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <BlurView
                        intensity={14}
                        tint="light"
                        style={captionModalStyles.overlay}
                    >
                        <KeyboardAvoidingView
                            behavior={Platform.OS === "ios" ? "padding" : "height"}
                            style={{
                                width: "100%",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <View style={captionModalStyles.card}>
                                <View style={captionModalStyles.cardInner}>
                                    {/* Text Input Area */}
                                    <TextInput
                                        style={captionModalStyles.textInput}
                                        placeholder="Write your caption..."
                                        placeholderTextColor="rgba(255,255,255,0.4)"
                                        multiline
                                        scrollEnabled={true}
                                        autoFocus
                                        value={caption}
                                        onChangeText={setCaption}
                                    />

                                    {/* Collapse Button Top Right */}
                                    <TouchableOpacity
                                        style={captionModalStyles.collapseBtn}
                                        onPress={() => setShowCaptionModal(false)}
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
                                            onPress={() => setShowCaptionModal(false)}
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
                                            <TouchableOpacity style={captionModalStyles.iconBtn}>
                                                <Image
                                                    source={require("../../assets/icons/caption_mike.png")}
                                                    style={{ width: 44, height: 44 }}
                                                    resizeMode="contain"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </KeyboardAvoidingView>
                    </BlurView>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}
