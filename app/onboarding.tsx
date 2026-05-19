import { FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  isSpeechRecognitionAvailable,
  speechRecognitionModule,
  useOptionalSpeechRecognitionEvent,
} from "../services/speechRecognition";
import { jwtDecode } from "jwt-decode";
import {
  ArrowLeft, ArrowRight, Check, Mic,
  User, Briefcase, Home, Building2, Users,
  Smile, Flame, Diamond, BookOpen, Code, Sparkles, MessageCircle, Camera, Coffee, Heart, Zap,
  GraduationCap, Clapperboard, Book, Video, ShoppingBag, Lightbulb, Globe, Mic2, TrendingUp, PenTool, Star, Palette, Film, MoreHorizontal,
  Rocket, Brain, Laugh, Handshake, ShieldCheck, Eye, Compass, HelpCircle, Trophy,
  AlignLeft, AlignCenter, AlignJustify, Shuffle, Ban, MessageSquare, Link, BarChart2,
  FileText, Image as ImageIcon
} from "lucide-react-native";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  ActivityIndicator,
  Dimensions,
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
import { updateLastLogin, updateUserOnboardingData } from "../services/firebase";
import storageService from "../services/storage";
import { RootState } from "../store/store";
import { clearUserData, setLoginBuffer, setUserData } from "../store/userSlice";

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
          "Under 18",
          "18-24",
          "25-34",
          "35-44",
          "45-54",
          "55+",
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
      "Fun / Playful",
      "Bold / Controversial",
      "Professional / Polished",
      "Luxurious / Premium",
      "Educational / Informative",
      "Nerdy / Technical",
      "Inspirational / Motivational",
      "Witty / Sarcastic",
      "Raw / Unfiltered",
      "Calm / Chill",
      "Friendly / Approachable",
      "High Energy / Hype",
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
          "Tutorials / How-tos",
          "Memes / Funny Skits",
          "Behind the Scenes",
          "Personal Stories",
          "Vlogs / Day-in-the-Life",
          "Product Showcases",
          "Tips & Advice",
          "News / Updates",
          "Interviews / Talks",
          "Motivational",
          "Reviews / Hot Takes",
          "Storytelling",
          "Raw / Unedited Clips",
          "Lifestyle / Aesthetic",
          "Cinematic",
          "Other",
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
      "Inspired to chase something",
      "Like they learned something new",
      "Entertained / Laughing",
      "Motivated to take action",
      "FOMO — they wish they were there",
      "Part of a community",
      "Empowered / Confident",
      "Relaxed / At peace",
      "Curious / Wanting more",
      "Impressed / In awe",
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
          "Short & punchy",
          "Medium — a few sentences",
          "Long-form — full stories",
          "Depends on the post",
        ],
      },
      {
        id: "9b",
        label: "How do you feel about emojis in your captions?",
        type: "select",
        options: [
          "Love them — use them freely",
          "A few here and there",
          "Minimal to none",
          "Match the vibe of each post",
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
          "Ask a question",
          "Call to action (like/follow)",
          "Direct elsewhere (link in bio)",
          "Use a poll or 'this or that'",
          "No CTA — let content speak",
          "Mix it up",
        ],
      },
      {
        id: "10b",
        label: "What do you like the body of your captions to sound like?",
        type: "select",
        options: [
          "Personal thought or story",
          "Describe what's happening",
          "Start a debate",
          "Share tips, value, or info",
          "Keep it minimal",
        ],
      },
    ],
  },
];


const getOptionIcon = (label: string, color: string, size = 18) => {
  const iconMap: Record<string, any> = {
    // Age
    "Under 18": <User color={color} size={size} />,
    "18-24": <GraduationCap color={color} size={size} />,
    "25-34": <Briefcase color={color} size={size} />,
    "35-44": <Home color={color} size={size} />,
    "45-54": <Building2 color={color} size={size} />,
    "55+": <Users color={color} size={size} />,

    // Personality
    "Fun / Playful": <Smile color={color} size={size} />,
    "Bold / Controversial": <Flame color={color} size={size} />,
    "Professional / Polished": <Briefcase color={color} size={size} />,
    "Luxurious / Premium": <Diamond color={color} size={size} />,
    "Educational / Informative": <BookOpen color={color} size={size} />,
    "Nerdy / Technical": <Code color={color} size={size} />,
    "Inspirational / Motivational": <Sparkles color={color} size={size} />,
    "Witty / Sarcastic": <MessageCircle color={color} size={size} />,
    "Raw / Unfiltered": <Camera color={color} size={size} />,
    "Calm / Chill": <Coffee color={color} size={size} />,
    "Friendly / Approachable": <Heart color={color} size={size} />,
    "High Energy / Hype": <Zap color={color} size={size} />,

    // Content Style
    "Tutorials / How-tos": <GraduationCap color={color} size={size} />,
    "Memes / Funny Skits": <Laugh color={color} size={size} />,
    "Behind the Scenes": <Camera color={color} size={size} />,
    "Personal Stories": <Book color={color} size={size} />,
    "Vlogs / Day-in-the-Life": <Video color={color} size={size} />,
    "Product Showcases": <ShoppingBag color={color} size={size} />,
    "Tips & Advice": <Lightbulb color={color} size={size} />,
    "News / Updates": <Globe color={color} size={size} />,
    "Interviews / Talks": <Mic2 color={color} size={size} />,
    "Motivational": <TrendingUp color={color} size={size} />,
    "Reviews / Hot Takes": <Flame color={color} size={size} />,
    "Storytelling": <PenTool color={color} size={size} />,
    "Raw / Unedited Clips": <Film color={color} size={size} />,
    "Lifestyle / Aesthetic": <Palette color={color} size={size} />,
    "Cinematic": <Clapperboard color={color} size={size} />,
    "Other": <MoreHorizontal color={color} size={size} />,

    // Audience Feeling
    "Inspired to chase something": <Rocket color={color} size={size} />,
    "Like they learned something new": <Brain color={color} size={size} />,
    "Entertained / Laughing": <Laugh color={color} size={size} />,
    "Motivated to take action": <TrendingUp color={color} size={size} />,
    "FOMO — they wish they were there": <Eye color={color} size={size} />,
    "Part of a community": <Users color={color} size={size} />,
    "Empowered / Confident": <ShieldCheck color={color} size={size} />,
    "Relaxed / At peace": <Coffee color={color} size={size} />,
    "Curious / Wanting more": <Compass color={color} size={size} />,
    "Impressed / In awe": <Star color={color} size={size} />,

    // Caption length
    "Short & punchy": <AlignLeft color={color} size={size} />,
    "Medium — a few sentences": <AlignCenter color={color} size={size} />,
    "Long-form — full stories": <AlignJustify color={color} size={size} />,
    "Depends on the post": <Shuffle color={color} size={size} />,

    // Emojis
    "Love them — use them freely": <Heart color={color} size={size} />,
    "A few here and there": <Smile color={color} size={size} />,
    "Minimal to none": <Ban color={color} size={size} />,
    "Match the vibe of each post": <Shuffle color={color} size={size} />,

    // End caption
    "Ask a question": <HelpCircle color={color} size={size} />,
    "Call to action (like/follow)": <MessageSquare color={color} size={size} />,
    "Direct elsewhere (link in bio)": <Link color={color} size={size} />,
    "Use a poll or 'this or that'": <BarChart2 color={color} size={size} />,
    "No CTA — let content speak": <FileText color={color} size={size} />,
    "Mix it up": <Shuffle color={color} size={size} />,

    // Body
    "Personal thought or story": <Book color={color} size={size} />,
    "Describe what's happening": <ImageIcon color={color} size={size} />,
    "Start a debate": <Flame color={color} size={size} />,
    "Share tips, value, or info": <Lightbulb color={color} size={size} />,
    "Keep it minimal": <AlignLeft color={color} size={size} />
  };
  return iconMap[label] || <Sparkles color={color} size={size} />;
};

export default function Onboarding() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { addNotification } = useNotification();
  const registrationBuffer = useSelector(
    (state: RootState) => state.user.registrationBuffer,
  );
  const loginBuffer = useSelector((state: RootState) => state.user.loginBuffer);
  const isLoginFlow = !!loginBuffer;
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, [currentStep]);

  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const stepData = STEPS[currentStep];

  const isStepValid = () => {
    const answer = answers[stepData.key];

    if (stepData.type === "textarea") {
      return !!answer?.trim();
    }

    if (stepData.type === "multi-select") {
      return Array.isArray(answer) && answer.length > 0;
    }

    if (stepData.type === "mixed") {
      if (!answer) return false;
      return stepData.parts.some((part: any) => {
        const partAnswer = answer[part.id];
        if (part.type === "textarea") {
          return !!partAnswer?.trim();
        }
        if (part.type === "multi-select-chips") {
          return Array.isArray(partAnswer) && partAnswer.length > 0;
        }
        if (part.type === "select") {
          return !!partAnswer;
        }
        if (part.type === "platform-select") {
          const platforms = Object.keys(partAnswer || {});
          if (platforms.length === 0) return false;
          return platforms.every(
            (p) => partAnswer[p].selected && !!partAnswer[p].count,
          );
        }
        return true;
      });
    }

    return true;
  };

  const handleNext = async () => {
    Haptics.selectionAsync();
    setDirection("forward");
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final Finish
      if (loading) return;

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

      if (isLoginFlow) {
        // --- LOGIN FLOW: User already authenticated, just update onboarding data ---
        try {
          setLoading(true);

          const userEmail = loginBuffer.email.toLowerCase().trim();
          console.log(
            "🚀 Updating onboarding data for logged-in user:",
            userEmail,
          );
          const success = await updateUserOnboardingData(
            userEmail,
            onboardingData,
          );

          if (!success) {
            throw new Error("Failed to save onboarding data");
          }
          console.log("✅ Onboarding data updated successfully");

          // Call login API
          if (userEmail && loginBuffer.password) {
            console.log("🔑 Calling login API...");
            const loginResponse = await authService.login({
              email: userEmail,
              password: loginBuffer.password,
            });

            if (loginResponse.token) {
              await storageService.setToken(loginResponse.token);
              // Update last login timestamp with timezone directly in Firebase
              updateLastLogin(userEmail).catch((err) => {
                console.error("❌ Error updating last login:", err);
              });
            }
          }

          // Session is already saved from login, just update Redux with onboarding data
          dispatch(
            setUserData({
              onboardingData,
            }),
          );

          // Clear the login buffer
          dispatch(setLoginBuffer(null));

          addNotification({
            type: "success",
            title: "Welcome to Sosh!",
            message: "Your profile has been set up successfully.",
          });

          Toast.show({
            type: "success",
            text1: "Welcome to Sosh! 👋",
            text2: "Profile set up successfully.",
          });

          router.replace("/(tabs)/home");
        } catch (error: any) {
          console.error("Onboarding Update Error:", error);
          const errorMessage =
            error.response?.data?.message ||
            "Something went wrong. Please try again.";

          addNotification({
            type: "error",
            title: "Setup Failed",
            message: errorMessage,
          });

          Toast.show({
            type: "error",
            text1: "Setup Failed",
            text2: errorMessage,
          });
        } finally {
          setLoading(false);
        }
      } else {
        // --- SIGNUP FLOW: Register + Login ---
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

          // 1. Register with all data
          console.log(
            "🚀 Starting registration for:",
            registrationBuffer?.email,
          );
          const registerResponse = await authService.register({
            ...registrationBuffer,
            subscription: "Free",
            onboardingData,
          });

          console.log("✅ Registration successful:", registerResponse);

          // 2. Add a small delay for backend propagation
          // n8n workflows can sometimes take a moment to commit to the database
          console.log("⏳ Waiting for account propagation...");
          await new Promise((resolve) => setTimeout(resolve, 2000));

          // 3. Login automatically
          // Diagnostic: Log lengths to ensure no hidden characters/spaces
          console.log("🔑 Attempting automatic login...");
          console.log(
            `[Diagnostic] Email: "${registrationBuffer.email}" (Len: ${registrationBuffer.email?.length})`,
          );
          console.log(
            `[Diagnostic] Password Length: ${registrationBuffer.password?.length}`,
          );

          const loginResponse = await authService.login({
            email: registrationBuffer.email,
            password: registrationBuffer.password,
          });

          console.log("✅ Login successful, token:", !!loginResponse.token);

          // 4. Save session
          if (loginResponse.token) {
            // Clear any old user data first
            dispatch(clearUserData());

            await storageService.setToken(loginResponse.token);
            await storageService.setEmail(registrationBuffer.email);
            await storageService.setUsername(registrationBuffer.userName);

            // Update last login timestamp with timezone directly in Firebase
            updateLastLogin(registrationBuffer.email).catch((err) => {
              console.error("❌ Error updating last login:", err);
            });

            const decoded: any = jwtDecode(loginResponse.token);
            const finalUserName =
              decoded.userName?.trim() || registrationBuffer.userName;
            const finalEmail = decoded.email || registrationBuffer.email;

            dispatch(
              setUserData({
                userName: finalUserName,
                email: finalEmail,
                subscription: {
                  plan: (decoded.subscription || "Free") as
                    | "Free"
                    | "Pro"
                    | "Business",
                  isSubscribed:
                    !!decoded.subscription && decoded.subscription !== "Free",
                },
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
    }
  };

  const handlePrev = async () => {
    Haptics.selectionAsync();
    setDirection("backward");
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      if (isLoginFlow) {
        dispatch(clearUserData());
        await storageService.logout();
        router.replace("/login");
      } else {
        router.replace("/signup");
      }
    }
  };

  const [isListening, setIsListening] = useState(false);
  const [activeInputKey, setActiveInputKey] = useState<{
    parent: string;
    partId?: string;
  } | null>(null);

  const isListeningRef = useRef(false);
  const isManualStopRef = useRef(false);
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const committedSpeechTextRef = useRef("");
  const interimSpeechTextRef = useRef("");
  const activeInputKeyRef = useRef<{ parent: string; partId?: string } | null>(null);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    activeInputKeyRef.current = activeInputKey;
  }, [activeInputKey]);

  useEffect(() => {
    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    };
  }, []);

  const appendSpeechChunk = useCallback((base: string, chunk: string) => {
    const cleanBase = base.trim();
    const cleanChunk = chunk.trim();

    if (!cleanChunk) return cleanBase;
    if (!cleanBase) return cleanChunk;

    const toWordPairs = (value: string) =>
      value
        .split(/\s+/)
        .map((raw) => ({
          raw,
          norm: raw.toLowerCase().replace(/[^a-z0-9']/gi, ""),
        }))
        .filter((word) => word.norm.length > 0);

    const baseWords = toWordPairs(cleanBase);
    const chunkWords = toWordPairs(cleanChunk);

    if (!chunkWords.length) {
      return cleanBase;
    }

    const arraysMatch = (
      left: Array<{ norm: string }>,
      right: Array<{ norm: string }>,
    ) => left.every((word, index) => word.norm === right[index]?.norm);

    const collapseRepeatedPattern = (
      words: Array<{ raw: string; norm: string }>,
    ) => {
      if (words.length < 2) return words;

      for (
        let patternLength = 1;
        patternLength <= words.length / 2;
        patternLength++
      ) {
        if (words.length % patternLength !== 0) continue;

        const pattern = words.slice(0, patternLength);
        let isRepeatingPattern = true;

        for (let i = patternLength; i < words.length; i += patternLength) {
          const candidate = words.slice(i, i + patternLength);
          if (!arraysMatch(pattern, candidate)) {
            isRepeatingPattern = false;
            break;
          }
        }

        if (isRepeatingPattern) {
          return pattern;
        }
      }

      return words;
    };

    const normalizedChunkWords = collapseRepeatedPattern(chunkWords);

    if (
      baseWords.length >= normalizedChunkWords.length &&
      arraysMatch(
        baseWords.slice(-normalizedChunkWords.length),
        normalizedChunkWords,
      )
    ) {
      return cleanBase;
    }

    const overlapLimit = Math.min(
      baseWords.length,
      normalizedChunkWords.length,
    );

    for (let overlap = overlapLimit; overlap > 0; overlap--) {
      const baseSuffix = baseWords.slice(-overlap);
      const chunkPrefix = normalizedChunkWords.slice(0, overlap);

      if (arraysMatch(baseSuffix, chunkPrefix)) {
        const remainingChunk = normalizedChunkWords
          .slice(overlap)
          .map((word) => word.raw)
          .join(" ");
        return remainingChunk ? `${cleanBase} ${remainingChunk}` : cleanBase;
      }
    }

    if (cleanBase.toLowerCase().endsWith(cleanChunk.toLowerCase())) {
      return cleanBase;
    }

    return `${cleanBase} ${cleanChunk}`;
  }, []);

  const updateCurrentFieldText = useCallback((newText: string) => {
    const activeKey = activeInputKeyRef.current;
    if (!activeKey) return;
    
    setAnswers((prev) => {
      if (activeKey.partId) {
        return {
          ...prev,
          [activeKey.parent]: {
            ...(prev[activeKey.parent] || {}),
            [activeKey.partId]: newText,
          },
        };
      } else {
        return {
          ...prev,
          [activeKey.parent]: newText,
        };
      }
    });
  }, []);

  const startRecognitionSession = useCallback(async () => {
    if (!speechRecognitionModule || !isSpeechRecognitionAvailable) {
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
  }, []);

  const commitInterimSpeech = useCallback(() => {
    const interimText = interimSpeechTextRef.current.trim();
    if (!interimText) return;

    committedSpeechTextRef.current = appendSpeechChunk(
      committedSpeechTextRef.current,
      interimText,
    );
    interimSpeechTextRef.current = "";
    updateCurrentFieldText(committedSpeechTextRef.current);
  }, [appendSpeechChunk, updateCurrentFieldText]);

  const scheduleRecognitionRestart = useCallback(() => {
    if (isManualStopRef.current || !isListeningRef.current) {
      return;
    }

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }

    restartTimeoutRef.current = setTimeout(() => {
      if (isManualStopRef.current || !isListeningRef.current) {
        return;
      }

      void startRecognitionSession().catch(() => {});
    }, 300);
  }, [startRecognitionSession]);

  useOptionalSpeechRecognitionEvent("result", (event) => {
    if (!isListeningRef.current || isManualStopRef.current) {
      return;
    }

    const transcript = String(event.results?.[0]?.transcript || "").trim();
    if (!transcript) {
      return;
    }

    if (event.isFinal) {
      committedSpeechTextRef.current = appendSpeechChunk(
        committedSpeechTextRef.current,
        transcript,
      );
      interimSpeechTextRef.current = "";
      updateCurrentFieldText(committedSpeechTextRef.current);
      return;
    }

    if (interimSpeechTextRef.current.trim() === transcript) {
      return;
    }

    interimSpeechTextRef.current = transcript;

    const nextPreviewText = interimSpeechTextRef.current
      ? appendSpeechChunk(
          committedSpeechTextRef.current,
          interimSpeechTextRef.current,
        )
      : committedSpeechTextRef.current;

    updateCurrentFieldText(nextPreviewText);
  });

  useOptionalSpeechRecognitionEvent("end", () => {
    if (isManualStopRef.current) {
      setIsListening(false);
      isListeningRef.current = false;
      setActiveInputKey(null);
      activeInputKeyRef.current = null;
      return;
    }

    commitInterimSpeech();
    scheduleRecognitionRestart();
  });

  useOptionalSpeechRecognitionEvent("error", (event) => {
    const errorMessage = String(event?.error || "").toLowerCase();
    const isRecoverable =
      isListeningRef.current &&
      !isManualStopRef.current &&
      !errorMessage.includes("permission") &&
      !errorMessage.includes("not-allowed") &&
      !errorMessage.includes("denied") &&
      !errorMessage.includes("unavailable");

    if (isRecoverable) {
      commitInterimSpeech();
      scheduleRecognitionRestart();
      return;
    }

    setIsListening(false);
    isListeningRef.current = false;
    setActiveInputKey(null);
    activeInputKeyRef.current = null;
  });

  const startListening = useCallback(async (parentKey: string, partId?: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!speechRecognitionModule || !isSpeechRecognitionAvailable) {
      return;
    }

    try {
      const { status } = await speechRecognitionModule.requestPermissionsAsync();

      if (status !== "granted") {
        return;
      }

      if (isListeningRef.current) {
        commitInterimSpeech();
        isManualStopRef.current = true;
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
        }
        await speechRecognitionModule.stop();
      }

      setActiveInputKey({ parent: parentKey, partId });
      activeInputKeyRef.current = { parent: parentKey, partId };

      isManualStopRef.current = false;

      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      
      let currentText = "";
      setAnswers((prev) => {
        if (partId) {
          currentText = prev[parentKey]?.[partId] || "";
        } else {
          currentText = prev[parentKey] || "";
        }
        return prev;
      });

      committedSpeechTextRef.current = currentText;
      interimSpeechTextRef.current = "";

      await startRecognitionSession();

      setIsListening(true);
      isListeningRef.current = true;
    } catch (error: any) {
    }
  }, [startRecognitionSession, commitInterimSpeech]);

  const stopListening = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    isManualStopRef.current = true;

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }

    commitInterimSpeech();

    if (!speechRecognitionModule || !isSpeechRecognitionAvailable) {
      setIsListening(false);
      isListeningRef.current = false;
      setActiveInputKey(null);
      activeInputKeyRef.current = null;
      return;
    }

    try {
      await speechRecognitionModule.stop();
      setIsListening(false);
      isListeningRef.current = false;
      setActiveInputKey(null);
      activeInputKeyRef.current = null;
    } catch (error) {
      setIsListening(false);
      isListeningRef.current = false;
      setActiveInputKey(null);
      activeInputKeyRef.current = null;
    }
  }, [commitInterimSpeech]);

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
          <Text className="text-white/80 mb-3 text-sm font-medium">
            {part.label}
          </Text>
          <View
            className="rounded-[24px] bg-white/10 overflow-hidden border border-white/20 shadow-xl"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
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
                            className={`px-3 py-2 rounded-full border ${isRangeSelected ? "bg-white/30 border-white" : "border-white/20 bg-white/10"}`}
                          >
                            <Text
                              className={`text-xs font-bold ${isRangeSelected ? "text-white" : "text-white/70"}`}
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
                      <View className="flex-row items-center gap-2">
                        {getOptionIcon(option, isSelected ? "black" : "white", 16)}
                        <Text
                          className={`text-base font-medium ${isSelected ? "text-black" : "text-white"}`}
                        >
                          {option}
                        </Text>
                      </View>
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
                      <View className="flex-row items-center gap-2">
                        {getOptionIcon(option, isSelected ? "black" : "white", 16)}
                        <Text
                          className={`text-base font-medium ${isSelected ? "text-black" : "text-white"}`}
                        >
                          {option}
                        </Text>
                      </View>
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

  const { width: SCREEN_WIDTH } = Dimensions.get("window");
  const isTablet = SCREEN_WIDTH > 600;
  const CONTENT_WIDTH = isTablet ? 600 : SCREEN_WIDTH;

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <LinearGradient
        colors={["#001C3D", "#000000"]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      <SafeAreaView className="flex-1 items-center">
        <View style={{ width: CONTENT_WIDTH, flex: 1 }}>
          {/* Progress Bar */}
          <View className="px-6 py-4">
            <View className="h-1 bg-white/10 rounded-full w-full overflow-hidden">
              <View
                style={{ width: `${progress}%` }}
                className="h-full bg-white"
              />
            </View>
            <View className="flex-row justify-between mt-2">
              <Text className="text-white text-xs uppercase font-bold">
                Step {currentStep + 1} of {STEPS.length}
              </Text>
              <Text className="text-white text-xs font-bold">
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
                ref={scrollViewRef}
                className="flex-1 px-8 py-6"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
              >
                <Text className="text-white/80 text-xs uppercase font-bold tracking-widest mb-2">
                  {stepData.subtitle}
                </Text>
                <Text style={styles.title} className="text-white mb-2">
                  {stepData.title}
                </Text>
                {stepData.description && (
                  <Text className="text-white/90 mb-8 leading-6 text-base font-medium">
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
                              <View className="flex-row items-center gap-3">
                                {getOptionIcon(option, isSelected ? "black" : "white", 20)}
                                <Text
                                  className={`text-xl font-medium ${isSelected ? "text-black" : "text-white"}`}
                                >
                                  {option}
                                </Text>
                              </View>
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
              disabled={loading || !isStepValid()}
              className={`flex-1 h-16 rounded-full items-center justify-center flex-row gap-2 ${(loading || !isStepValid()) ? "bg-white/30" : "bg-white"}`}
            >
              {loading ? (
                <ActivityIndicator color="black" />
              ) : (
                <>
                  <Text
                    className={`font-bold text-lg ${loading || !isStepValid() ? "text-white/50" : "text-black"
                      }`}
                  >
                    {currentStep === STEPS.length - 1 ? "Finish" : "Next"}
                  </Text>
                  {currentStep < STEPS.length - 1 && (
                    <ArrowRight
                      color={loading || !isStepValid() ? "#ffffff50" : "black"}
                      size={20}
                    />
                  )}
                </>
              )}
            </TouchableOpacity>
          </View>
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
