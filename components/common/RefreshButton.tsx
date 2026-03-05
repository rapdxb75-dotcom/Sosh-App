import * as Haptics from "expo-haptics";
import { RefreshCw } from "lucide-react-native";
import { useRef, useState } from "react";
import { Animated, Platform, Text, TouchableOpacity, View } from "react-native";

interface RefreshButtonProps {
    onRefresh: () => Promise<void> | void;
    size?: number;
    color?: string;
    style?: any;
}

export default function RefreshButton({ onRefresh, size = 16, color = "#FFFFFF99", style }: RefreshButtonProps) {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const rotation = useRef(new Animated.Value(0)).current;

    const handlePress = async () => {
        if (isRefreshing) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsRefreshing(true);

        // Start rotating animation
        Animated.loop(
            Animated.timing(rotation, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            })
        ).start();

        try {
            await onRefresh();
            // Just simulate a bit of delay so the user sees the spin if fetch is too fast
            await new Promise(resolve => setTimeout(resolve, 800));
        } finally {
            Animated.timing(rotation).stop();
            rotation.setValue(0);
            setIsRefreshing(false);
        }
    };

    const spin = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    return (
        <View style={[{ position: "relative", alignItems: "center", justifyContent: "center" }, style]} className="z-50">
            <TouchableOpacity
                onPress={handlePress}
                onPressIn={() => setShowTooltip(true)}
                onPressOut={() => setShowTooltip(false)}
                {...(Platform.OS === 'web' ? { onMouseEnter: () => setShowTooltip(true), onMouseLeave: () => setShowTooltip(false) } : {})}
                disabled={isRefreshing}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <RefreshCw size={size} color={color} />
                </Animated.View>
            </TouchableOpacity>

            {showTooltip && (
                <View
                    style={{
                        position: "absolute",
                        top: -34,
                        backgroundColor: "rgba(0,0,0,0.85)",
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 8,
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: 64,
                    }}
                >
                    <Text className="text-white text-xs font-inter font-medium">Refresh</Text>
                    {/* Small pointer triangle */}
                    <View
                        style={{
                            position: 'absolute',
                            bottom: -4,
                            width: 0,
                            height: 0,
                            borderStyle: 'solid',
                            borderTopWidth: 4,
                            borderRightWidth: 4,
                            borderBottomWidth: 0,
                            borderLeftWidth: 4,
                            borderTopColor: 'rgba(0,0,0,0.85)',
                            borderRightColor: 'transparent',
                            borderBottomColor: 'transparent',
                            borderLeftColor: 'transparent',
                        }}
                    />
                </View>
            )}
        </View>
    );
}
