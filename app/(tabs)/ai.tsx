import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useFocusEffect } from "expo-router";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { Plus, X } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
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
  useWindowDimensions,
  View,
=======
import {
    ExpoSpeechRecognitionModule,
    useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { Plus, X } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
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
    useWindowDimensions,
    View,
>>>>>>> Stashed changes
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
    Circle,
    Defs,
    Path,
    Rect,
    Stop,
    LinearGradient as SvgLinearGradient,
} from "react-native-svg";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";
import { MarkdownText } from "../../components/common/MarkdownText";
import { normalize } from "../../constants/Fonts";
import { useNotification } from "../../context/NotificationContext";
import chatService, { Conversation, Message } from "../../services/api/chat";
import poppyService from "../../services/api/poppy";
import { RootState } from "../../store/store";

/* ---------- Gradient Ring Component ---------- */
const GradientRingSVG = () => {
  const size = normalize(38);
  const strokeWidth = 1;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  return (
    <View style={ringStyles.container}>
      <BlurView intensity={5} style={ringStyles.blurContainer}>
        <Svg width={size} height={size}>
          <Defs>
            <SvgLinearGradient
              id="headerGrad"
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
            stroke="url(#headerGrad)"
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
    width: normalize(38),
    height: normalize(38),
    borderRadius: normalize(19),
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
});

/* ---------- Typing Animation Component - Single Pulsing Dot ---------- */
const TypingDots = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0.4,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  }, []);

  return (
    <View className="flex-row items-center h-6 px-1">
      <Animated.View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: "#FFFFFF",
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }}
      />
    </View>
  );
};

const ChatItem = ({
  conversation,
  onSelect,
  onEdit,
  onDelete,
}: {
  conversation: Conversation;
  onSelect: (id: string) => void;
  onEdit: (conversation: Conversation) => void;
  onDelete: (id: string) => void;
}) => (
  <TouchableOpacity
    className="flex-row items-center justify-between bg-[#1A1A1A] p-4 rounded-xl mb-3"
    activeOpacity={0.7}
    onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSelect(conversation._id);
    }}
  >
    <View className="flex-row items-center flex-1">
      <Image
        source={require("../../assets/icons/chat.png")}
        className="w-5 h-5"
        resizeMode="contain"
      />
      <Text
        className="text-white ml-3 font-inter text-base flex-1"
        numberOfLines={1}
      >
        {conversation.conversationName}
      </Text>
    </View>
    <View className="flex-row items-center gap-2">
      <TouchableOpacity
        className="w-8 h-8 items-center justify-center bg-white/10 rounded-[12px]"
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onEdit(conversation);
        }}
      >
        <Image
          source={require("../../assets/icons/edit.png")}
          className="w-4 h-4"
          resizeMode="contain"
        />
      </TouchableOpacity>
      <TouchableOpacity
        className="w-8 h-8 items-center justify-center bg-white/10 rounded-[12px]"
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onDelete(conversation._id);
        }}
      >
        <Image
          source={require("../../assets/icons/delete.png")}
          className="w-4 h-4"
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

import { memo } from "react";

/* ---------- Chat Message Component ---------- */
const ChatMessage = memo(
  ({
    message,
    profilePicture,
  }: {
    message: Message;
    profilePicture: string | null;
  }) => {
    const isUser = message.role === "User";

    if (isUser) {
      // User message - right side with sharp top-right corner
      return (
        <View className="mb-4 flex-row justify-end items-start">
          <View className="max-w-[75%] relative">
            <BlurView
              intensity={20}
              tint="light"
              style={{
                paddingTop: 13,
                paddingRight: 21,
                paddingBottom: 13,
                paddingLeft: 21,
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                borderRadius: 24,
                borderTopRightRadius: 0,
                overflow: "hidden",
              }}
            >
              <Text className="text-white font-inter text-base leading-6">
                {message.content}
              </Text>
            </BlurView>
            {/* Border Overlay */}
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                inset: 0,
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.4)",
                borderRadius: 24,
                borderTopRightRadius: 0,
              }}
            />
          </View>
          <View
            className="ml-2 w-8 h-8 rounded-full overflow-hidden items-center justify-center"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
          >
            <Image
              source={
                profilePicture
                  ? { uri: profilePicture }
                  : require("../../assets/icons/nav_user.png")
              }
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
        </View>
      );
    } else {
      // AI message - left side with sharp top-left corner
      return (
        <View className="mb-4 flex-row justify-start items-start">
          <View className="w-10 h-10 items-center justify-center mr-2">
            <Image
              source={require("../../assets/icons/chat_ai.png")}
              className="w-10 h-10"
              resizeMode="contain"
            />
          </View>
          <View className="max-w-[75%] relative">
            <BlurView
              intensity={14}
              tint="dark"
              style={{
                paddingTop: 13,
                paddingRight: 21,
                paddingBottom: 13,
                paddingLeft: 21,
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                borderRadius: 24,
                borderTopLeftRadius: 0,
                overflow: "hidden",
              }}
            >
              {message.content ? (
                <MarkdownText content={message.content} />
              ) : (
                <TypingDots />
              )}
            </BlurView>
            {/* Border Overlay */}
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                inset: 0,
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.5)",
                borderRadius: 24,
                borderTopLeftRadius: 0,
              }}
            />
          </View>
        </View>
      );
    }
  },
);

export default function AI() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const userName = useSelector((state: RootState) => state.user.userName);
  const userEmail = useSelector((state: RootState) => state.user.email);
  const profilePicture = useSelector(
    (state: RootState) => state.user.profilePicture,
  );
  const aiAdditions = useSelector((state: RootState) => state.user.aiAdditions);

  // Get dynamic boardId and chatId from user's aiAdditions
  const poppyBoardId =
    aiAdditions?.poppyAIChatbot?.boardId || "weathered-grassland-TB9JJ";
  const poppyChatId =
    aiAdditions?.poppyAIChatbot?.chatId || "chatNode-hidden-butterfly-ugi_J";
  const { addNotification } = useNotification();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [conversationsError, setConversationsError] = useState<string | null>(
    null,
  );

  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [conversationName, setConversationName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit conversation state
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editConversationId, setEditConversationId] = useState<string | null>(
    null,
  );
  const [editName, setEditName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete conversation state
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<
    string | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Chat history state
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const scrollToBottomAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const lastResultIndex = useRef<number>(0);
  const lastProcessedResult = useRef<number>(0);

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

      setInputText((prev) => {
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
      lastResultIndex.current = inputText.length;
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
      lastResultIndex.current = inputText.length;
      lastProcessedResult.current = 0;
    } catch (error) {
      console.log("Stop Voice Error:", error);
      setIsListening(false);
    }
  };

  // Calculate responsiveness
  const sidebarWidth = Math.min(width * 0.8, 300);
  const slideAnim = useRef(new Animated.Value(-sidebarWidth)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const lastScrollY = useRef(0);
  const isUserAtBottomRef = useRef(true); // Track scroll position without re-renders

  // Auto-scroll to bottom when messages update (especially during streaming)
  // Only scrolls if user hasn't manually scrolled up
  const lastScrollTime = useRef(0);
  useEffect(() => {
    if (messages.length > 0 && isSending && isUserAtBottomRef.current) {
      const now = Date.now();
      if (now - lastScrollTime.current > 100) {
        lastScrollTime.current = now;
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }
    }
  }, [messages, isSending]);

  // Fetch conversations function
  const fetchConversations = useCallback(async () => {
    if (!userEmail) return;

    setIsLoadingConversations(true);
    setConversationsError(null);

    try {
      const data = await chatService.getConversations(userEmail);

      const validData = Array.isArray(data)
        ? data.filter(
            (c: any) =>
              c &&
              typeof c === "object" &&
              c._id &&
              String(c._id).trim() !== "",
          )
        : [];

      const sortedData = validData.sort((a, b) => {
        return (
          new Date(b._createTime || 0).getTime() -
          new Date(a._createTime || 0).getTime()
        );
      });
      setConversations(sortedData);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      setConversationsError("Failed to load conversations");
    } finally {
      setIsLoadingConversations(false);
    }
  }, [userEmail]);

  // Fetch conversations when page comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [fetchConversations]),
  );

  // Initial fetch when user logs in
  useEffect(() => {
    if (userEmail) {
      fetchConversations();
    }
  }, [userEmail]);

  const openCreateModal = () => {
    setConversationName("");
    setCreateError(null);
    setIsCreateModalVisible(true);
  };

  const openCreateModalFromDrawer = () => {
    closeSidebar();
    setTimeout(() => {
      setActiveConversationId(null);
      setMessages([]);
      setInputText("");
    }, 300);
  };

  const closeCreateModal = () => {
    setIsCreateModalVisible(false);
    setConversationName("");
    setCreateError(null);
  };

  const handleCreateConversation = async () => {
    if (!conversationName.trim()) {
      setCreateError("Please enter a conversation name");
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      const response = await chatService.createConversation({
        boardId: poppyBoardId,
        chatId: poppyChatId,
        name: conversationName.trim(),
      });

      // Refresh conversations list
      await fetchConversations();

      // Close modal and reset
      closeCreateModal();

      // Automatically open the newly created conversation
      if (response && response.conversationId) {
        // Close sidebar if open
        if (isSidebarOpen) {
          closeSidebar();
        }

        // Load the conversation and start chatting
        await loadHistory(response.conversationId);
      }

      Toast.show({
        type: "success",
        text1: "Conversation Created",
        text2: "Conversation created successfully",
      });
      addNotification({
        type: "success",
        title: "Conversation Created",
        message: `Created new conversation: ${conversationName.trim()}`,
      });
    } catch (error) {
      console.error("Failed to create conversation:", error);
      setCreateError("Failed to create conversation. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const openEditModal = (conversation: Conversation) => {
    // Use conversationId if available, otherwise _id
    const targetId = conversation.conversationId || conversation._id;
    setEditConversationId(targetId);
    setEditName(conversation.conversationName);
    setEditError(null);

    // Close sidebar first to avoid modal stacking issues
    closeSidebar();
    setTimeout(() => {
      setIsEditModalVisible(true);
    }, 300);
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setEditConversationId(null);
    setEditName("");
    setEditError(null);
  };

  const handleEditConversation = async () => {
    if (!editName.trim() || !editConversationId) {
      setEditError("Please enter a conversation name");
      return;
    }

    setIsEditing(true);
    setEditError(null);

    try {
      await chatService.editConversation(editConversationId, editName.trim());

      // Refresh conversations list
      await fetchConversations();

      // Close modal and reset
      closeEditModal();
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Conversation name updated",
      });
      addNotification({
        type: "success",
        title: "Conversation Updated",
        message: `Updated conversation name to: ${editName.trim()}`,
      });
    } catch (error) {
      console.error("Failed to edit conversation:", error);
      setEditError("Failed to update conversation. Please try again.");
    } finally {
      setIsEditing(false);
    }
  };

  const loadHistory = async (conversationId: string) => {
    setActiveConversationId(conversationId);
    setIsLoadingMessages(true);
    setMessages([]);

    try {
      const history = await chatService.getHistory(conversationId);

      // 2. Sort by timestamp (oldest first)
      const sortedMessages = history.sort((a, b) => {
        const timeA = new Date(a._createTime).getTime();
        const timeB = new Date(b._createTime).getTime();
        return timeA - timeB;
      });

      // 3. Ensure valid messages and set state
      // The API returns Message[] directly, so we filter ensuring content exists
      const validMessages = sortedMessages.filter(
        (msg) => msg.role && msg.content,
      );

      setMessages(validMessages);

      // Auto-scroll to bottom after loading
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
    } catch (error) {
      console.error("Failed to load conversation history:", error);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Ref for batching streaming token updates
  const streamBufferRef = useRef("");
  const rafIdRef = useRef<number | null>(null);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isSending || !userEmail) return;

    const content = inputText.trim();
    setInputText("");
    setIsSending(true);

    // 1. Optimistic update: Add user message immediately
    const userMessageId = Date.now().toString();
    const optimisticUserMessage: Message = {
      _id: userMessageId,
      _createTime: new Date().toISOString(),
      _updateTime: new Date().toISOString(),
      content: content,
      role: "User",
      _name: "User",
      dateTime: new Date().toISOString(),
    };

    // Create placeholder for AI message (streaming)
    const aiMessageId = (Date.now() + 1).toString();
    const optimisticAIMessage: Message = {
      _id: aiMessageId,
      _createTime: new Date().toISOString(),
      _updateTime: new Date().toISOString(),
      content: "",
      role: "Model",
      _name: "Model",
      dateTime: new Date().toISOString(),
    };

    setMessages((prev) => [
      ...prev,
      optimisticUserMessage,
      optimisticAIMessage,
    ]);

    let currentConversationId = activeConversationId;

    try {
      // Auto-create conversation if not exists
      if (!currentConversationId) {
        const title =
          content.length > 30 ? content.substring(0, 30) + "..." : content;

        const response = await chatService.createConversation({
          boardId: poppyBoardId,
          chatId: poppyChatId,
          name: title,
        });

        if (response && response.conversationId) {
          currentConversationId = response.conversationId;
          setActiveConversationId(currentConversationId);
          fetchConversations();
        } else {
          throw new Error("Failed to create new conversation");
        }
      }

      // 2. Save User Message to History AND start AI stream IN PARALLEL
      // This saves ~200-500ms by not waiting for the history save before streaming
      let fullAIResponse = "";
      streamBufferRef.current = "";

      // Batched UI update function — coalesces rapid token arrivals into
      // a single setMessages call per animation frame (~16ms)
      const flushStreamBuffer = () => {
        const buffered = streamBufferRef.current;
        if (buffered) {
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg._id === aiMessageId ? { ...msg, content: buffered } : msg,
            ),
          );
          // Only auto-scroll if user is at bottom
          if (isUserAtBottomRef.current) {
            scrollViewRef.current?.scrollToEnd({ animated: false });
          }
        }
        rafIdRef.current = null;
      };

      const [,] = await Promise.all([
        // Save user message (fire-and-forget, don't block streaming)
        chatService.manageHistory(
          currentConversationId!,
          content,
          userEmail,
          "User",
        ),
        // Stream from Poppy AI
        poppyService.streamMessage(
          currentConversationId!,
          content,
          poppyBoardId,
          poppyChatId,
          (delta) => {
            fullAIResponse += delta;
            streamBufferRef.current = fullAIResponse;

            // Schedule a batched UI update on the next animation frame
            if (!rafIdRef.current) {
              rafIdRef.current = requestAnimationFrame(flushStreamBuffer);
            }
          },
        ),
      ]);

      // Flush any remaining buffered content
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      // Final UI update with complete response
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === aiMessageId ? { ...msg, content: fullAIResponse } : msg,
        ),
      );

      // 4. Save AI Response to History in background (don't block UI)
      if (fullAIResponse) {
        chatService
          .manageHistory(
            currentConversationId!,
            fullAIResponse,
            userEmail,
            "Model",
          )
          .catch((err) => console.error("Failed to save AI response:", err));
      }

      // Final scroll only if user is at bottom
      if (isUserAtBottomRef.current) {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: false });
        }, 50);
      }
    } catch (error) {
      console.error("Failed to process message flow:", error);
      setMessages((prev) => prev.filter((m) => m._id !== aiMessageId));
    } finally {
      setIsSending(false);
      setTimeout(() => {
        if (isUserAtBottomRef.current) {
          scrollViewRef.current?.scrollToEnd({ animated: false });
        }
      }, 50);
    }
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const openSidebar = () => {
    setIsModalVisible(true);
    setIsSidebarOpen(true);

    // Parallel animation for smooth open
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeSidebar = () => {
    // Parallel animation for smooth close
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -sidebarWidth,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsSidebarOpen(false);
      setIsModalVisible(false);
    });
  };

  const handleDeleteConversation = async () => {
    if (!conversationToDelete || !userEmail) return;

    setIsDeleting(true);

    try {
      await chatService.deleteConversation(userEmail, conversationToDelete);

      // Remove from list
      setConversations((prev) =>
        prev.filter((c) => c._id !== conversationToDelete),
      );

      // If active conversation was deleted, clear it
      if (activeConversationId === conversationToDelete) {
        setActiveConversationId(null);
        setMessages([]);
      }

      // Close modal
      setIsDeleteModalVisible(false);
      setConversationToDelete(null);

      // Show Toast
      Toast.show({
        type: "success",
        text1: "Chat Deleted",
        text2: "Chat deleted successfully",
      });
      addNotification({
        type: "success",
        title: "Chat Deleted",
        message: "Successfully deleted the conversation",
      });
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      alert("Failed to delete conversation");
      // Keep modal open on error so user can try again or cancel
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {/* Header Container (Absolute to match Home/Profile) */}
        <View
          className="absolute top-0 left-0 right-0 z-10"
          style={{ paddingTop: Math.max(insets.top + 10, normalize(55)) }}
        >
          <View className="flex-row items-center justify-between px-5">
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                openSidebar();
              }}
              style={{
                width: normalize(38),
                height: normalize(38),
                backgroundColor: "#00000080",
              }}
              className="items-center justify-center rounded-full relative"
            >
              <GradientRingSVG />
              <Image
                source={require("../../assets/icons/menu.png")}
                className="w-6 h-6"
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold font-inter">
              Sosh AI
            </Text>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveConversationId(null);
                setMessages([]);
                setInputText("");
              }}
              style={{ width: normalize(38), height: normalize(38) }}
              className="items-center justify-center rounded-full relative"
            >
              <GradientRingSVG />
              <Plus color="#fff" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Container with Keyboard Avoiding */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
          enabled={!isCreateModalVisible && !isEditModalVisible}
        >
          <View
            style={{
              flex: 1,
              paddingHorizontal: 20,
              paddingTop: Math.max(insets.top + 60, normalize(110)),
              paddingBottom: isKeyboardVisible ? 20 : insets.bottom + 110,
            }}
          >
            {/* Chat Messages or Greeting Content */}
            {activeConversationId ? (
              // Show chat messages when conversation is active
              <ScrollView
                ref={scrollViewRef}
                className="flex-1"
                contentContainerStyle={{
                  paddingVertical: 20,
                  paddingBottom: 40,
                }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                onScroll={(e) => {
                  const { contentOffset, contentSize, layoutMeasurement } =
                    e.nativeEvent;
                  // Dismiss keyboard only when scrolling UP
                  if (
                    isKeyboardVisible &&
                    contentOffset.y < lastScrollY.current - 5
                  ) {
                    Keyboard.dismiss();
                  }
                  lastScrollY.current = contentOffset.y;
                  const distanceFromBottom =
                    contentSize.height -
                    layoutMeasurement.height -
                    contentOffset.y;
                  const atBottom = distanceFromBottom < 80;
                  // Update ref for streaming auto-scroll (no re-render)
                  isUserAtBottomRef.current = atBottom;
                  if (atBottom !== isAtBottom) {
                    setIsAtBottom(atBottom);
                    Animated.timing(scrollToBottomAnim, {
                      toValue: atBottom ? 0 : 1,
                      duration: 200,
                      useNativeDriver: true,
                    }).start();
                  }
                }}
                scrollEventThrottle={16}
              >
                {isLoadingMessages ? (
                  <View className="flex-1 items-center justify-center py-20">
                    <ActivityIndicator size="large" color="#fff" />
                    <Text className="text-white/60 font-inter mt-4">
                      Loading messages...
                    </Text>
                  </View>
                ) : messages.length > 0 ? (
                  messages.map((message, index) => (
                    <ChatMessage
                      key={`${message._id}-${index}`}
                      message={message}
                      profilePicture={profilePicture}
                    />
                  ))
                ) : (
                  <View className="flex-1 items-center justify-center py-20">
                    <Text className="text-white/60 font-inter">
                      No messages yet
                    </Text>
                  </View>
                )}
              </ScrollView>
            ) : (
              // Show greeting when no conversation is active
              <TouchableWithoutFeedback
                onPress={Keyboard.dismiss}
                accessible={false}
              >
                <View className="flex-1 items-center justify-center">
                  <View className="items-center">
                    <Text
                      className="text-white font-normal text-center mb-2"
                      style={{
                        fontFamily: "Questrial_400Regular",
                        fontSize: Math.min(width * 0.1, 42),
                        lineHeight: Math.min(width * 0.12, 50),
                      }}
                    >
                      Hi, {userName}
                    </Text>
                    <Text
                      className="text-white/60 font-inter text-center"
                      style={{ fontSize: Math.min(width * 0.045, 18) }}
                    >
                      How may I help you?
                    </Text>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            )}

            {/* Scroll to Bottom Button — ChatGPT style */}
            {activeConversationId && (
              <Animated.View
                pointerEvents={isAtBottom ? "none" : "auto"}
                style={{
                  alignItems: "center",
                  height: 0,
                  overflow: "visible",
                  zIndex: 10,
                  opacity: scrollToBottomAnim,
                  transform: [
                    {
                      scale: scrollToBottomAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                    setIsAtBottom(true);
                    Animated.timing(scrollToBottomAnim, {
                      toValue: 0,
                      duration: 200,
                      useNativeDriver: true,
                    }).start();
                  }}
                  activeOpacity={0.7}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: "#0A0A0A",
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: -36,
                  }}
                >
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M12 5v14M5 12l7 7 7-7"
                      stroke="#fff"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Bottom Input Area */}
            <View style={{ paddingTop: 10 }}>
              <View className="flex-row items-center gap-3">
                <View
                  className="flex-1 h-[56px] rounded-full overflow-hidden"
                  style={{ position: "relative" }}
                >
                  <BlurView intensity={30} tint="dark" className="flex-1">
                    <View
                      className="flex-1 flex-row items-center pl-5 pr-4 rounded-full"
                      style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                    >
                      {/* SVG Gradient Border */}
                      <View
                        style={{ position: "absolute", inset: 0 }}
                        pointerEvents="none"
                      >
                        <Svg height="100%" width="100%">
                          <Defs>
                            <SvgLinearGradient
                              id="inputBorderGrad"
                              x1="0%"
                              y1="0%"
                              x2="100%"
                              y2="0%"
                            >
                              <Stop
                                offset="0%"
                                stopColor="rgba(141, 138, 138, 0.4)"
                                stopOpacity="1"
                              />
                              <Stop
                                offset="48.56%"
                                stopColor="rgba(65, 65, 65, 0.4)"
                                stopOpacity="1"
                              />
                              <Stop
                                offset="100%"
                                stopColor="rgba(141, 138, 138, 0.4)"
                                stopOpacity="1"
                              />
                            </SvgLinearGradient>
                          </Defs>
                          <Rect
                            x="0.34"
                            y="0.34"
                            width="99.3%"
                            height="99%"
                            rx="28"
                            ry="28"
                            stroke="url(#inputBorderGrad)"
                            strokeWidth="0.68"
                            fill="transparent"
                          />
                        </Svg>
                      </View>
                      <TextInput
                        value={inputText}
                        onChangeText={setInputText}
                        onFocus={() => setIsKeyboardVisible(true)}
                        onBlur={() => setIsKeyboardVisible(false)}
                        placeholder={
                          isListening ? "Listening..." : "Type your message..."
                        }
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        className="flex-1 h-[44px] px-1 py-0 text-white"
                        style={{
                          textAlignVertical: "center",
                          paddingTop: Platform.OS === "ios" ? 12 : 0,
                        }}
                        selectionColor="#fff"
                        multiline={true}
                      />
                      <Animated.View
                        style={{
                          transform: [{ scale: isListening ? pulseAnim : 1 }],
                        }}
                      >
                        <TouchableOpacity
=======
                      <TouchableOpacity
                        onPress={isListening ? stopListening : startListening}
                        style={{
                          width: 40,
                          height: 40,
                        }}
                      >
                        <Animated.View
>>>>>>> Stashed changes
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: isListening
                              ? "#ef4444"
                              : "rgba(0,0,0,0.3)",
                            position: "relative",
                          }}
                          onPress={isListening ? stopListening : startListening}
                        >
                          {!isListening && <GradientRingSVG />}
                          {isListening ? (
                            <View
                              style={{
                                width: 12,
                                height: 12,
                                backgroundColor: "#fff",
                                borderRadius: 3,
                              }}
                            />
                          ) : (
                            <Image
                              source={require("../../assets/icons/voice.png")}
                              className="w-5 h-5"
                              resizeMode="contain"
                            />
                          )}
                        </Animated.View>
                      </TouchableOpacity>
                    </View>
                  </BlurView>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    handleSendMessage();
                  }}
                  disabled={!inputText.trim() || isSending}
                  className="w-[56px] h-[56px] rounded-full items-center justify-center overflow-hidden"
                  style={{ opacity: !inputText.trim() || isSending ? 0.7 : 1 }}
                >
                  <ImageBackground
                    source={require("../../assets/images/post_without.jpg")}
                    className="w-full h-full items-center justify-center"
                    resizeMode="cover"
                  >
                    <View className="absolute inset-0 bg-blue-500/20" />
                    {isSending ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Image
                        source={require("../../assets/icons/send-msg.png")}
                        className="w-6 h-6"
                        resizeMode="contain"
                      />
                    )}
                  </ImageBackground>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* Sidebar Overlay */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeSidebar}
      >
        <View className="flex-1 flex-row">
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              closeSidebar();
            }}
            className="absolute inset-0 bg-black/60"
          />
          <Animated.View
            style={{
              width: sidebarWidth,
              height: height + insets.top + insets.bottom,
              left: -9,
              borderTopRightRadius: 24,
              borderBottomRightRadius: 24,
              overflow: "hidden",
              transform: [{ translateX: slideAnim }],
              paddingTop: Math.max(insets.top, 40),
            }}
            className="bg-[#0A0A0A] p-6"
          >
            <View className="flex-row items-center justify-between mb-8">
              <Text className="text-white text-2xl font-bold font-inter">
                Chat History
              </Text>
              <TouchableOpacity
                onPress={closeSidebar}
                style={{ width: normalize(38), height: normalize(38) }}
                className="items-center justify-center rounded-full relative"
              >
                <GradientRingSVG />
                <X color="#fff" size={24} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={openCreateModalFromDrawer}
              className="flex-row items-center bg-white/10 p-4 rounded-xl mb-8 border border-white/5"
            >
              <Plus color="#fff" size={20} />
              <Text className="text-white ml-3 font-inter font-medium text-base">
                New chat
              </Text>
            </TouchableOpacity>

            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              bounces={true}
            >
              {isLoadingConversations ? (
                <View className="items-center justify-center py-8">
                  <ActivityIndicator size="large" color="#fff" />
                  <Text className="text-white/60 font-inter text-sm mt-4">
                    Loading conversations...
                  </Text>
                </View>
              ) : conversationsError ? (
                <View className="items-center justify-center py-8">
                  <Text className="text-red-400 font-inter text-sm">
                    {conversationsError}
                  </Text>
                </View>
              ) : conversations.length > 0 ? (
                <>
                  <Text className="text-white/40 font-inter font-medium text-sm mb-4 tracking-wider">
                    Recent chats
                  </Text>
                  {conversations.map((conversation) => (
                    <ChatItem
                      key={conversation._id}
                      conversation={conversation}
                      onSelect={(id) => {
                        loadHistory(id);
                        closeSidebar();
                      }}
                      onEdit={openEditModal}
                      onDelete={(id) => {
                        setConversationToDelete(id);
                        setIsDeleteModalVisible(true);
                      }}
                    />
                  ))}
                </>
              ) : (
                <View className="items-center justify-center py-8">
                  <Text className="text-white/60 font-inter text-sm">
                    No conversations yet
                  </Text>
                </View>
              )}
            </ScrollView>
          </Animated.View>

          {/* Delete Confirmation Overlay (Global Sibling) */}
          {isDeleteModalVisible && (
            <View
              className="bg-black/80 items-center justify-center p-4 z-50 elevation-5"
              style={StyleSheet.absoluteFill}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => !isDeleting && setIsDeleteModalVisible(false)}
                style={StyleSheet.absoluteFill}
              />
              <View
                className="bg-[#1A1A1A] w-full max-w-xs p-6 rounded-2xl border border-white/10 z-10 elevation-5"
                style={{ zIndex: 100 }}
              >
                <Text className="text-white text-lg font-bold font-inter text-center mb-2">
                  Delete Chat?
                </Text>
                <Text className="text-white/60 text-sm font-inter text-center mb-6">
                  Are you sure you want to delete this chat? This action cannot
                  be undone.
                </Text>

                <View className="flex-row gap-3">
                  <TouchableOpacity
                    className="flex-1 py-3 bg-white/10 rounded-xl items-center"
                    onPress={() => setIsDeleteModalVisible(false)}
                    disabled={isDeleting}
                  >
                    <Text className="text-white font-semibold">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 py-3 bg-red-500/20 items-center justify-center rounded-xl"
                    onPress={handleDeleteConversation}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <ActivityIndicator size="small" color="#ef4444" />
                    ) : (
                      <Text className="text-red-500 font-semibold">Delete</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </Modal>

      {/* Edit Conversation Modal */}
      <Modal
        visible={isEditModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeEditModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? -150 : 0}
          className="flex-1"
        >
          <View className="flex-1 items-center justify-center bg-black/70">
            <TouchableOpacity
              activeOpacity={1}
              onPress={Keyboard.dismiss}
              className="absolute inset-0"
            />
            <TouchableWithoutFeedback
              onPress={Keyboard.dismiss}
              accessible={false}
            >
              <View
                style={{ width: Math.min(width * 0.85, 350) }}
                className="bg-[#1A1A1A] rounded-3xl p-6 border border-white/10"
              >
                <View className="flex-row items-center justify-between mb-6">
                  <Text className="text-white text-2xl font-bold font-inter">
                    Edit Conversation
                  </Text>
                  <TouchableOpacity
                    onPress={closeEditModal}
                    style={{ width: normalize(32), height: normalize(32) }}
                    className="items-center justify-center rounded-full bg-white/10"
                  >
                    <X color="#fff" size={20} />
                  </TouchableOpacity>
                </View>

                <Text className="text-white/60 font-inter text-sm mb-3">
                  Conversation Name
                </Text>

                <View className="mb-4">
                  <View
                    className="h-[56px] rounded-2xl overflow-hidden"
                    style={{ position: "relative" }}
                  >
                    <BlurView intensity={30} tint="dark" className="flex-1">
                      <View
                        className="flex-1 px-5 rounded-2xl justify-center"
                        style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                      >
                        <TextInput
                          value={editName}
                          onChangeText={setEditName}
                          placeholder="Enter conversation name..."
                          placeholderTextColor="rgba(255,255,255,0.4)"
                          className="flex-1 h-[44px] px-1 py-0 text-white"
                          selectionColor="#fff"
                          editable={!isEditing}
                          onSubmitEditing={handleEditConversation}
                        />
                      </View>
                    </BlurView>
                  </View>
                </View>

                {editError && (
                  <Text className="text-red-400 font-inter text-sm mb-4">
                    {editError}
                  </Text>
                )}

                <TouchableOpacity
                  onPress={handleEditConversation}
                  disabled={isEditing || !editName.trim()}
                  className="h-[56px] rounded-2xl items-center justify-center overflow-hidden"
                  style={{
                    opacity: isEditing || !editName.trim() ? 0.5 : 1,
                  }}
                >
                  <ImageBackground
                    source={require("../../assets/images/post_without.jpg")}
                    className="w-full h-full items-center justify-center"
                    resizeMode="cover"
                  >
                    <View className="absolute inset-0 bg-blue-500/20" />
                    {isEditing ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text className="text-white font-inter font-semibold text-base">
                        Save Changes
                      </Text>
                    )}
                  </ImageBackground>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Create Conversation Modal */}
      <Modal
        visible={isCreateModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeCreateModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? -150 : 0}
          className="flex-1"
        >
          <View className="flex-1 items-center justify-center bg-black/70">
            <TouchableOpacity
              activeOpacity={1}
              onPress={Keyboard.dismiss}
              className="absolute inset-0"
            />
            <TouchableWithoutFeedback
              onPress={Keyboard.dismiss}
              accessible={false}
            >
              <View
                style={{ width: Math.min(width * 0.85, 350) }}
                className="bg-[#1A1A1A] rounded-3xl p-6 border border-white/10"
              >
                <View className="flex-row items-center justify-between mb-6">
                  <Text className="text-white text-2xl font-bold font-inter">
                    New Conversation
                  </Text>
                  <TouchableOpacity
                    onPress={closeCreateModal}
                    style={{ width: normalize(32), height: normalize(32) }}
                    className="items-center justify-center rounded-full bg-white/10"
                  >
                    <X color="#fff" size={20} />
                  </TouchableOpacity>
                </View>

                <Text className="text-white/60 font-inter text-sm mb-3">
                  Conversation Name
                </Text>

                <View className="mb-4">
                  <View
                    className="h-[56px] rounded-2xl overflow-hidden"
                    style={{ position: "relative" }}
                  >
                    <BlurView intensity={30} tint="dark" className="flex-1">
                      <View
                        className="flex-1 px-5 rounded-2xl justify-center"
                        style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                      >
                        <TextInput
                          value={conversationName}
                          onChangeText={setConversationName}
                          placeholder="Enter conversation name..."
                          placeholderTextColor="rgba(255,255,255,0.4)"
                          className="flex-1 h-[44px] px-1 py-0 text-white"
                          selectionColor="#fff"
                          editable={!isCreating}
                          onSubmitEditing={handleCreateConversation}
                        />
                      </View>
                    </BlurView>
                  </View>
                </View>

                {createError && (
                  <Text className="text-red-400 font-inter text-sm mb-4">
                    {createError}
                  </Text>
                )}

                <TouchableOpacity
                  onPress={handleCreateConversation}
                  disabled={isCreating || !conversationName.trim()}
                  className="h-[56px] rounded-2xl items-center justify-center overflow-hidden"
                  style={{
                    opacity: isCreating || !conversationName.trim() ? 0.5 : 1,
                  }}
                >
                  <ImageBackground
                    source={require("../../assets/images/post_without.jpg")}
                    className="w-full h-full items-center justify-center"
                    resizeMode="cover"
                  >
                    <View className="absolute inset-0 bg-blue-500/20" />
                    {isCreating ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text className="text-white font-inter font-semibold text-base">
                        Create Conversation
                      </Text>
                    )}
                  </ImageBackground>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
