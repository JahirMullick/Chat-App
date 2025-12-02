import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
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

// Chat data
const chats: ChatItemType[] = [
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
        id: "2",
        name: "Telegram Support",
        message: "New Login Detected",
        time: "11:38 AM",
        unreadCount: 1,
        isVerified: true,
        avatarColor: "#2196F3",
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
        id: "4",
        name: "Telegram Contests",
        message: "Clarifications for participants of..",
        time: "11:38 AM",
        unreadCount: 24,
        isVerified: true,
        avatarColor: "#FFC107",
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
    {
        id: "7",
        name: "Eleanor Pena",
        message: "See you tomorrow!",
        time: "Wed",
        avatarColor: "#00BCD4",
    },
    {
        id: "8",
        name: "Albert Flores",
        message: "Bye",
        time: "Thu",
        messageStatus: "sent",
        avatarColor: "#4CAF50",
    },
    {
        id: "9",
        name: "Kristin",
        message: "Thanks ❤️",
        time: "Wed",
        avatarColor: "#FF9800",
    },
    {
        id: "10",
        name: "Eleanor Pena",
        message: "See you tomorrow!",
        time: "Wed",
        avatarColor: "#00BCD4",
    },
];

export default function HomeScreen() {
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState("All");

    const renderStory = ({ item }: { item: typeof stories[0] }) => (
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
                        <Ionicons name="add" size={12} color="#fff" />
                    </View>
                )}
            </View>
            <Text style={styles.storyName} numberOfLines={1}>
                {item.name}
            </Text>
        </TouchableOpacity>
    );

    const renderChatItem = ({ item }: { item: ChatItemType }) => (
        <ChatItem item={item} onPress={() => console.log("Chat pressed:", item.name)} />
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
                data={stories}
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
                {tabs.map((tab, index) => {
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
            <FlatList
                data={chats}
                renderItem={renderChatItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                style={styles.chatList}
            />

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
        overflow: "hidden",
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
        bottom: 0,
        right: 0,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "#2196F3",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#fff",
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
});
