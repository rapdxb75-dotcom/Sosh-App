# PoppyService Documentation

`PoppyService` is a specialized service class providing integration with Poppy AI for generating content captions and handling real-time AI conversations via streaming.

## 1. 🧠 Logic / Business Logic

### Purpose
The `PoppyService` exists to provide a centralized interface for interacting with the Poppy AI ecosystem. It handles two primary use cases:
1. **Static Content Generation**: Generating optimized captions for posts, reels, or stories based on a user prompt.
2. **Interactive AI Conversations**: Facilitating real-time, streaming text responses for an interactive AI chat experience.

### State Management
As a stateless service class, `PoppyService` does not maintain internal React state. Instead, it manages:
- **`processedLength`**: Local variable within `streamMessage` to track the length of the string already processed from the `XMLHttpRequest` response, ensuring chunks are not re-processed.
- **`creditsUsed`**: Local variable to track the token/credit expenditure reported by the AI usage events.
- **`fullText`**: Accumulator for the entire concatenated response during a streaming session.

### Functions and Handlers

#### `generateCaption(captionPrompt, isReel, token, boardId?, chatId?)`
- **Trigger**: Called when a user requests an AI-generated caption for their media.
- **Action**: Sends a POST request to a webhook endpoint with prompt and context details.
- **Processing**: 
    - Validates the response structure.
    - Post-processes the returned text to strip Markdown formatting (bold, italic, headers, code blocks, links) to ensure clean text for social media captions.
- **Returns**: A `Promise<string>` containing the cleaned caption.

#### `streamMessage(conversationId, prompt, boardId, chatId, userEmail, onChunk)`
- **Trigger**: Called in chat interfaces where real-time typing feedback is needed.
- **Action**: Initiates an `XMLHttpRequest` for Server-Sent Events (SSE) style streaming.
- **Processing**:
    - Uses `xhr.onprogress` to handle partial data as it arrives.
    - Parses individual `data: ` lines from the stream.
    - Filters for `text-delta` events to extract and broadcast text chunks via the `onChunk` callback.
    - Listens for `usage` events to capture the amount of credits consumed.
- **Side Effects**: Specifically calls `updatePoppyTokenCredits` (Firebase utility) upon completion to sync usage data to the user's account.

### Important Decision Points
- **Markdown Stripping**: The choice to manually regex-replace Markdown syntax in `generateCaption` ensures that AI "stylizing" doesn't result in broken or weird characters in the final social media output.
- **XHR over Fetch**: Uses `XMLHttpRequest` instead of `fetch` for `streamMessage` to gain access to `onprogress` events, which is a common pattern in environments where the modern `ReadableStream` API might be inconsistent or where specific progress tracking is needed.

---

## 2. 🔌 API Integration

### API Endpoints

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `https://n8n-production-0558.up.railway.app/webhook/poppyAi` | `POST` | Static caption generation. |
| `https://api.getpoppy.ai/api/conversation/{id}` | `POST` | Real-time message streaming. |

### API Details

#### Caption Generation
- **Headers**: Includes `Authorization: Bearer {token}`.
- **Request Payload**:
```json
{
  "isReel": boolean,
  "captionpromt": "String",
  "boardId": "String",
  "chatId": "String"
}
```
- **Response Handling**: Expects a JSON object where text is nested at `data.content[0].text`.

#### Message Streaming
- **Query Parameters**: `board_id`, `chat_id`, `api_key`.
- **Request Payload**:
```json
{
  "prompt": "String",
  "streaming": true,
  "save_history": true,
  "include_usage": true
}
```
- **Stream Format**: Expects lines prefixed with `data: `.
- **Event Types**:
    - `text-delta`: Contains the `delta` text property for streaming content.
    - `usage`: Contains `credits_used` for billing/quota management.
    - `[DONE]`: Sentinel value to indicate the end of the stream.

### Error Handling
- **Caption Generation**: Throws a generic Error if the response status is not `ok` or the format is invalid.
- **Streaming**: Rejects the Promise on `xhr.onerror` or if the status code falls outside the 200-299 range. Errors are logged to the console with specific status codes.

---

## 3. 🎨 UI / User Interface

*Note: As a service component, this file does not render UI itself but provides data for UI components.*

### Integration Patterns
- **Loading States**: UI components calling `generateCaption` should manage their own `isLoading` spinner while waiting for the Promise to resolve.
- **Real-time Updates**: The `onChunk` callback in `streamMessage` allows UI components to update their "chat bubble" text incrementally as data arrives, creating a "smooth typing" effect.
- **Prop/Parameter Definitions**:

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `captionPrompt` | `string` | Yes | The user's input describing what they want a caption for. |
| `isReel` | `boolean` | Yes | Flag to optimize caption for Reels (vs Posts/Stories). |
| `conversationId` | `string` | Yes | Unique ID for the chat session. |
| `onChunk` | `function` | Yes | Callback received `(delta: string)`. |
| `userEmail` | `string` | Yes | Used for updating credit balance in the database. |

### User Interaction Flow
1. **Caption Flow**: User clicks "AI Caption" -> UI shows loading -> `generateCaption` is called -> UI updates text field with result.
2. **Chat Flow**: User sends message -> UI displays user bubble -> `streamMessage` is called -> Response bubble "grows" text as `onChunk` fires -> Credits are updated in background upon completion.
