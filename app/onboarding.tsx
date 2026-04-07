import { FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { ArrowLeft, ArrowRight, Check, Mic } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import { FontFamily, normalize } from "../constants/Fonts";
import { useNotification } from "../context/NotificationContext";
import authService from "../services/api/auth";
import storageService from "../services/storage";
import { RootState } from "../store/store";
import { clearUserData, setUserData } from "../store/userSlice";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const STEPS = [
  {
    id: 1,
    title: "Tell Us About Your Brand",
    description:
      "In a few sentences, tell us about your brand or business. What's your niche, what do you do, and what's your mission or purpose behind it all?",
    subtitle: "Section 1: Your Business",
    type: "textarea",
    placeholder: "Tell your story here...",
    key: "brandDescription",
  },
  {
    id: 2,
    title: "Who Is Your Audience?",
    subtitle: "Section 1: Your Business",
    type: "mixed",
    key: "audience",
    parts: [
      {
        id: "2a",
        label:
          "What age range best describes your target audience? (Select all that apply)",
        type: "multi-select-chips",
        options: [
          "👶 Under 18",
          "🎓 18-24",
          "💼 25-34",
          "🏠 35-44",
          "🏢 45-54",
          "👴 55+",
        ],
      },
      {
        id: "2b",
        label:
          "Describe your ideal follower in 1-2 sentences. Who are they and what do they care about?",
        type: "textarea",
        placeholder: "Who are they and what do they care about?",
      },
    ],
  },
  {
    id: 3,
    title: "Your Social Media Presence",
    subtitle: "Section 1: Your Business",
    type: "mixed",
    key: "social media",
    parts: [
      {
        id: "3a",
        label:
          "Select the platforms you're active on and your approximate follower count",
        type: "platform-select",
        options: [
          "Instagram",
          "TikTok",
          "YouTube",
          "X",
          "Facebook",
          "LinkedIn",
          "Snapchat",
        ],
      },
      {
        id: "3b",
        label: "What's your #1 social media goal right now?",
        type: "textarea",
        placeholder: "e.g. 50 new clients, 10k followers...",
      },
    ],
  },
  {
    id: 4,
    title: "Your Brand Personality",
    description:
      "Pick up to 5 words that best describe your brand's personality.",
    subtitle: "Section 2: Your Personality",
    type: "multi-select",
    key: "brandPersonality",
    options: [
      "✨ Fun / Playful",
      "🔥 Bold / Controversial",
      "👔 Professional / Polished",
      "💎 Luxurious / Premium",
      "📚 Educational / Informative",
      "🤓 Nerdy / Technical",
      "🌈 Inspirational / Motivational",
      "😏 Witty / Sarcastic",
      "🎬 Raw / Unfiltered",
      "🍃 Calm / Chill",
      "🤝 Friendly / Approachable",
      "⚡ High Energy / Hype",
    ],
    limit: 5,
  },
  {
    id: 5,
    title: "Your Content Style",
    subtitle: "Section 2: Your Personality",
    type: "mixed",
    key: "contentStyle",
    parts: [
      {
        id: "5a",
        label:
          "What types of content do you post or plan to post? (Select all that apply)",
        type: "multi-select-chips",
        options: [
          "🎓 Tutorials / How-tos",
          "🤣 Memes / Funny Skits",
          "🏗️ Behind the Scenes",
          "📖 Personal Stories",
          "🤳 Vlogs / Day-in-the-Life",
          "🛍️ Product Showcases",
          "💡 Tips & Advice",
          "🌍 News / Updates",
          "🎙️ Interviews / Talks",
          "💪 Motivational",
          "🔥 Reviews / Hot Takes",
          "📝 Storytelling",
          "📼 Raw / Unedited Clips",
          "✨ Lifestyle / Aesthetic",
          "📽️ Cinematic",
          "❓ Other",
        ],
      },
      {
        id: "5b",
        label: "What makes your content different from others in your niche?",
        type: "textarea",
        placeholder:
          "Example: I use a professional Sony camera while most people in my niche only shoot on iPhones...",
      },
    ],
  },
  {
    id: 6,
    title: "The Feeling You Create",
    description:
      "When people watch your content, how do you want them to feel? (Select up to 3)",
    subtitle: "Section 2: Your Personality",
    type: "multi-select",
    key: "audienceFeeling",
    options: [
      "🚀 Inspired to chase something",
      "🧠 Like they learned something new",
      "😂 Entertained / Laughing",
      "⚡ Motivated to take action",
      "👀 FOMO — they wish they were there",
      "🤝 Part of a community",
      "💪 Empowered / Confident",
      "🧘 Relaxed / At peace",
      "🤔 Curious / Wanting more",
      "🤩 Impressed / In awe",
    ],
    limit: 3,
  },
  {
    id: 7,
    title: "Your Language and Boundaries",
    subtitle: "Section 3: The Details",
    type: "mixed",
    key: "languageBoundaries",
    parts: [
      {
        id: "7a",
        label:
          "Do you use any specific slang, catchphrases, or language your audience would recognize?",
        type: "textarea",
        placeholder: "Example: I use Chicago slang, say 'y'all' a lot...",
      },
      {
        id: "7b",
        label:
          "Are there any topics, themes, or content styles you want to AVOID?",
        type: "textarea",
        placeholder: "Example: I don't talk about politics or religion...",
      },
    ],
  },
  {
    id: 8,
    title: "Your Competitive Landscape",
    subtitle: "Section 3: The Details",
    type: "mixed",
    key: "competitors",
    parts: [
      {
        id: "8a",
        label:
          "Name 2-3 competitors or creators in your niche that you pay attention to.",
        type: "textarea",
        placeholder: "Example: @houseofjandra, @whatsgoodchicago...",
      },
      {
        id: "8b",
        label: "What do they do well on social media that you respect?",
        type: "textarea",
        placeholder: "Example: They all post consistently almost every day...",
      },
      {
        id: "8c",
        label: "What do YOU do better, or what sets you apart from them?",
        type: "textarea",
        placeholder: "Example: My visuals are way stronger...",
      },
    ],
  },
  {
    id: 9,
    title: "Caption Style",
    subtitle: "Section 4 : Your Caption Preferences",
    type: "mixed",
    key: "captionStyle",
    parts: [
      {
        id: "9a",
        label: "How long do you like your captions?",
        type: "select",
        options: [
          "⚡ Short & punchy",
          "📝 Medium — a few sentences",
          "📖 Long-form — full stories",
          "🔀 Depends on the post",
        ],
      },
      {
        id: "9b",
        label: "How do you feel about emojis in your captions?",
        type: "select",
        options: [
          "😍 Love them — use them freely",
          "⚖️ A few here and there",
          "🚫 Minimal to none",
          "🎭 Match the vibe of each post",
        ],
      },
    ],
  },
  {
    id: 10,
    title: "How You Engage",
    subtitle: "Section 4 : Your Caption Preferences",
    type: "mixed",
    key: "engagement",
    parts: [
      {
        id: "10a",
        label: "How do you like to end your captions?",
        type: "select",
        options: [
          "❓ Ask a question",
          "📣 Call to action (like/follow)",
          "🔗 Direct elsewhere (link in bio)",
          "🗳️ Use a poll or 'this or that'",
          "🙊 No CTA — let content speak",
          "🔀 Mix it up",
        ],
      },
      {
        id: "10b",
        label: "What do you like the body of your captions to sound like?",
        type: "select",
        options: [
          "💭 Personal thought or story",
          "📽️ Describe what's happening",
          "🗣️ Start a debate",
          "💡 Share tips, value, or info",
          "➖ Keep it minimal",
        ],
      },
    ],
  },
];

export default function Onboarding() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { addNotification } = useNotification();
  const registrationBuffer = useSelector(
    (state: RootState) => state.user.registrationBuffer,
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [loading, setLoading] = useState(false);

  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const stepData = STEPS[currentStep];

  const handleNext = async () => {
    Haptics.selectionAsync();
    setDirection("forward");
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final Finish
      if (loading) return;

      if (!registrationBuffer) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Registration data not found. Please try signing up again.",
        });
        router.replace("/signup");
        return;
      }

      try {
        setLoading(true);

        const onboardingData = {
          step1: { brandDescription: answers["brandDescription"] || "" },
          step2: {
            targetAudienceAge: answers["audience"]?.["2a"] || [],
            idealFollowerDescription: answers["audience"]?.["2b"] || "",
          },
          step3: {
            activePlatforms: answers["social media"]?.["3a"] || {},
            primaryGoal: answers["social media"]?.["3b"] || "",
          },
          step4: { brandPersonalityTraits: answers["brandPersonality"] || [] },
          step5: {
            contentCategories: answers["contentStyle"]?.["5a"] || [],
            competitiveDifferentiator: answers["contentStyle"]?.["5b"] || "",
          },
          step6: { desiredAudienceFeelings: answers["audienceFeeling"] || [] },
          step7: {
            brandLanguage: answers["languageBoundaries"]?.["7a"] || "",
            avoidedTopics: answers["languageBoundaries"]?.["7b"] || "",
          },
          step8: {
            monitoredCompetitors: answers["competitors"]?.["8a"] || "",
            respectedCompetitorTraits: answers["competitors"]?.["8b"] || "",
            userEdgeFactor: answers["competitors"]?.["8c"] || "",
          },
          step9: {
            preferredCaptionLength: answers["captionStyle"]?.["9a"] || "",
            emojiUsagePreference: answers["captionStyle"]?.["9b"] || "",
          },
          step10: {
            preferredCTAStyle: answers["engagement"]?.["10a"] || "",
            captionBodyTone: answers["engagement"]?.["10b"] || "",
          },
        };

        // 1. Register with all data
        const registerResponse = await authService.register({
          ...registrationBuffer,
          subscription: "Pro",
          onboardingData,
        });

        console.log("✅ Registration successful:", registerResponse);

        // 2. Login automatically
        const loginResponse = await authService.login({
          email: registrationBuffer.email,
          password: registrationBuffer.password,
        });

        console.log("✅ Login successful, token:", !!loginResponse.token);

        // 3. Save session
        if (loginResponse.token) {
          // Clear any old user data first
          dispatch(clearUserData());

          await storageService.setToken(loginResponse.token);
          await storageService.setEmail(registrationBuffer.email);
          await storageService.setUsername(registrationBuffer.userName);

          dispatch(
            setUserData({
              userName: registrationBuffer.userName,
              email: registrationBuffer.email,
            }),
          );

          addNotification({
            type: "success",
            title: "Signup Successful",
            message:
              "Welcome to Sosh! Your account has been created successfully.",
          });

          Toast.show({
            type: "success",
            text1: "Welcome to Sosh! 👋",
            text2: "Account created successfully.",
          });

          router.replace("/(tabs)/home");
        }
      } catch (error: any) {
        console.error("Finish Error:", error);
        const errorMessage =
          error.response?.data?.message ||
          "Something went wrong. Please try again.";

        addNotification({
          type: "error",
          title: "Signup Failed",
          message: errorMessage,
        });

        Toast.show({
          type: "error",
          text1: "Registration Failed",
          text2: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePrev = () => {
    Haptics.selectionAsync();
    setDirection("backward");
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const [isListening, setIsListening] = useState(false);
  const [activeInputKey, setActiveInputKey] = useState<{
    parent: string;
    partId?: string;
  } | null>(null);

  const startListening = async (parentKey: string, partId?: string) => {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) return;

    setActiveInputKey({ parent: parentKey, partId });
    setIsListening(true);
    ExpoSpeechRecognitionModule.start({
      lang: "en-US",
      interimResults: true,
    });
  };

  const stopListening = () => {
    ExpoSpeechRecognitionModule.stop();
    setIsListening(false);
    setActiveInputKey(null);
  };

  useSpeechRecognitionEvent("result", (event) => {
    if (activeInputKey) {
      const transcript = event.results[0]?.transcript;
      if (transcript) {
        if (activeInputKey.partId) {
          updateAnswer(activeInputKey.parent, {
            ...(answers[activeInputKey.parent] || {}),
            [activeInputKey.partId]: transcript,
          });
        } else {
          updateAnswer(activeInputKey.parent, transcript);
        }
      }
    }
  });

  useSpeechRecognitionEvent("error", () => {
    setIsListening(false);
    setActiveInputKey(null);
  });

  const updateAnswer = (key: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const updateMultiAnswer = (key: string, option: string, limit?: number) => {
    const current = answers[key] || [];
    if (current.includes(option)) {
      updateAnswer(
        key,
        current.filter((o: string) => o !== option),
      );
    } else if (!limit || current.length < limit) {
      updateAnswer(key, [...current, option]);
    }
  };

  const getPlatformIcon = (platform: string, isSelected: boolean) => {
    const color = isSelected ? "black" : "white";
    const size = 22;
    switch (platform) {
      case "Instagram":
        return <FontAwesome5 name="instagram" color={color} size={size} />;
      case "TikTok":
        return <FontAwesome6 name="tiktok" color={color} size={size} />;
      case "YouTube":
        return <FontAwesome5 name="youtube" color={color} size={size} />;
      case "X":
        return <FontAwesome6 name="x-twitter" color={color} size={size} />;
      case "Facebook":
        return <FontAwesome5 name="facebook" color={color} size={size} />;
      case "LinkedIn":
        return <FontAwesome5 name="linkedin" color={color} size={size} />;
      case "Snapchat":
        return <FontAwesome5 name="snapchat" color={color} size={size} />;
      default:
        return null;
    }
  };

  const renderInput = (part: any, parentKey: string) => {
    const value = answers[parentKey]?.[part.id] || "";
    const isThisInputListening =
      isListening &&
      activeInputKey?.parent === parentKey &&
      activeInputKey?.partId === part.id;

    if (part.type === "textarea") {
      return (
        <View key={part.id} className="mb-6">
          <Text className="text-white/60 mb-3 text-sm font-medium">
            {part.label}
          </Text>
          <View
            className="rounded-[24px] bg-white/5 overflow-hidden border border-white/10 shadow-xl"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
          >
            <BlurView intensity={20} tint="dark" className="p-1">
              <View className="flex-row">
                <TextInput
                  multiline
                  numberOfLines={4}
                  placeholder={part.placeholder}
                  placeholderTextColor="#ffffff40"
                  className="flex-1 px-4 py-4 text-white min-h-[120px] text-base"
                  style={{ textAlignVertical: "top" }}
                  value={value}
                  onChangeText={(txt) =>
                    updateAnswer(parentKey, {
                      ...answers[parentKey],
                      [part.id]: txt,
                    })
                  }
                />
                <TouchableOpacity
                  onPress={() =>
                    isThisInputListening
                      ? stopListening()
                      : startListening(parentKey, part.id)
                  }
                  className={`m-2 w-10 h-10 rounded-full items-center justify-center ${isThisInputListening ? "bg-red-500" : "bg-white/10"}`}
                >
                  {isThisInputListening ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Mic color="white" size={18} />
                  )}
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </View>
      );
    }

    if (part.type === "platform-select") {
      const selectedPlatforms = answers[parentKey]?.[part.id] || {};
      return (
        <View key={part.id} className="mb-6">
          <Text className="text-white/60 mb-4 text-sm font-medium">
            {part.label}
          </Text>
          <View className="gap-3">
            {part.options.map((platform: string) => {
              const isSelected = !!selectedPlatforms[platform];
              return (
                <View key={platform} className="gap-2 w-full">
                  <View
                    className={`rounded-[20px] overflow-hidden border h-16 w-full ${isSelected ? "bg-white border-white" : "border-white/10"}`}
                  >
                    <BlurView
                      intensity={isSelected ? 0 : 20}
                      tint="dark"
                      className="h-full w-full"
                    >
                      <TouchableOpacity
                        onPress={() => {
                          Haptics.selectionAsync();
                          const updated = { ...selectedPlatforms };
                          if (isSelected) delete updated[platform];
                          else
                            updated[platform] = { selected: true, count: "" };
                          updateAnswer(parentKey, {
                            ...answers[parentKey],
                            [part.id]: updated,
                          });
                        }}
                        className={`flex-row items-center justify-between px-4 h-full w-full ${isSelected ? "bg-white" : ""}`}
                      >
                        <View className="flex-row items-center gap-3">
                          {getPlatformIcon(platform, isSelected)}
                          <Text
                            className={`font-semibold text-lg ${isSelected ? "text-black" : "text-white"}`}
                          >
                            {platform}
                          </Text>
                        </View>
                        {isSelected && <Check size={18} color="black" />}
                      </TouchableOpacity>
                    </BlurView>
                  </View>

                  {isSelected && (
                    <View className="mx-2 mt-1 flex-row flex-wrap gap-2">
                      {[
                        "< 1k",
                        "1k-10k",
                        "10k-50k",
                        "50k-100k",
                        "100k-500k",
                        "500k-1M",
                        "1M+",
                      ].map((range) => {
                        const isRangeSelected =
                          selectedPlatforms[platform].count === range;
                        return (
                          <TouchableOpacity
                            key={range}
                            onPress={() => {
                              Haptics.selectionAsync();
                              const updated = { ...selectedPlatforms };
                              updated[platform] = {
                                ...updated[platform],
                                count: range,
                              };
                              updateAnswer(parentKey, {
                                ...answers[parentKey],
                                [part.id]: updated,
                              });
                            }}
                            className={`px-3 py-2 rounded-full border ${isRangeSelected ? "bg-white/20 border-white" : "border-white/10 bg-white/5"}`}
                          >
                            <Text
                              className={`text-xs font-bold ${isRangeSelected ? "text-white" : "text-white/40"}`}
                            >
                              {range}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      );
    }

    if (part.type === "multi-select-chips") {
      const selected = answers[parentKey]?.[part.id] || [];
      return (
        <View key={part.id} className="mb-6">
          <Text className="text-white/60 mb-3 text-sm font-medium">
            {part.label}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {part.options.map((option: string) => {
              const isSelected = selected.includes(option);
              return (
                <View
                  key={option}
                  className={`rounded-full overflow-hidden border h-12 ${isSelected ? "bg-white border-white" : "border-white/20"}`}
                >
                  <BlurView
                    intensity={isSelected ? 0 : 20}
                    tint="dark"
                    className="h-full"
                  >
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.selectionAsync();
                        const updatedList = isSelected
                          ? selected.filter((o: string) => o !== option)
                          : [...selected, option];
                        updateAnswer(parentKey, {
                          ...answers[parentKey],
                          [part.id]: updatedList,
                        });
                      }}
                      className={`px-5 h-full items-center justify-center ${isSelected ? "bg-white" : ""}`}
                    >
                      <Text
                        className={`text-base font-medium ${isSelected ? "text-black" : "text-white"}`}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  </BlurView>
                </View>
              );
            })}
          </View>
        </View>
      );
    }

    if (part.type === "select") {
      return (
        <View key={part.id} className="mb-6">
          <Text className="text-white/60 mb-3 text-sm font-medium">
            {part.label}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {part.options.map((option: string) => {
              const isSelected = answers[parentKey]?.[part.id] === option;
              return (
                <View
                  key={option}
                  className={`rounded-full overflow-hidden border h-12 ${isSelected ? "bg-white border-white" : "border-white/20"}`}
                >
                  <BlurView
                    intensity={isSelected ? 0 : 20}
                    tint="dark"
                    className="h-full"
                  >
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.selectionAsync();
                        updateAnswer(parentKey, {
                          ...answers[parentKey],
                          [part.id]: option,
                        });
                      }}
                      className={`px-5 h-full items-center justify-center ${isSelected ? "bg-white" : ""}`}
                    >
                      <Text
                        className={`text-base font-medium ${isSelected ? "text-black" : "text-white"}`}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  </BlurView>
                </View>
              );
            })}
          </View>
        </View>
      );
    }

    const isThisGenericListening =
      isListening &&
      activeInputKey?.parent === parentKey &&
      activeInputKey?.partId === part.id;

    return (
      <View key={part.id} className="mb-6">
        <Text className="text-white/60 mb-3 text-sm font-medium">
          {part.label}
        </Text>
        <View
          className="rounded-full bg-white/5 overflow-hidden border border-white/10 h-14 justify-center"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
        >
          <BlurView
            intensity={20}
            tint="dark"
            className="flex-row items-center px-4 h-full"
          >
            <TextInput
              placeholder={part.placeholder}
              placeholderTextColor="#ffffff40"
              className="flex-1 text-white text-base py-0 h-full"
              value={value}
              onChangeText={(txt) =>
                updateAnswer(parentKey, {
                  ...answers[parentKey],
                  [part.id]: txt,
                })
              }
            />
            <TouchableOpacity
              onPress={() =>
                isThisGenericListening
                  ? stopListening()
                  : startListening(parentKey, part.id)
              }
              className={`w-9 h-9 rounded-full items-center justify-center ${isThisGenericListening ? "bg-red-500" : "bg-white/10"}`}
            >
              {isThisGenericListening ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Mic color="white" size={16} />
              )}
            </TouchableOpacity>
          </BlurView>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <Image
        source={require("../assets/images/background.png")}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
        }}
        resizeMode="cover"
      />
      <SafeAreaView className="flex-1">
        {/* Progress Bar */}
        <View className="px-6 py-4">
          <View className="h-1 bg-white/10 rounded-full w-full overflow-hidden">
            <View
              style={{ width: `${progress}%` }}
              className="h-full bg-white"
            />
          </View>
          <View className="flex-row justify-between mt-2">
            <Text className="text-white/30 text-xs uppercase font-bold">
              Step {currentStep + 1} of {STEPS.length}
            </Text>
            <Text className="text-white/30 text-xs font-bold">
              {Math.round(progress)}% Complete
            </Text>
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={{ flex: 1 }}>
            <ScrollView
              className="flex-1 px-8 py-6"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
            >
              <Text className="text-white/40 text-xs uppercase font-bold tracking-widest mb-2">
                {stepData.subtitle}
              </Text>
              <Text style={styles.title} className="text-white mb-2">
                {stepData.title}
              </Text>
              {stepData.description && (
                <Text className="text-white/60 mb-8 leading-6 text-base font-medium">
                  {stepData.description}
                </Text>
              )}

              {stepData.type === "textarea" && (
                <View
                  className="rounded-[24px] bg-white/5 overflow-hidden border border-white/10 shadow-2xl"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                >
                  <BlurView intensity={30} tint="dark" className="p-1">
                    <View className="flex-row">
                      <TextInput
                        multiline
                        numberOfLines={6}
                        placeholder={stepData.placeholder}
                        placeholderTextColor="#ffffff40"
                        className="flex-1 px-6 py-6 text-white min-h-[220px] text-lg"
                        style={{ textAlignVertical: "top" }}
                        value={answers[stepData.key] || ""}
                        onChangeText={(txt) => updateAnswer(stepData.key, txt)}
                      />
                      <TouchableOpacity
                        onPress={() =>
                          isListening &&
                          activeInputKey?.parent === stepData.key &&
                          !activeInputKey.partId
                            ? stopListening()
                            : startListening(stepData.key)
                        }
                        className={`m-4 w-12 h-12 rounded-full items-center justify-center ${isListening && activeInputKey?.parent === stepData.key && !activeInputKey.partId ? "bg-red-500" : "bg-white/10"}`}
                      >
                        {isListening &&
                        activeInputKey?.parent === stepData.key &&
                        !activeInputKey.partId ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <Mic color="white" size={20} />
                        )}
                      </TouchableOpacity>
                    </View>
                  </BlurView>
                </View>
              )}

              {stepData.type === "multi-select" && (
                <View className="gap-3">
                  {stepData.options?.map((option: string) => {
                    const isSelected = (answers[stepData.key] || []).includes(
                      option,
                    );
                    return (
                      <View
                        key={option}
                        className={`w-full overflow-hidden rounded-[24px] border h-20 ${isSelected ? "bg-white border-white" : "border-white/10 shadow-lg"}`}
                      >
                        <BlurView
                          intensity={isSelected ? 0 : 30}
                          tint="dark"
                          className="h-full"
                        >
                          <TouchableOpacity
                            onPress={() => {
                              Haptics.selectionAsync();
                              updateMultiAnswer(
                                stepData.key,
                                option,
                                stepData.limit,
                              );
                            }}
                            className={`px-5 flex-row items-center justify-between h-full ${isSelected ? "bg-white" : ""}`}
                          >
                            <Text
                              className={`text-xl font-medium ${isSelected ? "text-black" : "text-white"}`}
                            >
                              {option}
                            </Text>
                            {isSelected && (
                              <Check size={24} color="black" strokeWidth={3} />
                            )}
                          </TouchableOpacity>
                        </BlurView>
                      </View>
                    );
                  })}
                  {stepData.limit && (
                    <Text className="text-white/40 text-xs text-center mt-2 italic">
                      Select up to {stepData.limit} traits
                    </Text>
                  )}
                </View>
              )}

              {stepData.type === "mixed" &&
                stepData.parts?.map((part) => renderInput(part, stepData.key))}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>

        {/* Footer Navigation */}
        <View className="px-8 py-6 flex-row gap-4">
          <TouchableOpacity
            onPress={handlePrev}
            activeOpacity={0.7}
            className="w-16 h-16 rounded-full bg-white/10 items-center justify-center border border-white/10"
          >
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.7}
            disabled={loading}
            className={`flex-1 h-16 rounded-full items-center justify-center flex-row gap-2 ${loading ? "bg-white/50" : "bg-white"}`}
          >
            {loading ? (
              <ActivityIndicator color="black" />
            ) : (
              <>
                <Text className="text-black font-bold text-lg">
                  {currentStep === STEPS.length - 1 ? "Finish" : "Next"}
                </Text>
                {currentStep < STEPS.length - 1 && (
                  <ArrowRight color="black" size={20} />
                )}
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: FontFamily.questrial,
    fontSize: normalize(32),
    lineHeight: 38,
  },
});
