import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChatItem, { ChatItemType } from "../components/ChatItem";
import Header from "../components/Header";
import PlusIcon from "../components/icons/Plus";
import { useChats, useOnlineStatus, useStories, useTabs } from "../Hooks/useFirestore";
import { MainStackParamList } from "../Navigation/types";

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

// Tab type for display
type TabDisplay = {
    label: string;
    isActive?: boolean;
    count?: number;
};

// Stories data
const stories = [
    { id: "1", name: "My Stories", isMyStory: true, hasNewStory: false },
    { id: "2", name: "Telegram", hasNewStory: true },
    { id: "3", name: "Design Stuff", hasNewStory: true },
    { id: "4", name: "Mojtaba", hasNewStory: false },
    { id: "5", name: "Amirmahdi", hasNewStory: false },
    { id: "6", name: "Rose", hasNewStory: true },
];

// Tab filters
const tabs = [
    { label: "All", isActive: true },
    { label: "Groups", count: 120 },
    { label: "Channels", count: 3 },
    { label: "Bots", count: 2 },
    { label: "Design", count: 5 },
    { label: "Books", count: 3 },
    { label: "Ai", count: 2 },
    { label: "sign", count: 5 },
];

// Chat data with categories
const chats: ChatItemType[] = [
    // Personal chats (no category - shows in All only)
    {
        id: "1",
        name: "Victoria",
        message: "🎨 Yes, they are necessary",
        time: "04:20 AM",
        isMuted: true,
        isOnline: true,
        hasMention: true,
        avatarColor: "#E91E63",
    },
    {
        id: "3",
        name: "Eliza",
        message: "Okay",
        time: "10:24 AM",
        messageStatus: "read",
        avatarColor: "#9C27B0",
    },
    {
        id: "5",
        name: "Albert Flores",
        message: "Bye",
        time: "Thu",
        messageStatus: "sent",
        avatarColor: "#4CAF50",
    },
    {
        id: "6",
        name: "Kristin",
        message: "Thanks ❤️",
        time: "Wed",
        avatarColor: "#FF9800",
    },
    // Groups
    {
        id: "7",
        name: "Design Team",
        message: "New mockups uploaded!",
        time: "Wed",
        unreadCount: 5,
        avatarColor: "#00BCD4",
        category: "groups",
    },
    {
        id: "8",
        name: "React Native Devs",
        message: "Check out the new Expo update",
        time: "Tue",
        unreadCount: 12,
        avatarColor: "#61DAFB",
        category: "groups",
    },
    {
        id: "9",
        name: "Book Club",
        message: "Next meeting on Friday",
        time: "Mon",
        avatarColor: "#8D6E63",
        category: "groups",
    },
    // Channels
    {
        id: "2",
        name: "Telegram Support",
        message: "New Login Detected",
        time: "11:38 AM",
        unreadCount: 1,
        isVerified: true,
        avatarColor: "#2196F3",
        category: "channels",
    },
    {
        id: "4",
        name: "Telegram Contests",
        message: "Clarifications for participants of..",
        time: "11:38 AM",
        unreadCount: 24,
        isVerified: true,
        avatarColor: "#FFC107",
        category: "channels",
    },
    {
        id: "10",
        name: "Tech News",
        message: "Apple announces new products",
        time: "Today",
        unreadCount: 8,
        isVerified: true,
        avatarColor: "#607D8B",
        category: "channels",
    },
    // Bots
    {
        id: "11",
        name: "ChatGPT Bot",
        message: "How can I help you today?",
        time: "Just now",
        isVerified: true,
        avatarColor: "#10A37F",
        category: "bots",
    },
    {
        id: "12",
        name: "Weather Bot",
        message: "Today: Sunny, 24°C",
        time: "08:00 AM",
        avatarColor: "#FFB300",
        category: "bots",
    },
    // Design category
    {
        id: "13",
        name: "UI/UX Inspiration",
        message: "Check this Dribbble shot 🔥",
        time: "Yesterday",
        unreadCount: 3,
        avatarColor: "#EA4C89",
        category: "design",
    },
    {
        id: "14",
        name: "Figma Updates",
        message: "New features released!",
        time: "2 days ago",
        avatarColor: "#A259FF",
        category: "design",
    },
    // Books category
    {
        id: "15",
        name: "Reading List",
        message: "Added: Atomic Habits",
        time: "Last week",
        avatarColor: "#795548",
        category: "books",
    },
    {
        id: "16",
        name: "Book Recommendations",
        message: "Try 'Deep Work' by Cal Newport",
        time: "3 days ago",
        unreadCount: 2,
        avatarColor: "#4E342E",
        category: "books",
    },
    // AI category
    {
        id: "17",
        name: "AI Research",
        message: "GPT-5 rumors are spreading",
        time: "Today",
        unreadCount: 7,
        avatarColor: "#673AB7",
        category: "ai",
    },
    {
        id: "18",
        name: "ML Engineers",
        message: "New PyTorch release",
        time: "Yesterday",
        avatarColor: "#EE4C2C",
        category: "ai",
    },
    // Sign category
    {
        id: "19",
        name: "Sign Language Learning",
        message: "New lesson available! 👋",
        time: "Today",
        unreadCount: 1,
        avatarColor: "#009688",
        category: "sign",
    },
    {
        id: "20",
        name: "ASL Community",
        message: "Weekly practice session tomorrow",
        time: "Yesterday",
        avatarColor: "#00897B",
        category: "sign",
    },
];

export default function HomeScreen() {
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState("All");
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

    // Firestore hooks
    const { chats: firestoreChats, loading: chatsLoading } = useChats();
    const { storyGroups, loading: storiesLoading } = useStories();
    const { tabs: firestoreTabs, loading: tabsLoading } = useTabs();

    // Track online status
    useOnlineStatus();

    // Convert Firestore chats to ChatItemType format
    const chatsData = useMemo(() => {
        if (firestoreChats.length > 0) {
            return firestoreChats.map(({ chat, userChat }): ChatItemType => {
                // For individual chats, get the other participant's info
                const otherParticipantId = chat.participants.find(
                    p => p !== userChat.chatId
                );
                const otherParticipant = otherParticipantId
                    ? chat.participantDetails[otherParticipantId]
                    : null;

                return {
                    id: chat.id,
                    name: chat.type === "group"
                        ? chat.name || "Unnamed Group"
                        : otherParticipant?.displayName || "Unknown",
                    message: chat.lastMessage || "No messages yet",
                    time: chat.lastMessageTime
                        ? formatTime(chat.lastMessageTime.toDate())
                        : "",
                    unreadCount: userChat.unreadCount > 0 ? userChat.unreadCount : undefined,
                    isMuted: userChat.isMuted,
                    isOnline: otherParticipant?.isOnline,
                    isVerified: chat.isVerified,
                    avatarColor: chat.avatarColor || "#2196F3",
                    category: chat.category,
                };
            });
        }
        // Fallback to static data if no Firestore data
        return chats;
    }, [firestoreChats]);

    // Convert Firestore stories to display format
    const storiesData = useMemo(() => {
        if (storyGroups.length > 0) {
            return storyGroups.map((group): typeof stories[0] => ({
                id: group.userId,
                name: group.userName,
                isMyStory: false, // TODO: check against current user
                hasNewStory: group.hasUnseenStory,
            }));
        }
        // Fallback to static data
        return stories;
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
        // Fallback to static data
        return tabs;
    }, [firestoreTabs]);

    // Filter chats based on active tab
    const filteredChats = useMemo(() => {
        if (activeTab === "All") {
            return chatsData;
        }
        const categoryKey = activeTab.toLowerCase() as ChatItemType["category"];
        return chatsData.filter((chat) => chat.category === categoryKey);
    }, [activeTab, chatsData]);

    const renderStory = ({ item }: { item: typeof storiesData[0] }) => (
        <TouchableOpacity style={styles.storyItem}>
            <View style={[styles.storyAvatar, item.hasNewStory && styles.storyAvatarActive]}>
                <View style={[styles.storyImagePlaceholder, { backgroundColor: item.isMyStory ? "#E3F2FD" : "#2196F3" }]}>
                    {item.isMyStory ? (
                        <Ionicons name="person" size={24} color="#2196F3" />
                    ) : (
                        <Ionicons name="paper-plane" size={24} color="#fff" />
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
                avatarColor: item.avatarColor
            })}
        />
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header with Drawer */}
            <Header
                title="Chats"
                showDrawerIcon={true}
                showSearch={true}
                onSearchPress={() => console.log("Search pressed")}
            />

            {/* Stories */}
            <FlatList
                horizontal
                data={storiesData}
                renderItem={renderStory}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.storiesContent}
                style={styles.storiesContainer}
            />

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
            >
                <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    storiesContainer: {
        maxHeight: 100,
        backgroundColor: "#fff",
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
        borderColor: "#E5E5EA",
        justifyContent: "center",
        alignItems: "center",
    },
    storyAvatarActive: {
        borderColor: "#2196F3",
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
        color: "#000",
        textAlign: "center",
    },
    tabsContainer: {
        maxHeight: 40,
        backgroundColor: "#fff",
        borderBottomWidth: 0.5,
        borderBottomColor: "#E5E5EA",
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
        color: "#8E8E93",
        fontWeight: "500",
    },
    tabTextActive: {
        color: "#2196F3",
    },
    tabCount: {
        fontSize: 15,
        color: "#8E8E93",
        fontWeight: "400",
    },
    tabCountActive: {
        color: "#2196F3",
    },
    tabIndicator: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: "#2196F3",
        borderRadius: 1,
    },
    chatList: {
        flex: 1,
        backgroundColor: "#fff",
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
        backgroundColor: "#2196F3",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#2196F3",
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
        color: "#8E8E93",
        textAlign: "center",
    },
});
