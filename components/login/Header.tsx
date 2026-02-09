import { Image, View } from "react-native";

export default function Header() {
    return (
        <View className="flex-row justify-center items-center mt-4">
            <View className="w-10 h-10 items-center justify-center">
                <Image
                    source={require("../../assets/images/logo.png")}
                    className="w-11 h-11"
                    resizeMode="contain"
                />
            </View>
        </View>
    );
}
