import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Colors from "../constants/colors";
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
}

interface MessageBubbleBaseProps {
    message: MessageBubbleData;
    onDeleteForMe: (messageId: string) => void;
    onDeleteForEveryone: (messageId: string) => void;
    openOptionsModal: () => void;
}

function MessageBubbleBase({
    message,
    onDeleteForMe,
    onDeleteForEveryone,
    openOptionsModal,
}: MessageBubbleBaseProps) {
    const isMe = message.isMe;

    return (
        <TouchableOpacity
            activeOpacity={0.95}
            onLongPress={openOptionsModal}
            style={[styles.messageRow, isMe && styles.messageRowMe]}
        >
            <View
                style={[
                    styles.messageBubble,
                    isMe ? styles.messageBubbleMe : styles.messageBubbleOther,
                ]}
            >
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
    );
}

// Create menu items factory function
const createMessageMenuItems = (
    message: MessageBubbleData,
    onDeleteForMe: (messageId: string) => void,
    onDeleteForEveryone: (messageId: string) => void
): MenuItemType[] => {
    const items: MenuItemType[] = [];

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
    onDeleteForMe: (messageId: string) => void;
    onDeleteForEveryone: (messageId: string) => void;
}

// Create HOC wrapper
const MessageBubbleWithModal = (props: MessageBubbleProps) => {
    const menuItems = useMemo(
        () => createMessageMenuItems(props.message, props.onDeleteForMe, props.onDeleteForEveryone),
        [props.message, props.onDeleteForMe, props.onDeleteForEveryone]
    );

    const WrappedComponent = useMemo(
        () => withOptionsModal(MessageBubbleBase, menuItems, "center"),
        [menuItems]
    );

    return <WrappedComponent {...props} />;
};

export default MessageBubbleWithModal;

const styles = StyleSheet.create({
    messageRow: {
        flexDirection: "row",
        marginBottom: 12,
        paddingHorizontal: 16,
    },
    messageRowMe: {
        justifyContent: "flex-end",
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
