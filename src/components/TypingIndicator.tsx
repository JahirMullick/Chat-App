import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import Colors from "../constants/colors";

interface TypingIndicatorProps {
    text?: string | null;
    visible?: boolean;
}

/**
 * Animated typing indicator component
 * Shows "..." animation when someone is typing
 */
export default function TypingIndicator({ text, visible = true }: TypingIndicatorProps) {
    const dot1Opacity = useRef(new Animated.Value(0.3)).current;
    const dot2Opacity = useRef(new Animated.Value(0.3)).current;
    const dot3Opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        if (!visible) return;

        const animate = () => {
            const duration = 400;
            const useNativeDriver = true;

            Animated.sequence([
                Animated.timing(dot1Opacity, {
                    toValue: 1,
                    duration,
                    useNativeDriver,
                }),
                Animated.timing(dot2Opacity, {
                    toValue: 1,
                    duration,
                    useNativeDriver,
                }),
                Animated.timing(dot3Opacity, {
                    toValue: 1,
                    duration,
                    useNativeDriver,
                }),
                Animated.parallel([
                    Animated.timing(dot1Opacity, {
                        toValue: 0.3,
                        duration,
                        useNativeDriver,
                    }),
                    Animated.timing(dot2Opacity, {
                        toValue: 0.3,
                        duration,
                        useNativeDriver,
                    }),
                    Animated.timing(dot3Opacity, {
                        toValue: 0.3,
                        duration,
                        useNativeDriver,
                    }),
                ]),
            ]).start(() => animate());
        };

        animate();

        return () => {
            dot1Opacity.setValue(0.3);
            dot2Opacity.setValue(0.3);
            dot3Opacity.setValue(0.3);
        };
    }, [visible, dot1Opacity, dot2Opacity, dot3Opacity]);

    if (!visible) return null;

    return (
        <View style={styles.container}>
            {text ? (
                <Text style={styles.text}>{text}</Text>
            ) : (
                <View style={styles.dotsContainer}>
                    <Animated.View style={[styles.dot, { opacity: dot1Opacity }]} />
                    <Animated.View style={[styles.dot, { opacity: dot2Opacity }]} />
                    <Animated.View style={[styles.dot, { opacity: dot3Opacity }]} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: Colors.background,
    },
    text: {
        fontSize: 13,
        color: Colors.gray500,
        fontStyle: "italic",
    },
    dotsContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.gray400,
    },
});
