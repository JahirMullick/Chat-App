import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "../constants/colors";
import { useUserProfile } from "../Hooks/useFirestore";
import { MainStackParamList } from "../Navigation/types";
import { MessageService } from "../services/firestore";
import { Message } from "../types/firestore.types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MEDIA_ITEM_SIZE = (SCREEN_WIDTH - 6) / 3; // 3 items per row with 2px gaps

// Tab types for the media section
type MediaTab = "Media" | "Files" | "Links" | "Music" | "GIFs" | "Groups";

interface MediaItem {
    id: string;
    type: "image" | "video";
    url: string;
    thumbnail?: string;
    duration?: string;
    timestamp: any;
}

interface UserProfileScreenParams {
    recipientId: string;
    chatId?: string;
    name: string;
    avatar?: string;
    avatarColor?: string;
    phoneNumber?: string;
    username?: string;
}

export default function UserProfileScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
    const route = useRoute();
    const insets = useSafeAreaInsets();

    // Get params from navigation
    const params = route.params as UserProfileScreenParams;
    const { recipientId, chatId, name, avatar, avatarColor = Colors.avatarDefault } = params;

    // Subscribe to recipient's profile for real-time updates
    const { profile, loading: profileLoading } = useUserProfile(recipientId);

    // State for media
    const [activeTab, setActiveTab] = useState<MediaTab>("Media");
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [loadingMedia, setLoadingMedia] = useState(false);

    // Format last seen time
    const formatLastSeen = (lastSeen: any): string => {
        if (!lastSeen) return "last seen recently";
        const date = lastSeen.toDate ? lastSeen.toDate() : new Date(lastSeen);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "last seen just now";
        if (diffMins < 60) return `last seen ${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
        if (diffHours < 24) return `last seen ${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
        if (diffDays < 7) return `last seen ${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
        return `last seen ${date.toLocaleDateString()}`;
    };

    // Load media from chat messages
    const loadMediaFromChat = useCallback(async () => {
        if (!chatId) return;

        setLoadingMedia(true);
        try {
            // Get all messages from chat
            const messages = await MessageService.getMessages(chatId, 200);

            // Filter messages with media
            const mediaMessages = messages.filter(
                (msg: Message) => msg.mediaUrl && (msg.mediaType === "image" || msg.mediaType === "video")
            );

            // Convert to MediaItem format
            const items: MediaItem[] = mediaMessages.map((msg: Message) => ({
                id: msg.id,
                type: msg.mediaType as "image" | "video",
                url: msg.mediaUrl!,
                thumbnail: msg.mediaThumbnail,
                timestamp: msg.timestamp,
            }));

            setMediaItems(items);
        } catch (error) {
            console.error("Error loading media:", error);
        } finally {
            setLoadingMedia(false);
        }
    }, [chatId]);

    useEffect(() => {
        if (chatId) {
            loadMediaFromChat();
        }
    }, [chatId, loadMediaFromChat]);

    // Filter items based on active tab
    const filteredItems = useMemo(() => {
        switch (activeTab) {
            case "Media":
                return mediaItems;
            case "Files":
            case "Links":
            case "Music":
            case "GIFs":
            case "Groups":
                return []; // Placeholder for other tabs
            default:
                return [];
        }
    }, [activeTab, mediaItems]);

    // Get display data (prefer profile data over params)
    const displayName = profile?.displayName || name;
    const displayAvatar = profile?.photoURL || avatar;
    const displayPhone = profile?.phoneNumber || params.phoneNumber;
    const displayUsername = profile?.displayName?.replace(/\s/g, "").toLowerCase() || params.username;
    const isOnline = profile?.isOnline || false;

    // Action buttons handler
    const handleMessage = () => {
        navigation.goBack();
    };

    const handleMute = () => {
        Alert.alert("Mute", "Mute notifications for this contact?", [
            { text: "Cancel", style: "cancel" },
            { text: "Mute", onPress: () => console.log("Muted") },
        ]);
    };

    const handleCall = () => {
        Alert.alert("Call", `Call ${displayName}?`, [
            { text: "Cancel", style: "cancel" },
            { text: "Call", onPress: () => console.log("Calling...") },
        ]);
    };

    const handleGift = () => {
        Alert.alert("Gift", "Send a gift to this user");
    };

    // Render media item
    const renderMediaItem = ({ item }: { item: MediaItem }) => (
        <TouchableOpacity style={styles.mediaItem} activeOpacity={0.8}>
            <Image
                source={{ uri: item.thumbnail || item.url }}
                style={styles.mediaImage}
                resizeMode="cover"
            />
            {item.type === "video" && (
                <View style={styles.videoOverlay}>
                    <Ionicons name="play" size={24} color={Colors.white} />
                    {item.duration && (
                        <Text style={styles.videoDuration}>{item.duration}</Text>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );

    // Render empty state for media
    const renderEmptyMedia = () => (
        <View style={styles.emptyMediaContainer}>
            <Ionicons name="images-outline" size={64} color={Colors.gray200} />
            <Text style={styles.emptyMediaText}>No media yet</Text>
            <Text style={styles.emptyMediaSubtext}>
                Photos and videos shared in this chat will appear here
            </Text>
        </View>
    );

    // Tabs data
    const tabs: MediaTab[] = ["Media", "Files", "Links", "Music", "GIFs", "Groups"];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>

                <View style={styles.headerSpacer} />

                <TouchableOpacity style={styles.headerButton}>
                    <Ionicons name="ellipsis-vertical" size={24} color={Colors.white} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Section */}
                <View style={styles.profileSection}>
                    {/* Avatar */}
                    <View style={styles.avatarContainer}>
                        {displayAvatar ? (
                            <Image source={{ uri: displayAvatar }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatarPlaceholder, { backgroundColor: avatarColor }]}>
                                <Text style={styles.avatarText}>
                                    {displayName.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        )}
                        {isOnline && <View style={styles.onlineBadge} />}
                    </View>

                    {/* Name and Status */}
                    <Text style={styles.userName}>{displayName}</Text>
                    <Text style={styles.userStatus}>
                        {isOnline ? "online" : formatLastSeen(profile?.lastSeen)}
                    </Text>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.actionButton} onPress={handleMessage}>
                            <View style={styles.actionIcon}>
                                <Ionicons name="chatbubble" size={22} color={Colors.white} />
                            </View>
                            <Text style={styles.actionLabel}>Message</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={handleMute}>
                            <View style={styles.actionIcon}>
                                <Ionicons name="notifications" size={22} color={Colors.white} />
                            </View>
                            <Text style={styles.actionLabel}>Mute</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
                            <View style={styles.actionIcon}>
                                <Ionicons name="call" size={22} color={Colors.white} />
                            </View>
                            <Text style={styles.actionLabel}>Call</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={handleGift}>
                            <View style={styles.actionIcon}>
                                <MaterialCommunityIcons name="gift" size={22} color={Colors.white} />
                            </View>
                            <Text style={styles.actionLabel}>Gift</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Contact Info Section */}
                <View style={styles.infoSection}>
                    {/* Phone Number */}
                    {displayPhone && (
                        <View style={styles.infoRow}>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoValue}>{displayPhone}</Text>
                                <Text style={styles.infoLabel}>Mobile</Text>
                            </View>
                        </View>
                    )}

                    {/* Username */}
                    {displayUsername && (
                        <View style={styles.infoRow}>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoValue}>@{displayUsername}</Text>
                                <Text style={styles.infoLabel}>Username</Text>
                            </View>
                            <TouchableOpacity style={styles.qrButton}>
                                <MaterialCommunityIcons name="qrcode" size={24} color={Colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Bio */}
                    {profile?.bio && (
                        <View style={styles.infoRow}>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoValue}>{profile.bio}</Text>
                                <Text style={styles.infoLabel}>Bio</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Media Tabs Section */}
                <View style={styles.mediaSectionContainer}>
                    {/* Tab Bar */}
                    <View style={styles.tabBar}>
                        <View style={styles.tabBarContent}>
                            {tabs.map((tab) => (
                                <TouchableOpacity
                                    key={tab}
                                    style={styles.tab}
                                    onPress={() => setActiveTab(tab)}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        style={[
                                            styles.tabText,
                                            activeTab === tab && styles.tabTextActive,
                                        ]}
                                    >
                                        {tab}
                                    </Text>
                                    {activeTab === tab && <View style={styles.tabIndicator} />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Media Grid */}
                    {loadingMedia ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                        </View>
                    ) : filteredItems.length > 0 ? (
                        <FlatList
                            data={filteredItems}
                            renderItem={renderMediaItem}
                            keyExtractor={(item) => item.id}
                            numColumns={3}
                            scrollEnabled={false}
                            contentContainerStyle={styles.mediaGrid}
                            columnWrapperStyle={styles.mediaRow}
                        />
                    ) : (
                        renderEmptyMedia()
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.primary,
        paddingHorizontal: 4,
        paddingBottom: 10,
    },
    headerButton: {
        padding: 10,
    },
    headerSpacer: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    profileSection: {
        backgroundColor: Colors.primary,
        alignItems: "center",
        paddingBottom: 24,
    },
    avatarContainer: {
        position: "relative",
        marginBottom: 16,
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 3,
        borderColor: Colors.white,
    },
    avatarPlaceholder: {
        width: 110,
        height: 110,
        borderRadius: 55,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: Colors.white,
    },
    avatarText: {
        color: Colors.white,
        fontSize: 42,
        fontWeight: "600",
    },
    onlineBadge: {
        position: "absolute",
        bottom: 5,
        right: 5,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "#34C759",
        borderWidth: 3,
        borderColor: Colors.primary,
    },
    userName: {
        fontSize: 24,
        fontWeight: "600",
        color: Colors.white,
        marginBottom: 4,
    },
    userStatus: {
        fontSize: 14,
        color: Colors.whiteOpacity,
        marginBottom: 20,
    },
    actionButtons: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 12,
        paddingHorizontal: 16,
    },
    actionButton: {
        alignItems: "center",
        width: 80,
    },
    actionIcon: {
        width: 52,
        height: 52,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 6,
    },
    actionLabel: {
        fontSize: 12,
        color: Colors.white,
        fontWeight: "500",
    },
    infoSection: {
        backgroundColor: Colors.white,
        paddingVertical: 8,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    infoContent: {
        flex: 1,
    },
    infoValue: {
        fontSize: 16,
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    infoLabel: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    qrButton: {
        padding: 8,
    },
    mediaSectionContainer: {
        flex: 1,
        backgroundColor: Colors.white,
        minHeight: 400,
    },
    tabBar: {
        backgroundColor: Colors.white,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.borderLight,
        flexGrow: 0,
    },
    tabBarContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        minWidth: "100%",
    },
    tab: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 14,
        position: "relative",
    },
    tabActive: {},
    tabIndicator: {
        position: "absolute",
        bottom: 0,
        left: "15%",
        right: "15%",
        height: 3,
        backgroundColor: Colors.primary,
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: "500",
        color: Colors.textSecondary,
    },
    tabTextActive: {
        color: Colors.primary,
    },
    mediaGrid: {
        padding: 1,
    },
    mediaRow: {
        gap: 2,
    },
    mediaItem: {
        width: MEDIA_ITEM_SIZE,
        height: MEDIA_ITEM_SIZE,
        marginBottom: 2,
    },
    mediaImage: {
        width: "100%",
        height: "100%",
    },
    videoOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    videoDuration: {
        fontSize: 12,
        color: Colors.white,
        fontWeight: "500",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 60,
    },
    emptyMediaContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 60,
        paddingHorizontal: 32,
    },
    emptyMediaText: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.textSecondary,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyMediaSubtext: {
        fontSize: 14,
        color: Colors.textTertiary,
        textAlign: "center",
        lineHeight: 20,
    },
});
