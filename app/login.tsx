import { ImageBackground, SafeAreaView, View } from "react-native";
import Header from '../components/login/Header';
import LoginForm from "../components/login/LoginForm";

export default function Login() {
    return (
        <ImageBackground
            source={require("../assets/images/background.png")}
            style={{ flex: 1, backgroundColor: "#000" }}
            resizeMode="cover"
        >
            <SafeAreaView className="flex-1">
                <View className="flex-1 px-6 pb-8">
                    {/* Header */}
                    <Header />

                    {/* Space below header */}
                    <View className="h-10" />

                    {/* Login Form */}
                    <LoginForm />
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}
