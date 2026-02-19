import { BlurView } from "expo-blur";
import { useFocusEffect } from "expo-router";
import { Plus, X } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Image,
    ImageBackground,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
    Circle,
    Defs,
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
    onPress={() => onSelect(conversation._id)}
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
        onPress={() => onEdit(conversation)}
      >
        <Image
          source={require("../../assets/icons/edit.png")}
          className="w-4 h-4"
          resizeMode="contain"
        />
      </TouchableOpacity>
      <TouchableOpacity
        className="w-8 h-8 items-center justify-center bg-white/10 rounded-[12px]"
        onPress={() => onDelete(conversation._id)}
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

  // Calculate responsiveness
  const sidebarWidth = Math.min(width * 0.8, 300);
  const slideAnim = useRef(new Animated.Value(-sidebarWidth)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to bottom when messages update (especially during streaming)
  useEffect(() => {
    if (messages.length > 0 && isSending) {
      // During streaming, keep scrolling to bottom
      const scrollTimer = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 50);
      return () => clearTimeout(scrollTimer);
    }
  }, [messages, isSending]);

  // Fetch conversations function
  const fetchConversations = useCallback(async () => {
    if (!userEmail) return;

    console.log("Fetching conversations for:", userEmail);
    setIsLoadingConversations(true);
    setConversationsError(null);

    try {
      const data = await chatService.getConversations(userEmail);
      console.log(
        "API Response (get-conversations):",
        JSON.stringify(data, null, 2),
      );

      // Sort by _createTime in descending order (newest first)
      const sortedData = data.sort((a, b) => {
        return (
          new Date(b._createTime).getTime() - new Date(a._createTime).getTime()
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
      openCreateModal();
    }, 300); // Wait for drawer to close
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
      await chatService.createConversation({
        boardId: "crimson-volcano-YMlZP",
        chatId: "chatNode-small-field-XgvXp-copied",
        name: conversationName.trim(),
      });

      // Refresh conversations list
      await fetchConversations();

      // Close modal and reset
      // Close modal and reset
      closeCreateModal();
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

      // 5. Auto-scroll to bottom (using the ScrollView ref if it exists, or just state update triggers re-render)
      // Note: We need a ref for ScrollView to scroll.
      // I'll check if scrollViewRef exists or needs to be added.
    } catch (error) {
      console.error("Failed to load conversation history:", error);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

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
      content: "", // Start empty
      role: "Model",
      _name: "Model",
      dateTime: new Date().toISOString(),
    };

    // Add both to UI immediately
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
        console.log("🆕 Creating new conversation with title:", title);

        const response = await chatService.createConversation({
          boardId: "crimson-volcano-YMlZP",
          chatId: "chatNode-small-field-XgvXp-copied",
          name: title,
        });

        if (response && response.conversationId) {
          currentConversationId = response.conversationId;
          setActiveConversationId(currentConversationId);
          // Fetch in background to update list
          fetchConversations();
        } else {
          throw new Error("Failed to create new conversation");
        }
      }

      console.log("📤 Sending user message to history...", {
        conversationId: currentConversationId,
      });

      // 2. Save User Message to History First
      await chatService.manageHistory(
        currentConversationId!,
        content,
        userEmail,
        "User",
      );

      // 3. Stream from Poppy AI
      console.log("🌊 Starting AI stream...");
      let fullAIResponse = "";

      await poppyService.streamMessage(
        currentConversationId!,
        content,
        (delta) => {
          // Append delta to full response
          fullAIResponse += delta;

          // Update UI in real-time with incremental text
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg._id === aiMessageId
                ? { ...msg, content: fullAIResponse }
                : msg,
            ),
          );

          // Auto-scroll to bottom on new token - use setTimeout for reliability
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: false });
          }, 10);
        },
      );

      console.log(
        "✅ Poppy API complete. Full response length:",
        fullAIResponse.length,
      );

      // 4. Save Final AI Response to History
      if (fullAIResponse) {
        console.log("💾 Saving AI response to history DB...");
        await chatService.manageHistory(
          currentConversationId!,
          fullAIResponse,
          userEmail,
          "Model",
        );
        console.log("✅ AI response saved successfully");
      } else {
        console.warn("⚠️ AI response was empty, skipping save");
      }

      // Final scroll to ensure everything is visible
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);

      // Optional: Reload history to ensure everything is synced
      // await loadHistory(activeConversationId);
    } catch (error) {
      console.error("❌ Failed to process message flow:", error);

      // Remove the optimistic messages on failure or mark as error
      // For now, let's keep user message but maybe show error for AI?
      setMessages((prev) => prev.filter((m) => m._id !== aiMessageId));

      // Ideally show an error toast
      // Ideally show an error toast
      // alert('Failed to get response. Please try again.');
    } finally {
      setIsSending(false);
      // One more scroll after sending is complete
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 150);
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
          style={{ paddingTop: normalize(55) }}
        >
          <View className="flex-row items-center justify-between px-5">
            <TouchableOpacity
              onPress={openSidebar}
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
              onPress={openCreateModal}
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
          keyboardVerticalOffset={Platform.OS === "ios" ? -120 : -150}
        >
          <View
            style={{
              flex: 1,
              paddingHorizontal: 20,
              paddingTop: normalize(110),
              paddingBottom: 200,
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
                onContentSizeChange={() => {
                  // Scroll to bottom immediately when content changes
                  scrollViewRef.current?.scrollToEnd({ animated: false });
                }}
                onLayout={() => {
                  // Scroll to bottom on initial layout
                  scrollViewRef.current?.scrollToEnd({ animated: false });
                }}
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
            )}

            {/* Bottom Input Area */}
            <View
              style={{
                position: "absolute",
                bottom: insets.bottom + 110,
                left: 20,
                right: 20,
              }}
            >
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
                        onSubmitEditing={handleSendMessage}
                        returnKeyType="send"
                        placeholder="Type your message..."
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        className="flex-1 h-[44px] px-1 py-0 text-white"
                        selectionColor="#fff"
                      />
                      <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-full relative bg-black/30">
                        <GradientRingSVG />
                        <Image
                          source={require("../../assets/icons/voice.png")}
                          className="w-5 h-5"
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                    </View>
                  </BlurView>
                </View>

                <TouchableOpacity
                  onPress={handleSendMessage}
                  disabled={!inputText.trim() || isSending}
                  className="w-[56px] h-[56px] rounded-full items-center justify-center overflow-hidden"
                  style={{ opacity: !inputText.trim() || isSending ? 0.7 : 1 }}
                >
                  <ImageBackground
                    source={require("../../assets/images/button-bg.png")}
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
            onPress={closeSidebar}
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

            <View className="flex-1">
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
            </View>
          </Animated.View>

          {/* Delete Confirmation Overlay (Global Sibling) */}
          {isDeleteModalVisible && (
            <View
              className="absolute inset-0 bg-black/80 items-center justify-center p-4 z-50"
              style={{
                width: width, // Ensure it spans full screen width
                height: height + insets.top + insets.bottom,
                top: 0,
                left: 0,
              }}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => !isDeleting && setIsDeleteModalVisible(false)}
                className="absolute inset-0"
              />
              <View className="bg-[#1A1A1A] w-full max-w-xs p-6 rounded-2xl border border-white/10 z-10">
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
        animationType="fade"
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
              onPress={closeEditModal}
              className="absolute inset-0"
            />
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
                        autoFocus
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
                  source={require("../../assets/images/button-bg.png")}
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
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Create Conversation Modal */}
      <Modal
        visible={isCreateModalVisible}
        transparent={true}
        animationType="fade"
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
              onPress={closeCreateModal}
              className="absolute inset-0"
            />
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
                        autoFocus
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
                  source={require("../../assets/images/button-bg.png")}
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
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
