# Chat Service Documentation

The `chatService` manages the persistence and retrieval of AI chat conversations, saving them to the backend server to ensure history is maintained across sessions.

## 1. 🧠 Logic / Business Logic

### Types and Data Structures
- **Conversations**: Structured as a list of `Conversation` objects containing metadata like ID, name, and timestamps.
- **Messages**: Individual interactions within a conversation tracked via the `Message` interface, assigned a `role` of either `'User'` or `'Model'`.

### Token Authentication
- Almost every method retrieves an authorization token via `storageService.getToken()` before executing the request, ensuring secure data handling.

---

## 2. 🔌 API Integration

### Core Methods & Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `getConversations` | `/get-conversations` | Fetches a list of all chat sessions for an email. |
| `createConversation` | `/create-conversation` | Initializes a new chat session linked to a board/chat ID. |
| `getHistory` | `/getHistory` | Retrieves all messages inside a specific conversation ID. |
| `manageHistory` | `/manageHistory` | Appends a new message (from either User or Model) to the history. |
| `deleteConversation` | `/delete-conversation` | Drops an existing conversation session. |
| `editConversation` | `/Edit-conversation` | Modifies the customized title of a conversation. |

### Payload Wrappers
- Encapsulates necessary data (like `conversationId` and `userEmail`) into clean payloads so the component layers don't have to manually shape the backend DTO.

---

## 3. 🎨 UI / User Interface

*Since this is a backend integration service:*
- It directly supports the `ai.tsx` chat screen, populating the chat history sidebar.
- Provides `Edit` and `Delete` functionalities that are triggered by context menus or swipe gestures in the UI.
