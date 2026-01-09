import React from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Colors from "../constants/colors";

interface ReactionPickerProps {
    visible: boolean;
    onClose: () => void;
    onSelectEmoji: (emoji: string) => void;
}

// Common emoji reactions (similar to WhatsApp, Telegram, etc.)
const QUICK_REACTIONS = ["❤️", "👍", "😂", "😮", "😢", "🙏"];

const EMOJI_CATEGORIES = [
    {
        name: "Smileys",
        emojis: [
            "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂",
            "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩",
            "😘", "😗", "😚", "😙", "😋", "😛", "😜", "🤪",
            "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨",
        ],
    },
    {
        name: "Emotions",
        emojis: [
            "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥",
            "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕",
            "🤢", "🤮", "🤧", "🥵", "🥶", "😵", "🤯", "🤠",
            "🥳", "😎", "🤓", "🧐", "😕", "😟", "🙁", "😮",
        ],
    },
    {
        name: "Gestures",
        emojis: [
            "👍", "👎", "👊", "✊", "🤛", "🤜", "🤞", "✌️",
            "🤟", "🤘", "👌", "🤏", "👈", "👉", "👆", "👇",
            "☝️", "✋", "🤚", "🖐️", "🖖", "👋", "🤙", "💪",
            "🙏", "✍️", "💅", "🤳", "👏", "🙌", "👐", "🤲",
        ],
    },
    {
        name: "Hearts",
        emojis: [
            "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍",
            "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖",
            "💘", "💝", "💟", "♥️", "💌", "💋", "💯", "💢",
        ],
    },
    {
        name: "Nature",
        emojis: [
            "🔥", "✨", "💫", "⭐", "🌟", "💥", "💦", "💨",
            "🌈", "☀️", "🌤️", "⛅", "🌥️", "☁️", "🌦️", "🌧️",
            "⛈️", "🌩️", "🌨️", "❄️", "☃️", "⛄", "🌬️", "💨",
        ],
    },
];

export default function ReactionPicker({
    visible,
    onClose,
    onSelectEmoji,
}: ReactionPickerProps) {
    const handleSelectEmoji = (emoji: string) => {
        onSelectEmoji(emoji);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable
                    style={styles.container}
                    onPress={(e) => e.stopPropagation()}
                >
                    {/* Quick Reactions */}
                    <View style={styles.quickReactionsContainer}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.quickReactions}
                        >
                            {QUICK_REACTIONS.map((emoji) => (
                                <TouchableOpacity
                                    key={emoji}
                                    style={styles.quickReactionButton}
                                    onPress={() => handleSelectEmoji(emoji)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.quickEmoji}>{emoji}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* All Emojis */}
                    <ScrollView
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                    >
                        {EMOJI_CATEGORIES.map((category) => (
                            <View key={category.name} style={styles.category}>
                                <Text style={styles.categoryName}>{category.name}</Text>
                                <View style={styles.emojiGrid}>
                                    {category.emojis.map((emoji) => (
                                        <TouchableOpacity
                                            key={emoji}
                                            style={styles.emojiButton}
                                            onPress={() => handleSelectEmoji(emoji)}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={styles.emoji}>{emoji}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        width: 320,
        maxHeight: 400,
        backgroundColor: Colors.white,
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    quickReactionsContainer: {
        backgroundColor: Colors.background,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        paddingVertical: 12,
    },
    quickReactions: {
        paddingHorizontal: 12,
        gap: 8,
    },
    quickReactionButton: {
        width: 44,
        height: 44,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.white,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    quickEmoji: {
        fontSize: 24,
    },
    scrollView: {
        maxHeight: 300,
    },
    category: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    categoryName: {
        fontSize: 13,
        fontWeight: "600",
        color: Colors.gray500,
        marginBottom: 8,
    },
    emojiGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 4,
    },
    emojiButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
    },
    emoji: {
        fontSize: 24,
    },
});
