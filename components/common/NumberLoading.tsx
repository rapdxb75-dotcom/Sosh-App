import { useEffect, useRef, useState } from "react";
import { Animated, TextProps } from "react-native";

interface NumberLoadingProps extends TextProps {
    length?: number;
    className?: string;
    style?: any;
}

export default function NumberLoading({
    length = 3,
    style,
    ...props
}: NumberLoadingProps) {
    const [value, setValue] = useState("0".repeat(length));
    const opacity = useRef(new Animated.Value(0.4)).current;

    // Pulse effect
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.8,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.4,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ]),
        ).start();
    }, [opacity]);

    // Scramble effect (rapidly changing numbers to give a data-crunching feel)
    useEffect(() => {
        const suffixes = ["", "K", "M"];
        const interval = setInterval(() => {
            let nextStr = "";
            // Generate numbers
            for (let i = 0; i < length; i++) {
                nextStr += Math.floor(Math.random() * 10).toString();
            }

            // Randomly insert a decimal point if length > 1
            if (length > 1 && Math.random() > 0.5) {
                const insertPos = Math.floor(Math.random() * (length - 1)) + 1;
                nextStr = nextStr.slice(0, insertPos) + "." + nextStr.slice(insertPos);
            }

            // Append a random suffix
            const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
            nextStr += randomSuffix;

            setValue(nextStr);
        }, 70);
        return () => clearInterval(interval);
    }, [length]);

    return (
        <Animated.Text style={[style, { opacity }]} {...props}>
            {value}
        </Animated.Text>
    );
}
