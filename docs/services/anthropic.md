# Anthropic Service Documentation

The `AnthropicService` provides a wrapper around the Anthropic API (Claude) to handle both streaming and non-streaming message generation for the AI chat features.

## 1. 🧠 Logic / Business Logic

### Streaming Generation
- **`streamMessage`**: Uses `XMLHttpRequest` instead of `fetch` to handle Server-Sent Events (SSE) streaming from Anthropic.
  - Processes text delta events (`content_block_delta`).
  - Calls the provided `onChunk` callback in real-time as the text streams in.
  - Combines the chunks to return the full text once the stream completes.

### Normal Generation
- **`generateMessage`**: Uses the native `fetch` API to make a synchronous (non-streaming) call to the Anthropic API.
  - Returns the final generated `content[0].text` string from the parsed payload.

### Request Payload
- Both methods use the `claude-opus-4-0` model by default (`DEFAULT_MODEL`).
- Includes a dynamic `systemPrompt` if provided.

---

## 2. 🔌 API Integration

### Base Information
- **URL**: Uses `EXPO_PUBLIC_ANTHROPIC_API_URL` (usually `https://api.anthropic.com/v1/messages`).
- **Headers**:
  - `x-api-key`: Populated from `EXPO_PUBLIC_ANTHROPIC_API_KEY`.
  - `anthropic-version`: Set to `2023-06-01`.

### Data Flow
- Translates the input prompt and system prompt into the standardized Anthropic `messages` array structure (`[{ role: "user", content }]`).

---

## 3. 🎨 UI / User Interface

*This is an API service module and has no UI rendering. However, it affects UI components:*
- The `streamMessage` method continuously calls `onChunk`, allowing the parent chat component to display a smooth typewriter effect instead of blocking the UI.
