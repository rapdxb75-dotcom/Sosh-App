# Speech Recognition Service Documentation

The `speechRecognition.ts` file acts as a polyfill/wrapper around the optional package `expo-speech-recognition` to handle environments where the module may not be natively linked or available.

## 1. 🧠 Logic / Business Logic

### Optional Module Resolution
- **Graceful Degradation**: Wraps the `require("expo-speech-recognition")` in a `try...catch` block. If the system fails to resolve the binary during runtime (e.g., in a limited web environment or unsupported simulator), it gracefully falls back to `null` rather than crashing the app.
- **`isSpeechRecognitionAvailable`**: A boolean flag exposed to the rest of the application so screens can conditionally render microphone/dictation buttons.

### Event Hook Wrapping
- **`useOptionalSpeechRecognitionEvent`**: A protective hook. 
  - If the module is available, it binds the event (`result`, `end`, `error`) via the original `useSpeechRecognitionEvent`.
  - If the module is missing, it explicitly returns an empty `useEffect(() => undefined, [])`. This is a React best-practice to ensure that the hook execution order remains stable between renders, preventing "React Hook" violation errors.

---

## 2. 🔌 API Integration

*Wraps the Native Expo API:*
- Explicitly queries the native layer `ExpoSpeechRecognitionModule` for dictation integrations.

---

## 3. 🎨 UI / User Interface

*While this file itself contains no UI, it directly dictates UI states:*
- **Feature Toggles**: Screens like `ai.tsx` (AI Chat) likely use `isSpeechRecognitionAvailable` to decide if the microphone button should be displayed as part of the keyboard input bar.
