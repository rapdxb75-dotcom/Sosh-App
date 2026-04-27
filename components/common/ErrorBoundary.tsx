import { Component, ErrorInfo, ReactNode } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NoInternet from "./NoInternet";

// Lazy-load crashlytics to avoid "No Firebase App" error at import time
function getCrashlytics() {
  try {
    return require("@react-native-firebase/crashlytics").default;
  } catch (e) {
    console.warn("Crashlytics not available:", e);
    return null;
  }
}

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);

    const isNetworkError =
      error.message?.includes("Network Error") ||
      error.message?.includes("network") ||
      error.message?.includes("firestore/unavailable") ||
      error.message?.includes("Internet connection");

    if (!isNetworkError) {
      try {
        const crashlytics = getCrashlytics();
        crashlytics?.().recordError(error);
      } catch (e) {
        console.warn("Failed to log error to Crashlytics:", e);
      }
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      const isNetworkError =
        this.state.error?.message?.includes("Network Error") ||
        this.state.error?.message?.includes("network") ||
        this.state.error?.message?.includes("firestore/unavailable") ||
        this.state.error?.message?.includes("Internet connection");

      if (isNetworkError) {
        return <NoInternet onRetry={this.handleReset} />;
      }

      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>Something went wrong.</Text>
            <Text style={styles.subtitle}>
              An unexpected error occurred. Our team has been notified.
            </Text>
            <TouchableOpacity style={styles.button} onPress={this.handleReset}>
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#fff",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "rgba(255, 255, 255, 0.6)",
  },
  button: {
    backgroundColor: "#fff",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ErrorBoundary;