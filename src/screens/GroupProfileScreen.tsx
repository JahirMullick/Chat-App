import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useState } from "react";
import {
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
import { useCurrentUserId } from "../Hooks/useFirestore";
import { MainStackParamList } from "../Navigation/types";
import { ChatService, MessageService, UserService } from "../services/firestore";
import { Chat, Message, UserProfile } from "../types/firestore.types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MEDIA_ITEM_SIZE = (SCREEN_WIDTH - 6) / 3;

type MediaTab = "Media" | "Files" | "Links";

interface MediaItem {
    id: string;
    type: "image" | "video";
    url: string;
    thumbnail?: string;
    timestamp: any;
}

export default function GroupProfileScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
    const route = useRoute<RouteProp<MainStackParamList, "GroupProfile">>();
    const insets = useSafeAreaInsets();
    const currentUserId = useCurrentUserId();

    const [activeTab, setActiveTab] = useState<MediaTab>("Media");
    const [chat, setChat] = useState<Chat | null>(null);
    const [participants, setParticipants] = useState<UserProfile[]>([]);
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);

    const { chatId, groupName = "Group", memberCount = 1 } = route.params || {};

    // Load Chat details & participants
    const loadGroupDetails = useCallback(async () => {
        if (!chatId) return;
        setLoading(true);
        try {
            const chatDoc = await ChatService.getChatById(chatId);
            if (chatDoc) {
                setChat(chatDoc);
                const users = await UserService.getUsersByIds(chatDoc.participants);
                setParticipants(users);
            }

            // Load media
            const messages = await MessageService.getMessages(chatId, 200);
            const mediaMessages = messages.filter(
                (msg: Message) => msg.mediaUrl && (msg.mediaType === "image" || msg.mediaType === "video")
            );
            const items: MediaItem[] = mediaMessages.map((msg: Message) => ({
                id: msg.id,
                type: msg.mediaType as "image" | "video",
                url: msg.mediaUrl!,
                thumbnail: msg.mediaThumbnail,
                timestamp: msg.timestamp,
            }));
            setMediaItems(items);
        } catch (error) {
            console.error("Error loading group details:", error);
        } finally {
            setLoading(false);
        }
    }, [chatId]);

    useEffect(() => {
        loadGroupDetails();
    }, [chatId, loadGroupDetails]);

    const handleBack = () => navigation.goBack();

    const handleMessage = () => {
        navigation.goBack();
    };

    const handleLeaveGroup = () => {
        Alert.alert(
            "Leave Group",
            "Are you sure you want to leave this group chat?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Leave",
                    style: "destructive",
                    onPress: async () => {
                        if (currentUserId && chatId) {
                            try {
                                await ChatService.leaveChat(currentUserId, chatId);
                                navigation.navigate("Home");
                            } catch (error) {
                                console.error("Error leaving chat:", error);
                                Alert.alert("Error", "Could not leave group.");
                            }
                        }
                    },
                },
            ]
        );
    };

    const renderMediaItem = ({ item }: { item: MediaItem }) => (
        <TouchableOpacity style={styles.mediaItem} activeOpacity={0.8}>
            <View style={styles.mediaPlaceholder}>
                <Image source={{ uri: item.thumbnail || item.url }} style={styles.mediaImage} />
                {item.type === "video" && (
                    <View style={styles.videoOverlay}>
                        <Ionicons name="play-circle" size={24} color={Colors.white} />
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    const displayGroupName = chat?.name || groupName;
    const displayAvatarColor = chat?.avatarColor || Colors.avatarDefault;
    const displayMembersCount = chat ? chat.participants.length : memberCount;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
                    <Ionicons name="arrow-back" size={26} color={Colors.white} />
                </TouchableOpacity>

                <View style={styles.headerSpacer} />

                <TouchableOpacity style={styles.headerButton}>
                    <Ionicons name="pencil" size={24} color={Colors.white} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerButton}>
                    <Ionicons name="ellipsis-vertical" size={24} color={Colors.white} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Profile Section */}
                <View style={[styles.profileSection, { backgroundColor: Colors.primary }]}>
                    <View style={styles.avatarContainer}>
                        {chat?.avatarUrl ? (
                            <Image source={{ uri: chat.avatarUrl }} style={styles.avatarPlaceholder} />
                        ) : (
                            <View style={[styles.avatarPlaceholder, { backgroundColor: displayAvatarColor }]}>
                                <Text style={styles.avatarText}>{displayGroupName.charAt(0).toUpperCase()}</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.groupName}>{displayGroupName}</Text>
                    <Text style={styles.memberCount}>{displayMembersCount} member{displayMembersCount !== 1 && 's'}</Text>
                </View>

                {/* Info Container matching UserProfile theme */}
                <View style={styles.infoContainer}>
                    {/* Action Buttons Row */}
                    <View style={styles.actionButtonsRow}>
                        <TouchableOpacity style={styles.actionButton} onPress={handleMessage}>
                            <Ionicons name="chatbubble-outline" size={24} color={Colors.white} />
                            <Text style={styles.actionLabel}>Message</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert("Muted")}>
                            <Ionicons name="notifications-outline" size={24} color={Colors.white} />
                            <Text style={styles.actionLabel}>Mute</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert("Video call started")}>
                            <Ionicons name="videocam-outline" size={24} color={Colors.white} />
                            <Text style={styles.actionLabel}>Video</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={handleLeaveGroup}>
                            <Ionicons name="log-out-outline" size={24} color={Colors.white} />
                            <Text style={styles.actionLabel}>Leave</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Members Card */}
                    <View style={styles.membersCard}>
                        <TouchableOpacity style={styles.memberRow} activeOpacity={0.7}>
                            <View style={styles.addMemberIcon}>
                                <Ionicons name="person-add-outline" size={22} color={Colors.primary} />
                            </View>
                            <Text style={styles.addMemberText}>Add Members</Text>
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        {participants.map((user) => {
                            const isOwner = chat?.admins?.includes(user.uid);
                            return (
                                <View key={user.uid}>
                                    <TouchableOpacity style={styles.memberRow} activeOpacity={0.7}>
                                        {user.photoURL ? (
                                            <Image source={{ uri: user.photoURL }} style={styles.memberAvatar} />
                                        ) : (
                                            <View style={styles.memberAvatarPlaceholder}>
                                                <Text style={styles.memberAvatarText}>
                                                    {user.displayName?.charAt(0).toUpperCase() || "?"}
                                                </Text>
                                            </View>
                                        )}
                                        <View style={styles.memberInfo}>
                                            <Text style={styles.memberName}>{user.displayName || "Unknown"}</Text>
                                            <Text style={styles.memberStatus}>
                                                {user.isOnline ? "online" : "offline"}
                                            </Text>
                                        </View>
                                        {isOwner && <Text style={styles.memberRole}>Admin</Text>}
                                    </TouchableOpacity>
                                    <View style={styles.divider} />
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Media Section */}
                <View style={styles.mediaSection}>
                    <View style={styles.tabBar}>
                        {(["Media", "Files", "Links"] as MediaTab[]).map((tab) => {
                            const isActive = activeTab === tab;
                            return (
                                <TouchableOpacity
                                    key={tab}
                                    style={styles.tab}
                                    onPress={() => setActiveTab(tab)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.tabContent}>
                                        <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                                            {tab}
                                        </Text>
                                        {isActive && <View style={styles.tabIndicator} />}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View style={styles.mediaGridContainer}>
                        {activeTab === "Media" && (
                            mediaItems.length > 0 ? (
                                <FlatList
                                    data={mediaItems}
                                    renderItem={renderMediaItem}
                                    keyExtractor={(item) => item.id}
                                    numColumns={3}
                                    scrollEnabled={false}
                                    contentContainerStyle={styles.mediaGridList}
                                    columnWrapperStyle={{ gap: 3 }}
                                />
                            ) : (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>No media yet</Text>
                                </View>
                            )
                        )}
                        {activeTab === "Files" && (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No files yet</Text>
                            </View>
                        )}
                        {activeTab === "Links" && (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No links yet</Text>
                            </View>
                        )}
                    </View>
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
        paddingHorizontal: 8,
        paddingBottom: 10,
    },
    headerButton: {
        padding: 8,
    },
    headerSpacer: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    profileSection: {
        alignItems: "center",
        paddingBottom: 24,
        paddingTop: 10,
        backgroundColor: Colors.primary,
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.avatarDefault,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: Colors.white,
    },
    avatarText: {
        color: Colors.white,
        fontSize: 44,
        fontWeight: "500",
    },
    groupName: {
        fontSize: 24,
        fontWeight: "700",
        color: Colors.white,
        marginBottom: 4,
    },
    memberCount: {
        fontSize: 15,
        color: Colors.whiteOpacity,
        marginBottom: 10,
    },
    infoContainer: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -20,
        paddingTop: 24,
        paddingHorizontal: 16,
    },
    actionButtonsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    actionButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 12,
        width: 75,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    actionLabel: {
        fontSize: 12,
        fontWeight: "500",
        color: Colors.white,
        marginTop: 6,
    },
    membersCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#E5E5EA",
        paddingHorizontal: 16,
    },
    memberRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
    },
    addMemberIcon: {
        marginRight: 14,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#F0F8FF",
        justifyContent: "center",
        alignItems: "center",
    },
    addMemberText: {
        fontSize: 16,
        color: Colors.primary,
        fontWeight: "500",
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: "#E5E5EA",
        marginLeft: 58,
    },
    memberAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 14,
        backgroundColor: "#f0f0f0",
    },
    memberAvatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 14,
        backgroundColor: Colors.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    memberAvatarText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: "600",
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: 16,
        color: Colors.black,
        fontWeight: "500",
        marginBottom: 2,
    },
    memberStatus: {
        fontSize: 14,
        color: Colors.primary,
    },
    memberRole: {
        fontSize: 14,
        color: Colors.textLight,
        fontWeight: "400",
    },
    mediaSection: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    tabBar: {
        flexDirection: "row",
        backgroundColor: Colors.white,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#E5E5EA",
    },
    tab: {
        flex: 1,
        alignItems: "center",
        paddingTop: 16,
    },
    tabContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        position: "relative",
        alignItems: "center",
    },
    tabText: {
        fontSize: 15,
        fontWeight: "500",
        color: Colors.textLight,
    },
    tabTextActive: {
        color: Colors.primary,
        fontWeight: "600",
    },
    tabIndicator: {
        position: "absolute",
        bottom: 0,
        height: 3,
        width: 40,
        backgroundColor: Colors.primary,
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
    },
    mediaGridContainer: {
        backgroundColor: Colors.white,
        flex: 1,
        minHeight: 200,
    },
    mediaGridList: {
        paddingTop: 8,
        paddingHorizontal: 3,
        gap: 3,
    },
    mediaItem: {
        width: MEDIA_ITEM_SIZE,
        height: MEDIA_ITEM_SIZE,
        marginBottom: 3,
    },
    mediaPlaceholder: {
        flex: 1,
        backgroundColor: "#EFEFEF",
        borderRadius: 8,
        overflow: "hidden",
    },
    mediaImage: {
        width: "100%",
        height: "100%",
    },
    videoOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.3)",
    },
    emptyContainer: {
        padding: 40,
        alignItems: "center",
    },
    emptyText: {
        color: Colors.textLight,
        fontSize: 16,
    }
});
