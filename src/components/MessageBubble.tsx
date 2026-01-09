import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Colors from "../constants/colors";
import { MessageReaction } from "../types/firestore.types";
import MessageReactions from "./MessageReactions";
import ReactionPicker from "./ReactionPicker";
import {
    MenuItemType,
    withOptionsModal,
} from "./hoc/withOptionsModal";

// Message type for display
export interface MessageBubbleData {
    id: string;
    text: string;
    time: string;
    timestamp: any;
    isMe: boolean;
    isRead?: boolean;
    isEdited?: boolean;
    imageUri?: string;
    videoThumbnail?: string;
    videoDuration?: string;
    videoParticipants?: string[];
    senderId: string;
    senderName?: string;
    senderPhotoURL?: string | null;
    reactions?: { [emoji: string]: MessageReaction };
}

interface MessageBubbleBaseProps {
    message: MessageBubbleData;
    isGroupChat?: boolean;
    chatId?: string;
    currentUserId?: string;
    onDeleteForMe: (messageId: string) => void;
    onDeleteForEveryone: (messageId: string) => void;
    onReaction?: (messageId: string, emoji: string) => void;
    openOptionsModal: () => void;
    showReactionPicker: boolean;
    setShowReactionPicker: (show: boolean) => void;
}

function MessageBubbleBase({
    message,
    isGroupChat = false,
    chatId,
    currentUserId,
    onDeleteForMe,
    onDeleteForEveryone,
    onReaction,
    openOptionsModal,
    showReactionPicker,
    setShowReactionPicker,
}: MessageBubbleBaseProps) {
    const isMe = message.isMe;

    const handleLongPress = () => {
        openOptionsModal();
    };

    const handleReactionPress = (emoji: string) => {
        if (onReaction && chatId) {
            onReaction(message.id, emoji);
        }
        setShowReactionPicker(false);
    };

    return (
        <>
            <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
                <TouchableOpacity
                    activeOpacity={0.95}
                    onLongPress={handleLongPress}
                    style={[styles.messageContainer]}
                >
                    <View
                        style={[
                            styles.messageBubble,
                            isMe ? styles.messageBubbleMe : styles.messageBubbleOther,
                        ]}
                    >
                        {isGroupChat && !isMe && message.senderName && (
                            <Text style={styles.senderName}>{message.senderName}</Text>
                        )}
                        {message.videoThumbnail ? (
                            <View style={styles.videoContainer}>
                                <Image
                                    source={{ uri: message.videoThumbnail }}
                                    style={styles.videoThumbnail}
                                />
                                <View style={styles.videoOverlay}>
                                    <View style={styles.videoParticipants}>
                                        {/* Participant avatars would go here */}
                                    </View>
                                    <Text style={styles.videoNames}>
                                        {message.videoParticipants?.join(", ")}
                                    </Text>
                                    <Text style={styles.videoDuration}>{message.videoDuration}</Text>
                                </View>
                            </View>
                        ) : (
                            <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
                                {message.text}
                            </Text>
                        )}
                        <View style={styles.messageFooter}>
                            {message.isEdited && (
                                <Text style={[styles.editedText, isMe && styles.timeTextMe]}>
                                    edited{" "}
                                </Text>
                            )}
                            <Text style={[styles.timeText, isMe && styles.timeTextMe]}>
                                {message.time}
                            </Text>
                            {isMe && (
                                <Ionicons
                                    name={message.isRead ? "checkmark-done" : "checkmark"}
                                    size={16}
                                    color={Colors.success}
                                    style={styles.readIcon}
                                />
                            )}
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Display Reactions */}
                <MessageReactions
                    reactions={message.reactions}
                    currentUserId={currentUserId}
                    onReactionPress={handleReactionPress}
                    isMe={isMe}
                />
            </View>

            {/* Reaction Picker Modal */}
            <ReactionPicker
                visible={showReactionPicker}
                onClose={() => setShowReactionPicker(false)}
                onSelectEmoji={handleReactionPress}
            />
        </>
    );
}

// Create menu items factory function
const createMessageMenuItems = (
    message: MessageBubbleData,
    onDeleteForMe: (messageId: string) => void,
    onDeleteForEveryone: (messageId: string) => void,
    onOpenReactionPicker: () => void
): MenuItemType[] => {
    const items: MenuItemType[] = [];

    // Add Reaction option (always first)
    items.push({
        label: "Add Reaction",
        icon: "happy-outline",
        iconColor: Colors.primary,
        onPress: onOpenReactionPicker,
    });

    // Delete for Me option (always available)
    items.push({
        label: "Delete for Me",
        icon: "trash-outline",
        iconColor: Colors.error,
        onPress: () => onDeleteForMe(message.id),
    });

    // Delete for Everyone option (only for sender)
    if (message.isMe) {
        items.push({
            label: "Delete for Everyone",
            icon: "trash-outline",
            iconColor: Colors.errorDark,
            onPress: () => onDeleteForEveryone(message.id),
        });
    }

    // Copy option
    items.push({
        label: "Copy",
        icon: "copy-outline",
        onPress: () => {
            // TODO: Implement copy to clipboard
            console.log("Copy message:", message.text);
        },
    });

    return items;
};

// Export props for MessageBubble
export interface MessageBubbleProps {
    message: MessageBubbleData;
    chatId?: string;
    currentUserId?: string;
    isGroupChat?: boolean;
    onDeleteForMe: (messageId: string) => void;
    onDeleteForEveryone: (messageId: string) => void;
    onReaction?: (messageId: string, emoji: string) => void;
}

// Create HOC wrapper
const MessageBubbleWithModal = (props: MessageBubbleProps) => {
    const [showReactionPicker, setShowReactionPicker] = useState(false);

    const handleOpenReactionPicker = () => {
        setShowReactionPicker(true);
    };

    const menuItems = useMemo(
        () => createMessageMenuItems(
            props.message,
            props.onDeleteForMe,
            props.onDeleteForEveryone,
            handleOpenReactionPicker
        ),
        [props.message, props.onDeleteForMe, props.onDeleteForEveryone]
    );

    const WrappedComponent = useMemo(
        () => withOptionsModal(MessageBubbleBase, menuItems, "center"),
        [menuItems]
    );

    return (
        <WrappedComponent
            {...props}
            showReactionPicker={showReactionPicker}
            setShowReactionPicker={setShowReactionPicker}
        />
    );
};

export default MessageBubbleWithModal;

const styles = StyleSheet.create({
    messageRow: {
        flexDirection: "column",
        marginBottom: 12,
        paddingHorizontal: 16,
        alignItems: "flex-start",
    },
    messageRowMe: {
        alignItems: "flex-end",
    },
    messageContainer: {
        maxWidth: "80%",
    },
    avatarContainer: {
        marginRight: 8,
        marginBottom: 2,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    avatarPlaceholder: {
        backgroundColor: Colors.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        color: Colors.white,
        fontSize: 14,
        fontWeight: "600",
    },
    messageBubble: {
        maxWidth: "75%",
        borderRadius: 16,
        padding: 12,
        elevation: 1,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    messageBubbleMe: {
        backgroundColor: Colors.messageBubbleMe,
        borderBottomRightRadius: 4,
    },
    messageBubbleOther: {
        backgroundColor: Colors.messageBubbleOther,
        borderBottomLeftRadius: 4,
    },
    senderName: {
        fontSize: 12,
        fontWeight: "600",
        color: Colors.primary,
        marginBottom: 4,
    },
    messageText: {
        fontSize: 15,
        color: Colors.black,
        lineHeight: 20,
    },
    messageTextMe: {
        color: Colors.black,
    },
    messageFooter: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
        justifyContent: "flex-end",
    },
    timeText: {
        fontSize: 11,
        color: Colors.textMuted,
    },
    timeTextMe: {
        color: Colors.messageTimeOther,
    },
    editedText: {
        fontSize: 11,
        color: Colors.textMuted,
        fontStyle: "italic",
    },
    readIcon: {
        marginLeft: 4,
    },
    videoContainer: {
        width: 250,
        height: 140,
        borderRadius: 12,
        overflow: "hidden",
    },
    videoThumbnail: {
        width: "100%",
        height: "100%",
    },
    videoOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 12,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
    },
    videoParticipants: {
        flexDirection: "row",
        marginBottom: 4,
    },
    videoNames: {
        fontSize: 12,
        color: Colors.white,
        fontWeight: "500",
    },
    videoDuration: {
        fontSize: 11,
        color: Colors.white,
        marginTop: 2,
    },
});
