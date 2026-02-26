import { AlertCircle, CheckCircle, Info } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { ToastConfig } from "react-native-toast-message";

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
                return <CheckCircle size={22} color="#34C759" strokeWidth={2.5} />;
            case "error":
                return <AlertCircle size={22} color="#FF3B30" strokeWidth={2.5} />;
            case "info":
            default:
                return <Info size={22} color="#0A84FF" strokeWidth={2.5} />;
        }
    };

    return (
        <View style={styles.container} className="flex-row items-start p-4 rounded-[24px] border border-white/5 bg-[#2C2C2E]/95 shadow-sm">
            <View className="mr-4 mt-1 bg-white/5 p-2 rounded-full">
                {getIcon()}
            </View>
            <View className="flex-1 mt-1 justify-center">
                {text1 && (
                    <Text className="text-white font-semibold text-base font-inter mb-1" numberOfLines={1}>
                        {text1}
                    </Text>
                )}
                {text2 && (
                    <Text className="text-white/70 text-sm font-inter leading-5" numberOfLines={2}>
                        {text2}
                    </Text>
                )}
            </View>
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
        marginTop: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
});
