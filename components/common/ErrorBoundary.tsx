import crashlytics from "@react-native-firebase/crashlytics";
import { Component, ErrorInfo, ReactNode } from "react";
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import NoInternet from "./NoInternet";

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

    // Don't log network errors to Crashlytics as crashes
    const isNetworkError =
      error.message?.includes("Network Error") ||
      error.message?.includes("network") ||
      error.message?.includes("firestore/unavailable") ||
      error.message?.includes("Internet connection");

    if (!isNetworkError) {
      crashlytics().recordError(error);
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
    backgroundColor: "#fff",
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
    color: "#000",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#666",
  },
  button: {
    backgroundColor: "#000",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ErrorBoundary;
