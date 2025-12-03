import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";

interface ChatInputProps {
    value?: string;
    onChangeText?: (text: string) => void;
    onSend?: (message: string) => void;
    onAttachPress?: () => void;
    onCameraPress?: () => void;
    onEmojiPress?: () => void;
    placeholder?: string;
    containerStyle?: ViewStyle;
}

export default function ChatInput({
    value,
    onChangeText,
    onSend,
    onAttachPress,
    onCameraPress,
    onEmojiPress,
    placeholder = "Message",
    containerStyle,
}: ChatInputProps) {
    const [internalValue, setInternalValue] = useState("");
    const text = value !== undefined ? value : internalValue;
    const setText = onChangeText || setInternalValue;

    const handleSend = () => {
        if (text.trim() && onSend) {
            onSend(text.trim());
            if (!onChangeText) {
                setInternalValue("");
            }
        }
    };

    return (
        <View style={[styles.container, containerStyle]}>
            <View style={styles.inputWrapper}>
                {/* Emoji Button */}
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={onEmojiPress}
                    activeOpacity={0.6}
                >
                    <Ionicons name="happy-outline" size={26} color="#8E8E93" />
                </TouchableOpacity>

                {/* Text Input */}
                <TextInput
                    style={styles.textInput}
                    placeholder={placeholder}
                    placeholderTextColor="#8E8E93"
                    value={text}
                    onChangeText={setText}
                    multiline
                    maxLength={4096}
                />

                {/* Attachment Button */}
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={onAttachPress}
                    activeOpacity={0.6}
                >
                    <Ionicons name="attach" size={26} color="#8E8E93" />
                </TouchableOpacity>

                {/* Camera/Voice Button - changes based on input */}
                {!text.trim() && (
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={onCameraPress}
                        activeOpacity={0.6}
                    >
                        <View style={styles.cameraIcon}>
                            <Ionicons name="camera-outline" size={24} color="#8E8E93" />
                        </View>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8,
        paddingVertical: 8,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F2F2F2",
        borderRadius: 24,
        minHeight: 48,
        paddingHorizontal: 4,
    },
    iconButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    textInput: {
        flex: 1,
        fontSize: 17,
        color: "#000",
        paddingVertical: 10,
        paddingHorizontal: 4,
        maxHeight: 100,
        minHeight: 24,
    },
    cameraIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: "#8E8E93",
        justifyContent: "center",
        alignItems: "center",
    },
});
