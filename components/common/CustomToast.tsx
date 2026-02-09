import { BlurView } from "expo-blur";
import { CheckCircle, Info, XCircle } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { ToastConfig } from "react-native-toast-message";
import { FontFamily, FontSize } from "../../constants/Fonts";

const ToastMessage = ({
    type,
    text1,
    text2,
}: {
    type: "success" | "error" | "info";
    text1?: string;
    text2?: string;
}) => {
    const getIcon = () => {
        switch (type) {
            case "success":
                return <CheckCircle size={24} color="#4ADE80" />; // Green-400
            case "error":
                return <XCircle size={24} color="#EF4444" />; // Red-500
            case "info":
            default:
                return <Info size={24} color="#3B82F6" />; // Blue-500
        }
    };

    return (
        <View style={styles.container}>
            <BlurView intensity={20} tint="light" style={styles.blurContainer}>
                <View style={styles.content}>
                    <View style={styles.iconContainer}>{getIcon()}</View>
                    <View style={styles.textContainer}>
                        {text1 && (
                            <Text style={styles.title} numberOfLines={1}>
                                {text1}
                            </Text>
                        )}
                        {text2 && (
                            <Text style={styles.message} numberOfLines={2}>
                                {text2}
                            </Text>
                        )}
                    </View>
                </View>
            </BlurView>
        </View>
    );
};

export const toastConfig: ToastConfig = {
    success: (props) => (
        <ToastMessage type="success" text1={props.text1} text2={props.text2} />
    ),
    error: (props) => (
        <ToastMessage type="error" text1={props.text1} text2={props.text2} />
    ),
    info: (props) => (
        <ToastMessage type="info" text1={props.text1} text2={props.text2} />
    ),
};

const styles = StyleSheet.create({
    container: {
        width: "90%",
        borderRadius: 16,
        overflow: "hidden",
        marginTop: 10,
        backgroundColor: "rgba(255, 255, 255, 0.1)", // Fallback for Android mainly
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    blurContainer: {
        padding: 16,
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconContainer: {
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
        justifyContent: "center",
    },
    title: {
        fontFamily: FontFamily.questrial,
        fontSize: FontSize.body,
        color: "#FFFFFF",
        marginBottom: 4,
    },
    message: {
        fontFamily: FontFamily.interRegular,
        fontSize: 12,
        color: "rgba(255, 255, 255, 0.8)",
    },
});
