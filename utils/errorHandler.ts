import crashlytics from "@react-native-firebase/crashlytics";
import { Alert } from "react-native";
import {
    setJSExceptionHandler,
    setNativeExceptionHandler,
} from "react-native-exception-handler";

const handleJSException = (error: Error, isFatal: boolean) => {
  console.error("JS GLOBAL EXCEPTION HANDLER:", error, isFatal);

  const isNetworkError =
    error.message?.includes("Network Error") ||
    error.message?.includes("network") ||
    error.message?.includes("firestore/unavailable") ||
    error.message?.includes("offline") ||
    error.message?.includes("Internet connection");

  // Don't record or show fatal alert for network errors
  if (isNetworkError) {
    return;
  }

  // Record to Crashlytics
  crashlytics().recordError(error);

  if (isFatal) {
    Alert.alert(
      "Unexpected Error Occurred",
      "An unexpected error occurred. We have been notified and will fix it as soon as possible.",
      [
        {
          text: "Close",
        },
      ],
    );
  }
};

const handleNativeException = (exceptionString: string) => {
  console.error("NATIVE EXCEPTION HANDLER:", exceptionString);
  crashlytics().log(`Native crash: ${exceptionString}`);
  // Native exception handler only logs the crash; it cannot prevent the app from closing.
};

export const initializeErrorHandler = () => {
  // In development mode (__DEV__), we often want the LogBox/RedBox to show up
  // so we can debug easily. For testing the global handler specifically,
  // we use 'true' for the second parameter to allow the handler in DEV.
  setJSExceptionHandler(handleJSException, !__DEV__);
  setNativeExceptionHandler(handleNativeException, false);
};
