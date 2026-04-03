import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { useRouter } from "expo-router";
import { ArrowLeft, ArrowRight, Check } from "lucide-react-native";
import { useState } from "react";
import {
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
import { FontFamily, normalize } from "../constants/Fonts";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const STEPS = [
  {
    id: 1,
    title: "Tell Us About Your Brand 🚀",
    description: "In a few sentences, tell us about your brand or business. What's your niche, what do you do, and what's your mission or purpose behind it all?",
    subtitle: "Section 1: Your Business",
    type: "textarea",
    placeholder: "Tell your story here...",
    key: "brandDescription",
  },
  {
    id: 2,
    title: "Who Is Your Audience? 🎯",
    subtitle: "Section 1: Your Business",
    type: "mixed",
    key: "audience",
    parts: [
      {
        id: "2a",
        label: "What age range best describes your target audience? (Select all that apply)",
        type: "multi-select-chips",
        options: ["🎒 Under 18", "🎓 18-24", "💼 25-34", "🏡 35-44", "📈 45-54", "🌅 55+"],
      },
      {
        id: "2b",
        label: "Describe your ideal follower in 1-2 sentences. Who are they and what do they care about?",
        type: "textarea",
        placeholder: "Who are they and what do they care about?",
      },
    ],
  },
  {
    id: 3,
    title: "Your Social Media Presence 📱",
    subtitle: "Section 1: Your Business",
    type: "mixed",
    key: "social media",
    parts: [
      {
        id: "3a",
        label: "Select the platforms you're active on and your approximate follower count",
        type: "platform-select",
        options: ["📸 Instagram", "🎵 TikTok", "▶️ YouTube", "🐦 X / Twitter", "👥 Facebook", "💼 LinkedIn", "👻 Snapchat"]
      },
      {
        id: "3b",
        label: "What's your #1 social media goal right now?",
        type: "textarea",
        placeholder: "e.g. 50 new clients, 10k followers..."
      },
    ],
  },
  {
    id: 4,
    title: "Your Brand Personality 🎉",
    description: "Pick up to 5 words that best describe your brand's personality.",
    subtitle: "Section 2: Your Personality",
    type: "multi-select",
    key: "brandPersonality",
    options: [
      "🎉 Fun / Playful",
      "💥 Bold / Controversial",
      "💼 Professional / Polished",
      "✨ Luxurious / Premium",
      "📚 Educational / Informative",
      "🤓 Nerdy / Technical",
      "🔥 Inspirational / Motivational",
      "😏 Witty / Sarcastic",
      "🎤 Raw / Unfiltered",
      "🧘 Calm / Chill",
      "🤝 Friendly / Approachable",
      "⚡ High Energy / Hype"
    ],
    limit: 5,
  },
  {
    id: 5,
    title: "Your Content Style 📝",
    subtitle: "Section 2: Your Personality",
    type: "mixed",
    key: "contentStyle",
    parts: [
      {
        id: "5a",
        label: "What types of content do you post or plan to post? (Select all that apply)",
        type: "multi-select-chips",
        options: [
          "📝 Tutorials / How-tos",
          "😂 Memes / Funny Skits",
          "🎬 Behind the Scenes",
          "🛤️ Personal Stories / Journey",
          "📹 Vlogs / Day-in-the-Life",
          "🛍️ Product Showcases / Demos",
          "💡 Tips & Advice",
          "📰 News / Updates in My Niche",
          "🎤 Interviews / Conversations",
          "🌟 Motivational / Inspirational",
          "🗣️ Reviews / Hot Takes",
          "📖 Storytelling / Narrative",
          "📱 Raw / Unedited Clips",
          "🌴 Lifestyle / Aesthetic",
          "🎥 Cinematic / High-Production",
          "✏️ Other"
        ]
      },
      {
        id: "5b",
        label: "What makes your content different from others in your niche?",
        type: "textarea",
        placeholder: "Example: I use a professional Sony camera while most people in my niche only shoot on iPhones. I also show the behind-the-scenes..."
      },
    ],
  },
  {
    id: 6,
    title: "The Feeling You Create ✨",
    description: "When people watch your content, how do you want them to feel? (Select up to 3)",
    subtitle: "Section 2: Your Personality",
    type: "multi-select",
    key: "audienceFeeling",
    options: [
      "🚀 Inspired to chase something",
      "🧠 Like they learned something new",
      "😂 Entertained / Laughing",
      "💪 Motivated to take action",
      "😱 FOMO — they wish they were there",
      "🤝 Part of a community",
      "👑 Empowered / Confident",
      "😌 Relaxed / At peace",
      "🔍 Curious / Wanting more",
      "🤯 Impressed / In awe"
    ],
    limit: 3,
  },
  {
    id: 7,
    title: "Your Language & Boundaries 🛡️",
    subtitle: "Section 3: The Details",
    type: "mixed",
    key: "languageBoundaries",
    parts: [
      {
        id: "7a",
        label: "Do you use any specific slang, catchphrases, or language your audience would recognize? How do you talk?",
        type: "textarea",
        placeholder: "Example: I use Chicago slang, say 'y'all' a lot, talk directly to one person using 'you'..."
      },
      {
        id: "7b",
        label: "Are there any topics, themes, or content styles you want to AVOID?",
        type: "textarea",
        placeholder: "Example: I don't talk about politics or religion. I also avoid drama and gossip..."
      },
    ],
  },
  {
    id: 8,
    title: "Your Competitive Landscape 🔍",
    subtitle: "Section 3: The Details",
    type: "mixed",
    key: "competitors",
    parts: [
      {
        id: "8a",
        label: "Name 2-3 competitors or creators in your niche that you pay attention to.",
        type: "textarea",
        placeholder: "Example: @houseofjandra, @whatsgoodchicago, @mirandavang"
      },
      {
        id: "8b",
        label: "What do they do well on social media that you respect or want to learn from?",
        type: "textarea",
        placeholder: "Example: They all post consistently almost every day and use really strong text-on-screen hooks..."
      },
      {
        id: "8c",
        label: "What do YOU do better, or what sets you apart from them?",
        type: "textarea",
        placeholder: "Example: My visuals are way stronger because I shoot with a professional camera instead of just an iPhone..."
      },
    ],
  },
  {
    id: 9,
    title: "Caption Style ✍️",
    subtitle: "Section 4 — Your Caption Preferences",
    type: "mixed",
    key: "captionStyle",
    parts: [
      {
        id: "9a",
        label: "How long do you like your captions?",
        type: "select",
        options: [
          "⚡ Short & punchy — 1-2 lines max",
          "📝 Medium — a few sentences",
          "📖 Long-form — full stories",
          "🔄 Depends on the post — mix it up"
        ]
      },
      {
        id: "9b",
        label: "How do you feel about emojis in your captions?",
        type: "select",
        options: [
          "🎉 Love them — use them freely",
          "✨ A few here and there",
          "🚫 Minimal to none — keep it clean",
          "🎯 Match the vibe of each post"
        ]
      },
    ],
  },
  {
    id: 10,
    title: "How You Engage 💡",
    subtitle: "Section 4 — Your Caption Preferences",
    type: "mixed",
    key: "engagement",
    parts: [
      { 
        id: "10a", 
        label: "How do you like to end your captions?", 
        type: "select", 
        options: [
          "💬 Ask a question to spark conversation",
          "📢 Tell them to follow / like / share",
          "🔗 Direct them elsewhere (link in bio)",
          "📊 Use a poll or 'this or that'",
          "🤫 No CTA — let content speak",
          "🔄 Mix it up depending on post"
        ] 
      },
      { 
        id: "10b", 
        label: "What do you like the body of your captions to sound like?", 
        type: "select", 
        options: [
          "📖 Personal thought or story",
          "🎯 Describe what's happening",
          "🗣️ Start a debate or ask audience",
          "📚 Share tips, value, or info",
          "📸 Keep it minimal — visuals only"
        ] 
      },
    ],
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const stepData = STEPS[currentStep];

  const handleNext = () => {
    Haptics.selectionAsync();
    setDirection('forward');
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Completed
      router.replace("/(tabs)/home");
    }
  };

  const handlePrev = () => {
    Haptics.selectionAsync();
    setDirection('backward');
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const updateAnswer = (key: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const updateMultiAnswer = (key: string, option: string, limit?: number) => {
    const current = answers[key] || [];
    if (current.includes(option)) {
      updateAnswer(key, current.filter((o: string) => o !== option));
    } else if (!limit || current.length < limit) {
      updateAnswer(key, [...current, option]);
    }
  };

  const renderInput = (part: any, parentKey: string) => {
    const value = answers[parentKey]?.[part.id] || "";

    if (part.type === "textarea") {
      return (
        <View key={part.id} className="mb-6">
          <Text className="text-white/60 mb-3 text-sm font-medium">{part.label}</Text>
          <View className="rounded-[20px] bg-white/10 overflow-hidden border border-white/10">
            <TextInput
              multiline
              numberOfLines={4}
              placeholder={part.placeholder}
              placeholderTextColor="#ffffff40"
              className="px-4 py-4 text-white min-h-[120px] text-base"
              style={{ textAlignVertical: "top" }}
              value={value}
              onChangeText={(txt) => updateAnswer(parentKey, { ...answers[parentKey], [part.id]: txt })}
            />
          </View>
        </View>
      );
    }

    if (part.type === "platform-select") {
      const selectedPlatforms = answers[parentKey]?.[part.id] || {};
      return (
        <View key={part.id} className="mb-6">
          <Text className="text-white/60 mb-4 text-sm font-medium">{part.label}</Text>
          <View className="gap-3">
            {part.options.map((platform: string) => {
              const isSelected = !!selectedPlatforms[platform];
              return (
                <View key={platform} className="gap-2">
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.selectionAsync();
                      const updated = { ...selectedPlatforms };
                      if (isSelected) delete updated[platform];
                      else updated[platform] = { selected: true, count: "" };
                      updateAnswer(parentKey, { ...answers[parentKey], [part.id]: updated });
                    }}
                    className={`flex-row items-center justify-between p-4 rounded-[20px] border ${isSelected ? "bg-white border-white" : "bg-white/5 border-white/10"
                      }`}
                  >
                    <Text className={`font-semibold ${isSelected ? "text-black" : "text-white"}`}>
                      {platform}
                    </Text>
                    {isSelected && <Check size={18} color="black" />}
                  </TouchableOpacity>

                  {isSelected && (
                    <View className="mx-2 mt-1 flex-row flex-wrap gap-2">
                      {["< 1k", "1k-10k", "10k-50k", "50k-100k", "100k-500k", "500k-1M", "1M+"].map((range) => {
                        const isRangeSelected = selectedPlatforms[platform].count === range;
                        return (
                          <TouchableOpacity
                            key={range}
                            onPress={() => {
                              Haptics.selectionAsync();
                              const updated = { ...selectedPlatforms };
                              updated[platform] = { ...updated[platform], count: range };
                              updateAnswer(parentKey, { ...answers[parentKey], [part.id]: updated });
                            }}
                            className={`px-3 py-1.5 rounded-lg border ${isRangeSelected ? "bg-white/90 border-white" : "bg-white/5 border-white/10"
                              }`}
                          >
                            <Text className={`text-[10px] uppercase font-bold ${isRangeSelected ? "text-black" : "text-white/60"}`}>
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
          <Text className="text-white/60 mb-3 text-sm font-medium">{part.label}</Text>
          <View className="flex-row flex-wrap gap-2">
            {part.options.map((option: string) => {
              const isSelected = selected.includes(option);
              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => {
                    Haptics.selectionAsync();
                    const updatedList = isSelected
                      ? selected.filter((o: string) => o !== option)
                      : [...selected, option];
                    updateAnswer(parentKey, { ...answers[parentKey], [part.id]: updatedList });
                  }}
                  className={`px-4 py-2 rounded-full border ${isSelected ? "bg-white border-white" : "border-white/20"
                    }`}
                >
                  <Text className={`text-sm ${isSelected ? "text-black font-semibold" : "text-white"}`}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      );
    }

    if (part.type === "select") {
      return (
        <View key={part.id} className="mb-6">
          <Text className="text-white/60 mb-3 text-sm font-medium">{part.label}</Text>
          <View className="flex-row flex-wrap gap-2">
            {part.options.map((option: string) => {
              const isSelected = answers[parentKey]?.[part.id] === option;
              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => {
                    Haptics.selectionAsync();
                    updateAnswer(parentKey, { ...answers[parentKey], [part.id]: option });
                  }}
                  className={`px-4 py-2 rounded-full border ${isSelected ? "bg-white border-white" : "border-white/20"
                    }`}
                >
                  <Text className={`text-sm ${isSelected ? "text-black font-semibold" : "text-white"}`}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      );
    }

    return (
      <View key={part.id} className="mb-6">
        <Text className="text-white/60 mb-3 text-sm font-medium">{part.label}</Text>
        <View className="rounded-full bg-white/10 overflow-hidden border border-white/10 px-4 h-12 justify-center">
          <TextInput
            placeholder={part.placeholder}
            placeholderTextColor="#ffffff40"
            className="text-white text-base py-0 h-full"
            value={value}
            onChangeText={(txt) => updateAnswer(parentKey, { ...answers[parentKey], [part.id]: txt })}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <Image
        source={require("../assets/images/background.png")}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}
        resizeMode="cover"
      />
      <SafeAreaView className="flex-1">
        {/* Progress Bar */}
        <View className="px-6 py-4">
          <View className="h-1 bg-white/10 rounded-full w-full overflow-hidden">
            <View style={{ width: `${progress}%` }} className="h-full bg-white" />
          </View>
          <View className="flex-row justify-between mt-2">
            <Text className="text-white/30 text-xs uppercase font-bold">Step {currentStep + 1} of {STEPS.length}</Text>
            <Text className="text-white/30 text-xs font-bold">{Math.round(progress)}% Complete</Text>
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <MotiView
            key={currentStep}
            from={{
              opacity: 0,
              translateX: direction === 'forward' ? 50 : -50,
            }}
            animate={{
              opacity: 1,
              translateX: 0,
            }}
            transition={{
              type: 'spring',
              damping: 20,
              stiffness: 150,
            }}
            style={{ flex: 1 }}
          >
            <ScrollView
              className="flex-1 px-8 py-6"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            <Text className="text-white/40 text-xs uppercase font-bold tracking-widest mb-2">{stepData.subtitle}</Text>
            <Text style={styles.title} className="text-white mb-2">{stepData.title}</Text>
            {stepData.description && (
              <Text className="text-white/60 mb-8 leading-6 text-base font-medium">
                {stepData.description}
              </Text>
            )}

            {stepData.type === "textarea" && (
              <View className="rounded-[20px] bg-white/10 overflow-hidden border border-white/10">
                <TextInput
                  multiline
                  numberOfLines={6}
                  placeholder={stepData.placeholder}
                  placeholderTextColor="#ffffff40"
                  className="px-6 py-6 text-white min-h-[200px] text-lg"
                  style={{ textAlignVertical: "top" }}
                  value={answers[stepData.key] || ""}
                  onChangeText={(txt) => updateAnswer(stepData.key, txt)}
                />
              </View>
            )}

            {stepData.type === "multi-select" && (
              <View className="gap-3">
                {stepData.options?.map((option: string) => {
                  const isSelected = (answers[stepData.key] || []).includes(option);
                  return (
                    <TouchableOpacity
                      key={option}
                      onPress={() => {
                        Haptics.selectionAsync();
                        updateMultiAnswer(stepData.key, option, stepData.limit);
                      }}
                      className={`w-full p-5 rounded-[20px] flex-row items-center justify-between border ${isSelected ? "bg-white border-white" : "bg-white/5 border-white/10"
                        }`}
                    >
                      <Text className={`text-lg font-medium ${isSelected ? "text-black" : "text-white"}`}>
                        {option}
                      </Text>
                      {isSelected && <Check size={20} color="black" />}
                    </TouchableOpacity>
                  );
                })}
                {stepData.limit && (
                  <Text className="text-white/40 text-xs text-center mt-2 italic">Select up to {stepData.limit} traits</Text>
                )}
              </View>
            )}

            {stepData.type === "mixed" && stepData.parts?.map(part => renderInput(part, stepData.key))}

          </ScrollView>
        </MotiView>
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
            className="flex-1 h-16 rounded-full bg-white items-center justify-center flex-row gap-2"
          >
            <Text className="text-black font-bold text-lg">
              {currentStep === STEPS.length - 1 ? "Finish" : "Next"}
            </Text>
            {currentStep < STEPS.length - 1 && <ArrowRight color="black" size={20} />}
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
