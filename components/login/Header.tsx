import { Image, View } from "react-native";

import { normalize } from "../../constants/Fonts";

export default function Header() {
    return (
        <View className="flex-row justify-center items-center mt-4">
            <View style={{ width: normalize(54), height: normalize(54) }} className="items-center justify-center">
                <Image
                    source={require("../../assets/images/logo.png")}
                    style={{ width: normalize(54), height: normalize(54) }}
                    resizeMode="contain"
                />
            </View>
        </View>
    );
}
