import { useEffect } from "react";

type SpeechRecognitionExports = typeof import("expo-speech-recognition");

let speechRecognitionExports: SpeechRecognitionExports | null = null;

try {
  speechRecognitionExports =
    require("expo-speech-recognition") as SpeechRecognitionExports;
} catch {
  speechRecognitionExports = null;
}

export const speechRecognitionModule =
  speechRecognitionExports?.ExpoSpeechRecognitionModule ?? null;

export const isSpeechRecognitionAvailable = speechRecognitionModule !== null;

export function useOptionalSpeechRecognitionEvent(
  eventName: "result" | "end" | "error",
  listener: (event: any) => void,
) {
  if (speechRecognitionExports?.useSpeechRecognitionEvent) {
    speechRecognitionExports.useSpeechRecognitionEvent(
      eventName as any,
      listener as any,
    );
    return;
  }

  // Preserve hook ordering when the native module is unavailable.
  useEffect(() => undefined, []);
}
