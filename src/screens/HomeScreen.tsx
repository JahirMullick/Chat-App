import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChatItem, { ChatItemType } from "../components/ChatItem";
import Header from "../components/Header";
import OptionsModal, { MenuItemType, OptionsModalRef } from "../components/hoc/withOptionsModal";
import PlusIcon from "../components/icons/Plus";
import Colors from "../constants/colors";
import { useChats, useCurrentUserId, useOnlineStatus, useStories, useTabs } from "../Hooks/useFirestore";
import { MainStackParamList } from "../Navigation/types";
import { getMessagePreview } from "../types/firestore.types";

// Helper function to format time
const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
        return 'Yesterday';
    } else if (days < 7) {
        return date.toLocaleDateString([], { weekday: 'short' });
    } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
};

// Helper function to generate random color based on user ID
const getAvatarColor = (userId: string): string => {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
        '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
        '#F06292', '#7986CB', '#4DB6AC', '#FFB74D', '#A1887F',
        '#90CAF9', '#CE93D8', '#80CBC4', '#FFD54F', '#AED581'
    ];

    // Generate a consistent index based on userId
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
};





// Tab type for display
type TabDisplay = {
    label: string;
    isActive?: boolean;
    count?: number;
};

// Default tabs (used when no Firestore data)
const defaultTabs: TabDisplay[] = [
    { label: "All", isActive: true },
];

function HomeScreen() {

    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearchBar, setShowSearchBar] = useState(false);
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
    const optionsModalRef = useRef<OptionsModalRef>(null);

    // Menu items for new chat options (with navigation access)
    const newChatMenuItems: MenuItemType[] = useMemo(() => [
        {
            label: "New Message",
            subtitle: "Send a message to a contact",
            icon: "chatbubble-outline",
            iconColor: Colors.primaryAccent,
            onPress: () => navigation.navigate("NewChat"),
        },
        {
            label: "New Group",
            subtitle: "Create a group with your contacts",
            icon: "people-outline",
            iconColor: Colors.success,
            onPress: () => navigation.navigate('NewGroup'),
        },
        // {
        //     label: "New Channel",
        //     subtitle: "Create a channel to broadcast",
        //     icon: "megaphone-outline",
        //     iconColor: Colors.warning,
        //     onPress: () => console.log("New Channel pressed"),
        // },
        {
            label: "Secret Chat",
            subtitle: "End-to-end encrypted chat",
            icon: "lock-closed-outline",
            iconColor: Colors.purple,
            onPress: () => console.log("Secret Chat pressed"),
        },
    ], [navigation]);

    // Firestore hooks
    const currentUserId = useCurrentUserId();
    const { chats: firestoreChats, loading: chatsLoading, refreshing, refresh } = useChats();
    const { storyGroups, loading: storiesLoading } = useStories();
    const { tabs: firestoreTabs, loading: tabsLoading } = useTabs();

    // Track online status (handles AppState changes automatically)
    useOnlineStatus();

    // Story type for display
    type StoryDisplay = {
        id: string;
        name: string;
        isMyStory?: boolean;
        hasNewStory?: boolean;
    };

    // Convert Firestore chats to ChatItemType format
    const chatsData: ChatItemType[] = useMemo(() => {
        const mappedChats = firestoreChats.map(({ chat, userChat }): ChatItemType => {
            // For individual chats, get the other participant's info (not the current user)
            const otherParticipantId = chat.participants.find(
                p => p !== currentUserId
            );
            const otherParticipant = otherParticipantId
                ? chat.participantDetails[otherParticipantId]
                : null;

            // Handle Saved Messages (Chat with self)
            if (!otherParticipantId && chat.participants.includes(currentUserId || "")) {
                return {
                    id: chat.id,
                    name: "Saved Messages",
                    message: getMessagePreview(chat.lastMessageType, chat.lastMessage || "Save messages here"),
                    time: chat.lastMessageTime
                        ? formatTime(chat.lastMessageTime.toDate())
                        : "",
                    unreadCount: userChat.unreadCount > 0 ? userChat.unreadCount : undefined,
                    isMuted: userChat.isMuted,
                    isOnline: true,
                    isVerified: false,
                    avatarUrl: undefined, // Will be handled by ChatItem to show bookmark
                    avatarColor: Colors.iosBlue,
                    category: chat.category,
                    recipientId: currentUserId || undefined,
                    isSavedMessages: true,
                };
            }

            // Get avatar URL and color
            const avatarUrl = chat.type === "group"
                ? chat.avatarUrl
                : otherParticipant?.photoURL;

            // Use predefined color for groups, or generate random color for individuals
            const avatarColor = chat.type === "group"
                ? (chat.avatarColor || Colors.primaryAccent)
                : (otherParticipantId ? getAvatarColor(otherParticipantId) : Colors.primaryAccent);

            return {
                id: chat.id,
                name: chat.type === "group"
                    ? chat.name || "Unnamed Group"
                    : otherParticipant?.displayName || "Unknown",
                message: getMessagePreview(chat.lastMessageType, chat.lastMessage || "No messages yet"),
                time: chat.lastMessageTime
                    ? formatTime(chat.lastMessageTime.toDate())
                    : "",
                unreadCount: userChat.unreadCount > 0 ? userChat.unreadCount : undefined,
                isMuted: userChat.isMuted,
                isOnline: otherParticipant?.isOnline,
                isVerified: chat.isVerified,
                avatarUrl: avatarUrl || undefined,
                avatarColor: avatarColor,
                category: chat.category,
                recipientId: otherParticipantId,
            };
        });

        // Ensure "Saved Messages" chat exists at the top
        const hasSavedMessages = mappedChats.some(chat => chat.isSavedMessages);
        if (!hasSavedMessages && currentUserId) {
            mappedChats.unshift({
                id: "saved_messages", // Virtual ID initially, will create on first use
                name: "Saved Messages (Me)",
                message: "Save messages here",
                time: "",
                isOnline: true,
                avatarColor: Colors.iosBlue,
                recipientId: currentUserId,
                isSavedMessages: true
            });
        }

        return mappedChats;
    }, [firestoreChats, currentUserId]);

    // Convert Firestore stories to display format
    const storiesData: StoryDisplay[] = useMemo(() => {
        return storyGroups.map((group): StoryDisplay => ({
            id: group.userId,
            name: group.userName,
            isMyStory: false, // TODO: check against current user
            hasNewStory: group.hasUnseenStory,
        }));
    }, [storyGroups]);

    // Convert Firestore tabs to display format
    const tabsData: TabDisplay[] = useMemo(() => {
        if (firestoreTabs.length > 0) {
            return firestoreTabs.map((tab): TabDisplay => ({
                label: tab.label,
                isActive: tab.isActive,
                count: tab.count > 0 ? tab.count : undefined,
            }));
        }
        // Default tabs if no Firestore data
        return defaultTabs;
    }, [firestoreTabs]);

    // Filter chats based on active tab
    const filteredChats = useMemo(() => {
        let filtered = chatsData;

        // Find the active tab from Firestore tabs
        const activeTabData = firestoreTabs.find(tab => tab.label === activeTab);

        // Filter by tab
        if (activeTab !== "All") {
            // Check if this is a custom folder with specific chatIds
            if (activeTabData && activeTabData.chatIds && activeTabData.chatIds.length > 0) {
                // Filter chats that are in this folder
                filtered = filtered.filter((chat: ChatItemType) =>
                    activeTabData.chatIds!.includes(chat.id)
                );
            } else {
                // Filter by category for default tabs (Groups, Channels, Bots, etc.)
                const categoryKey = activeTab.toLowerCase() as ChatItemType["category"];
                filtered = filtered.filter((chat: ChatItemType) => chat.category === categoryKey);
            }
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((chat: ChatItemType) =>
                chat.name.toLowerCase().includes(query) ||
                chat.message.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [activeTab, chatsData, searchQuery, firestoreTabs]);

    const renderStory = ({ item }: { item: StoryDisplay }) => (
        <TouchableOpacity style={styles.storyItem}>
            <View style={[styles.storyAvatar, item.hasNewStory && styles.storyAvatarActive]}>
                <View style={[styles.storyImagePlaceholder, { backgroundColor: item.isMyStory ? "#E3F2FD" : Colors.primaryAccent }]}>
                    {item.isMyStory ? (
                        <Ionicons name="person" size={24} color={Colors.primaryAccent} />
                    ) : (
                        <Ionicons name="paper-plane" size={24} color={Colors.white} />
                    )}
                </View>
                {item.isMyStory && (
                    <View style={styles.addStoryBadge}>
                        <PlusIcon size={20} />
                    </View>
                )}
            </View>
            <Text style={styles.storyName} numberOfLines={1}>
                {item.name}
            </Text>
        </TouchableOpacity>
    );

    const renderChatItem = ({ item }: { item: ChatItemType }) => (
        <ChatItem
            item={item}
            onPress={() => navigation.navigate('Chat', {
                chatId: item.id,
                name: item.name,
                avatar: item.avatarUrl,
                avatarColor: item.avatarColor,
                recipientId: item.recipientId
            })}
        />
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#517DA2" />

            {/* Header with Drawer */}
            <Header
                title="Chats"
                showDrawerIcon={true}
                showSearch={true}
                onSearchPress={() => setShowSearchBar(!showSearchBar)}
            />

            {/* Search Bar */}
            {showSearchBar && (
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputWrapper}>
                        <Ionicons name="search-outline" size={20} color="#65676B" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search chats..."
                            placeholderTextColor="#65676B"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
                                <Ionicons name="close-circle" size={20} color="#65676B" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}

            {/* Stories */}
            {/* <FlatList
                horizontal
                data={storiesData}
                renderItem={renderStory}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.storiesContent}
                style={styles.storiesContainer}
            /> */}

            {/* Tab Filters */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.tabsContainer}
                contentContainerStyle={styles.tabsContent}
            >
                {tabsData.map((tab, index) => {
                    const isActive = activeTab === tab.label;
                    return (
                        <TouchableOpacity
                            key={index}
                            style={styles.tabBtn}
                            onPress={() => setActiveTab(tab.label)}
                        >
                            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                                {tab.label}
                                {tab.count !== undefined && (
                                    <Text style={[styles.tabCount, isActive && styles.tabCountActive]}>
                                        {" "}{tab.count}
                                    </Text>
                                )}
                            </Text>
                            {isActive && <View style={styles.tabIndicator} />}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Chat List */}
            {chatsLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2196F3" />
                </View>
            ) : (
                <FlatList
                    data={filteredChats}
                    renderItem={renderChatItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    style={[styles.chatList, { marginBottom: insets.bottom }]}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={refresh}
                            colors={["#517DA2"]}
                            tintColor="#517DA2"
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No chats in this category</Text>
                        </View>
                    }
                />
            )}

            {/* FAB Button */}
            <TouchableOpacity
                style={[styles.fab, { bottom: 20 + insets.bottom }]}
                activeOpacity={0.8}
                onPress={() => optionsModalRef.current?.open()}
            >
                <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>

            {/* Options Modal */}
            <OptionsModal
                ref={optionsModalRef}
                items={newChatMenuItems}
                position="bottom-right"
            />
        </View>
    );
}

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    searchContainer: {
        backgroundColor: Colors.white,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: Colors.borderMedium,
    },
    searchInputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F0F0F0",
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 40,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: Colors.black,
        padding: 0,
    },
    clearButton: {
        padding: 4,
    },
    storiesContainer: {
        maxHeight: 100,
        backgroundColor: Colors.white,
    },
    storiesContent: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    storyItem: {
        alignItems: "center",
        marginHorizontal: 6,
        width: 68,
    },
    storyAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: Colors.borderMedium,
        justifyContent: "center",
        alignItems: "center",
    },
    storyAvatarActive: {
        borderColor: Colors.primaryAccent,
    },
    storyImagePlaceholder: {
        width: 54,
        height: 54,
        borderRadius: 27,
        justifyContent: "center",
        alignItems: "center",
    },
    addStoryBadge: {
        position: "absolute",
        bottom: -2,
        right: -2,
    },
    storyName: {
        marginTop: 4,
        fontSize: 11,
        color: Colors.black,
        textAlign: "center",
    },
    tabsContainer: {
        maxHeight: 40,
        backgroundColor: Colors.white,
        borderBottomWidth: 0.5,
        borderBottomColor: Colors.borderMedium,
    },
    tabsContent: {
        paddingHorizontal: 16,
        alignItems: "center",
    },
    tabBtn: {
        marginRight: 20,
        paddingVertical: 8,
        position: "relative",
    },
    tabText: {
        fontSize: 15,
        color: Colors.textLight,
        fontWeight: "500",
    },
    tabTextActive: {
        color: Colors.primaryAccent,
    },
    tabCount: {
        fontSize: 15,
        color: Colors.textLight,
        fontWeight: "400",
    },
    tabCountActive: {
        color: Colors.primaryAccent,
    },
    tabIndicator: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: Colors.primaryAccent,
        borderRadius: 1,
    },
    chatList: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    fab: {
        position: "absolute",
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primaryAccent,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: Colors.primaryAccent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.textLight,
        textAlign: "center",
    },
});
