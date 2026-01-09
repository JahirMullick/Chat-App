import React from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Colors from "../constants/colors";
import { MessageReaction } from "../types/firestore.types";

interface MessageReactionsProps {
    reactions?: { [emoji: string]: MessageReaction };
    currentUserId?: string;
    onReactionPress?: (emoji: string) => void;
    onReactionLongPress?: (emoji: string, userIds: string[]) => void;
    isMe?: boolean;
}

export default function MessageReactions({
    reactions,
    currentUserId,
    onReactionPress,
    onReactionLongPress,
    isMe = false,
}: MessageReactionsProps) {
    if (!reactions || Object.keys(reactions).length === 0) {
        return null;
    }

    const reactionArray = Object.values(reactions).sort((a, b) => b.count - a.count);

    return (
        <View style={[styles.container, isMe ? styles.containerMe : styles.containerOther]}>
            {reactionArray.map((reaction) => {
                const hasUserReacted = currentUserId && reaction.userIds.includes(currentUserId);

                return (
                    <TouchableOpacity
                        key={reaction.emoji}
                        style={[
                            styles.reactionBubble,
                            hasUserReacted && styles.reactionBubbleActive,
                        ]}
                        onPress={() => onReactionPress?.(reaction.emoji)}
                        onLongPress={() => onReactionLongPress?.(reaction.emoji, reaction.userIds)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.emoji}>{reaction.emoji}</Text>
                        {reaction.count > 1 && (
                            <Text
                                style={[
                                    styles.count,
                                    hasUserReacted && styles.countActive,
                                ]}
                            >
                                {reaction.count}
                            </Text>
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 4,
        marginTop: 4,
    },
    containerMe: {
        justifyContent: "flex-end",
    },
    containerOther: {
        justifyContent: "flex-start",
    },
    reactionBubble: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: Colors.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: 4,
    },
    reactionBubbleActive: {
        backgroundColor: Colors.primaryLight,
        borderColor: Colors.primary,
    },
    emoji: {
        fontSize: 14,
    },
    count: {
        fontSize: 11,
        fontWeight: "600",
        color: Colors.gray500,
    },
    countActive: {
        color: Colors.primary,
    },
});
