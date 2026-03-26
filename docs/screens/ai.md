# AI Chat (Poppy) Screen Documentation

The `AI` screen is a fully-featured chat interface powered by Poppy AI. It supports real-time streaming, conversation history management, and voice-to-text input.

## 1. 🧠 Logic / Business Logic

### Chat Logic
- **Streaming**: Implements real-time text delivery where responses "type out" character by character using `poppyService.streamMessage`.
- **History Management**: Users can create new conversations, rename existing ones, and delete history.
- **Optimistic Updates**: Messages are added to the local UI state before the API confirms, providing a snappy experience.

### State Variables
- **`conversations`**: Array of `Conversation` objects fetched from the backend.
- **`messages`**: List of messages for the currently active conversation.
- **`isStreaming`**: Boolean flag to disable inputs and show the "AI is typing" indicator.
- **`isSpeechModalVisible`**: Controls the visibility of the voice recognition UI.

### Key Handlers
- **`sendMessage`**: 
    1. Validates input.
    2. Sends prompt to `poppyService.streamMessage`.
    3. Handles the `onChunk` callback to update the last message in the `messages` array in real-time.
    4. Triggers `Haptics` on completion.
- **`onFeedback`**: Allows users to "Thumbs Up/Down" AI responses, which syncs with the backend for model training.

---

## 2. 🔌 API Integration

### Services
- **`chatService`**: Handles CRUD operations for conversation metadata (`getConversations`, `createConversation`, `deleteConversation`).
- **`poppyService`**: Specifically handles the `streamMessage` POST request via XHR for SSE.
- **`speechRecognitionModule`**: Interfaces with native OS voice-to-text capabilities.

### Data Flow
1. Fetch `conversations` on mount.
2. Select conversation -> Fetch `messages`.
3. Send message -> Stream from Poppy AI -> Save complete response to DB.

---

## 3. 🎨 UI / User Interface

### Components
- **Message Bubbles**: Distinct styles for `User` (right-aligned, glass border) and `AI` (left-aligned, clean text).
- **`MarkdownText`**: Used to render AI responses, supporting bold, lists, and code blocks.
- **`TypingDots`**: A custom pulsing animation shown while the AI is computing a response.
- **Action Tools**: Inline buttons for "Copy", "Thumbs Up", and "Thumbs Down" visible on AI messages.

### User Interactions
- **Voice Input**: A microphone button triggers a modal that listens to speech and populates the text input.
- **Conversation List**: A sliding or modal list allowing users to switch between different AI chat topics.
- **Auto-scroll**: The `ScrollView` automatically scrolls to the bottom whenever a new text chunk is received.
