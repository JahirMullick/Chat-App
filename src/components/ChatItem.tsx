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

    // Helper function to get initials from name
    const getInitials = (name: string): string => {
        const words = name.trim().split(/\s+/);
        if (words.length >= 2) {
            return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
        }
        return name.charAt(0).toUpperCase();
    };

    return (
        <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
                <View style={[styles.avatar, { backgroundColor: item.avatarColor || "#007AFF" }]}>
                    {item.avatarUrl ? (
                        <Image source={{ uri: item.avatarUrl }} style={styles.avatarImage} />
                    ) : (
                        <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
                    )}
                </View>
                {item.isOnline && <View style={styles.onlineBadge} />}
            </View>

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.topRow}>
                    <View style={styles.nameRow}>
                        <Text style={styles.name} numberOfLines={1}>
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
                    <View style={styles.timeRow}>
                        {getStatusIcon()}
                        <Text style={styles.time}>{item.time}</Text>
                    </View>
                </View>

                <View style={styles.bottomRow}>
                    <Text style={styles.message} numberOfLines={1}>
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
    row: {
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: "#fff",
    },
    avatarContainer: {
        position: "relative",
        marginRight: 12,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    avatarImage: {
        width: 56,
        height: 56,
    },
    avatarText: {
        fontSize: 22,
        fontWeight: "600",
        color: "#fff",
    },
    onlineBadge: {
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
    content: {
        flex: 1,
        justifyContent: "center",
        borderBottomWidth: 0.5,
        borderBottomColor: "#E5E5EA",
        paddingBottom: 10,
    },
    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        marginRight: 8,
    },
    name: {
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
    timeRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    time: {
        fontSize: 14,
        color: "#8E8E93",
        marginLeft: 4,
    },
    bottomRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    message: {
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
