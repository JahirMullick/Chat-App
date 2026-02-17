import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";


export type ChatItemType = {
    id: string;
    name: string;
    message: string;
    time: string;
    unreadCount?: number;
    isVerified?: boolean;
    isMuted?: boolean;
    isOnline?: boolean;
    messageStatus?: "sent" | "delivered" | "read";
    hasMention?: boolean;
    avatarUrl?: string;
    avatarColor?: string;
    category?: "groups" | "channels" | "bots" | "design" | "books" | "ai" | "sign";
    recipientId?: string;
    isSavedMessages?: boolean;
};

interface ChatItemProps {
    item: ChatItemType;
    onPress?: () => void;
}

export default function ChatItem({ item, onPress }: ChatItemProps) {

    const getStatusIcon = () => {
        if (!item.messageStatus) return null;

        switch (item.messageStatus) {
            case "read":
                return <Ionicons name="checkmark-done" size={16} color="#34C759" />;
            case "delivered":
                return <Ionicons name="checkmark-done" size={16} color="#8E8E93" />;
            case "sent":
                return <Ionicons name="checkmark" size={16} color="#34C759" />;
            default:
                return null;
        }
    };

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
            {/* Avatar Section */}
            <View style={[styles.avatarContainer, { backgroundColor: item.avatarColor || '#ccc' }]}>
                {item.isSavedMessages ? (
                    <Ionicons name="bookmark" size={24} color="#fff" />
                ) : item.avatarUrl ? (
                    <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
                ) : (
                    <Text style={styles.avatarText}>
                        {item.name ? item.name.charAt(0).toUpperCase() : "?"}
                    </Text>
                )}

                {/* Online Status Indicator */}
                {item.isOnline && !item.isSavedMessages && (
                    <View style={styles.onlineIndicator} />
                )}
            </View>

            {/* Chat Details Section */}
            <View style={styles.contentContainer}>
                <View style={styles.headerContainer}>
                    <View style={styles.nameContainer}>
                        <Text style={styles.nameText} numberOfLines={1}>
                            {item.name}
                        </Text>
                        {item.isVerified && (
                            <Ionicons
                                name="checkmark-circle"
                                size={16}
                                color="#007AFF"
                                style={styles.verifiedIcon}
                            />
                        )}
                        {item.isMuted && (
                            <Ionicons
                                name="volume-mute"
                                size={14}
                                color="#8E8E93"
                                style={styles.mutedIcon}
                            />
                        )}
                    </View>
                    <View style={styles.timeStatusContainer}>
                        {getStatusIcon()}
                        <Text style={styles.timeText}>{item.time}</Text>
                    </View>
                </View>

                <View style={styles.messageContainer}>
                    <Text style={styles.messageText} numberOfLines={1}>
                        {item.message}
                    </Text>
                    {item.hasMention && (
                        <View style={styles.mentionBadge}>
                            <Text style={styles.mentionText}>@</Text>
                        </View>
                    )}
                    {item.unreadCount !== undefined && item.unreadCount > 0 && (
                        <View style={[styles.unreadBadge, item.isMuted && styles.unreadBadgeMuted]}>
                            <Text style={styles.unreadText}>{item.unreadCount}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: "#fff",
    },
    avatarContainer: {
        position: "relative",
        marginRight: 12,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    avatarText: {
        fontSize: 22,
        fontWeight: "600",
        color: "#fff",
    },
    onlineIndicator: {
        position: "absolute",
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: "#34C759",
        borderWidth: 2,
        borderColor: "#fff",
    },
    contentContainer: {
        flex: 1,
        justifyContent: "center",
        borderBottomWidth: 0.5,
        borderBottomColor: "#E5E5EA",
        paddingBottom: 10,
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    nameContainer: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        marginRight: 8,
    },
    nameText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
        flexShrink: 1,
    },
    verifiedIcon: {
        marginLeft: 4,
    },
    mutedIcon: {
        marginLeft: 4,
    },
    timeStatusContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    timeText: {
        fontSize: 14,
        color: "#8E8E93",
        marginLeft: 4,
    },
    messageContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    messageText: {
        flex: 1,
        fontSize: 15,
        color: "#8E8E93",
        marginRight: 8,
    },
    mentionBadge: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: "#007AFF",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },
    mentionText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#fff",
    },
    unreadBadge: {
        minWidth: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: "#007AFF",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 6,
    },
    unreadBadgeMuted: {
        backgroundColor: "#8E8E93",
    },
    unreadText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#fff",
    },
});
