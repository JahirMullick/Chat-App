import { Ionicons } from "@expo/vector-icons";
import auth from "@react-native-firebase/auth";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import Colors from "../constants/colors";
import { useChats } from "../Hooks/useFirestore";
import { TabService } from "../services/firestore";
import { Tab } from "../types/firestore.types";

// Type for selectable chat
type SelectableChat = {
    id: string;
    name: string;
    avatarUrl?: string | null;
    type: "individual" | "group";
};

const ChatFoldersScreen = () => {
    const navigation = useNavigation();
    const [tabs, setTabs] = useState<Tab[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [selectedEmoji, setSelectedEmoji] = useState("");
    const [editingTab, setEditingTab] = useState<Tab | null>(null);
    const [selectedChatIds, setSelectedChatIds] = useState<string[]>([]);
    const [availableChats, setAvailableChats] = useState<SelectableChat[]>([]);

    const currentUser = auth().currentUser;
    const { chats: firestoreChats } = useChats();

    // Popular folder emojis
    const popularEmojis = ["📚", "💼", "🎯", "🎨", "💡", "🏠", "⚡", "🌟", "🔥", "💬", "📱", "🎮"];

    useEffect(() => {
        if (!currentUser) return;

        const unsubscribe = TabService.subscribeToUserTabs(
            currentUser.uid,
            (updatedTabs) => {
                setTabs(updatedTabs);
                setLoading(false);
            },
            (error) => {
                console.error("Error subscribing to tabs:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [currentUser]);

    // Convert Firestore chats to selectable format
    useEffect(() => {
        if (!currentUser) return;

        const chatsForSelection: SelectableChat[] = firestoreChats.map(({ chat }) => {
            // For individual chats, get the other participant's name
            const otherParticipantId = chat.participants.find(p => p !== currentUser.uid);
            const otherParticipant = otherParticipantId
                ? chat.participantDetails[otherParticipantId]
                : null;

            const chatName = chat.type === "group"
                ? chat.name || "Unnamed Group"
                : otherParticipant?.displayName || "Unknown User";

            const avatarUrl = chat.type === "group"
                ? chat.avatarUrl
                : otherParticipant?.photoURL;

            return {
                id: chat.id,
                name: chatName,
                avatarUrl: avatarUrl,
                type: chat.type,
            };
        });

        setAvailableChats(chatsForSelection);
    }, [firestoreChats, currentUser]);

    const handleCreateFolder = async () => {
        if (!currentUser || !newFolderName.trim()) {
            Alert.alert("Error", "Please enter a folder name");
            return;
        }

        try {
            const folderName = selectedEmoji
                ? `${selectedEmoji} ${newFolderName.trim()}`
                : newFolderName.trim();

            if (editingTab) {
                // Update existing folder
                await TabService.updateTab(currentUser.uid, editingTab.id, {
                    label: folderName,
                });
                // Update the chat IDs for this folder
                if (selectedChatIds.length > 0) {
                    await TabService.setChatsForTab(currentUser.uid, editingTab.id, selectedChatIds);
                }
            } else {
                // Create new folder
                const newTabId = await TabService.createTab(currentUser.uid, folderName);
                // Add selected chats to the new folder
                if (selectedChatIds.length > 0) {
                    await TabService.addChatsToTab(currentUser.uid, newTabId, selectedChatIds);
                }
            }

            setShowCreateDialog(false);
            setNewFolderName("");
            setSelectedEmoji("");
            setSelectedChatIds([]);
            setEditingTab(null);
        } catch (error) {
            console.error("Error creating/updating folder:", error);
            Alert.alert("Error", `Failed to ${editingTab ? 'update' : 'create'} folder`);
        }
    };

    const handleEditFolder = async (tab: Tab) => {
        if (!currentUser) return;

        setEditingTab(tab);
        setNewFolderName(tab.label);
        setSelectedChatIds(tab.chatIds || []);
        setShowCreateDialog(true);
    };

    const toggleChatSelection = (chatId: string) => {
        setSelectedChatIds(prev =>
            prev.includes(chatId)
                ? prev.filter(id => id !== chatId)
                : [...prev, chatId]
        );
    };

    const getInitials = (name: string): string => {
        const words = name.trim().split(/\s+/);
        if (words.length >= 2) {
            return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
        }
        return name.charAt(0).toUpperCase();
    };

    const getAvatarColor = (chatId: string): string => {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
            '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
        ];
        let hash = 0;
        for (let i = 0; i < chatId.length; i++) {
            hash = chatId.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const handleDeleteFolder = (tab: Tab) => {
        if (tab.label === "All") {
            Alert.alert("Cannot Delete", "The 'All' folder cannot be deleted");
            return;
        }

        Alert.alert(
            "Delete Folder",
            `Are you sure you want to delete "${tab.label}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        if (currentUser) {
                            try {
                                await TabService.deleteTab(currentUser.uid, tab.id);
                            } catch (error) {
                                Alert.alert("Error", "Failed to delete folder");
                            }
                        }
                    },
                },
            ]
        );
    };

    const renderFolderItem = ({ item, index }: { item: Tab; index: number }) => {
        const isAllChats = item.label === "All";
        const isPinned = item.label.includes("📌");

        return (
            <Animated.View
                style={[
                    styles.folderItem,
                    { opacity: 1 },
                ]}
            >
                <View style={styles.folderLeft}>
                    <View style={styles.dragHandle}>
                        <Ionicons name="reorder-three" size={24} color={Colors.textTertiary} />
                    </View>
                    <View style={styles.folderInfo}>
                        <Text style={styles.folderName}>{item.label}</Text>
                        <Text style={styles.folderCount}>
                            {item.count} {item.count === 1 ? "chat" : "chats"}
                        </Text>
                    </View>
                </View>

                {!isAllChats && (
                    <TouchableOpacity
                        style={styles.menuButton}
                        onPress={() => {
                            Alert.alert(
                                item.label,
                                "Choose an action",
                                [
                                    {
                                        text: "Edit",
                                        onPress: () => handleEditFolder(item),
                                    },
                                    {
                                        text: "Delete",
                                        style: "destructive",
                                        onPress: () => handleDeleteFolder(item),
                                    },
                                    { text: "Cancel", style: "cancel" },
                                ]
                            );
                        }}
                    >
                        <Ionicons name="ellipsis-vertical" size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </Animated.View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['bottom']}>
                <Header
                    title="Chat Folders"
                    showSearch={false}
                    showDrawerIcon={false}
                    showBackButton={true}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primaryDark} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            {/* Header */}
            <Header
                title="Chat Folders"
                showSearch={false}
                showDrawerIcon={false}
                showBackButton={true}
            />

            {/* Content */}
            <KeyboardAvoidingView
                style={styles.content}
                behavior="padding"
                keyboardVerticalOffset={0}
            >
                {/* Section Header */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Chat Folders</Text>
                    <Text style={styles.sectionSubtitle}>
                        Organize your chats into custom folders
                    </Text>
                </View>

                {/* Folders List */}
                <FlatList
                    data={tabs}
                    keyExtractor={(item) => item.id}
                    renderItem={renderFolderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="folder-open-outline" size={64} color={Colors.iconLight} />
                            <Text style={styles.emptyText}>No folders yet</Text>
                            <Text style={styles.emptySubtext}>
                                Create your first folder to organize chats
                            </Text>
                        </View>
                    }
                />

                {/* Create Folder Button */}
                {!showCreateDialog ? (
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={() => setShowCreateDialog(true)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add-circle" size={24} color={Colors.primaryDark} />
                        <Text style={styles.createButtonText}>Create New Folder</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.createDialog}>
                        <View style={styles.dialogHeader}>
                            <Text style={styles.dialogTitle}>
                                {editingTab ? "Edit Folder" : "New Folder"}
                            </Text>
                            <TouchableOpacity onPress={() => {
                                setShowCreateDialog(false);
                                setNewFolderName("");
                                setSelectedEmoji("");
                                setSelectedChatIds([]);
                                setEditingTab(null);
                            }}>
                                <Ionicons name="close" size={24} color={Colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {/* Emoji Selector */}
                        <View style={styles.emojiSection}>
                            <Text style={styles.emojiLabel}>Choose an icon (optional)</Text>
                            <View style={styles.emojiGrid}>
                                {popularEmojis.map((emoji) => (
                                    <TouchableOpacity
                                        key={emoji}
                                        style={[
                                            styles.emojiButton,
                                            selectedEmoji === emoji && styles.emojiButtonSelected,
                                        ]}
                                        onPress={() => setSelectedEmoji(selectedEmoji === emoji ? "" : emoji)}
                                    >
                                        <Text style={styles.emojiText}>{emoji}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Name Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Folder Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., Work, Personal, Family"
                                value={newFolderName}
                                onChangeText={setNewFolderName}
                                autoFocus
                                maxLength={30}
                            />
                        </View>

                        {/* Chat Selection Section */}
                        <View style={styles.chatSelectionContainer}>
                            <Text style={styles.inputLabel}>
                                Add Chats ({selectedChatIds.length} selected)
                            </Text>
                            <ScrollView
                                style={styles.chatList}
                                showsVerticalScrollIndicator={false}
                            >
                                {availableChats.length === 0 ? (
                                    <View style={styles.emptyChatsContainer}>
                                        <Text style={styles.emptyChatsText}>No chats available</Text>
                                    </View>
                                ) : (
                                    availableChats.map((chat) => {
                                        const isSelected = selectedChatIds.includes(chat.id);
                                        return (
                                            <TouchableOpacity
                                                key={chat.id}
                                                style={[
                                                    styles.chatSelectItem,
                                                    isSelected && styles.chatSelectItemSelected,
                                                ]}
                                                onPress={() => toggleChatSelection(chat.id)}
                                                activeOpacity={0.7}
                                            >
                                                <View style={styles.chatSelectLeft}>
                                                    {chat.avatarUrl ? (
                                                        <Image
                                                            source={{ uri: chat.avatarUrl }}
                                                            style={styles.chatSelectAvatar}
                                                        />
                                                    ) : (
                                                        <View
                                                            style={[
                                                                styles.chatSelectAvatar,
                                                                styles.chatSelectAvatarInitials,
                                                                { backgroundColor: getAvatarColor(chat.id) },
                                                            ]}
                                                        >
                                                            <Text style={styles.chatSelectAvatarText}>
                                                                {getInitials(chat.name)}
                                                            </Text>
                                                        </View>
                                                    )}
                                                    <View style={styles.chatSelectInfo}>
                                                        <Text style={styles.chatSelectName} numberOfLines={1}>
                                                            {chat.name}
                                                        </Text>
                                                        <Text style={styles.chatSelectType}>
                                                            {chat.type === "group" ? "Group" : "Individual"}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <View
                                                    style={[
                                                        styles.checkbox,
                                                        isSelected && styles.checkboxSelected,
                                                    ]}
                                                >
                                                    {isSelected && (
                                                        <Ionicons
                                                            name="checkmark"
                                                            size={16}
                                                            color={Colors.white}
                                                        />
                                                    )}
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })
                                )}
                            </ScrollView>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.dialogActions}>
                            <TouchableOpacity
                                style={[styles.dialogButton, styles.cancelButton]}
                                onPress={() => {
                                    setShowCreateDialog(false);
                                    setNewFolderName("");
                                    setSelectedEmoji("");
                                    setSelectedChatIds([]);
                                    setEditingTab(null);
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.dialogButton,
                                    styles.createActionButton,
                                    !newFolderName.trim() && styles.disabledButton,
                                ]}
                                onPress={handleCreateFolder}
                                disabled={!newFolderName.trim()}
                            >
                                <Text style={styles.createActionButtonText}>
                                    {editingTab ? "Update" : "Create"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    sectionHeader: {
        paddingVertical: 20,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: "600",
        color: Colors.primaryDark,
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    listContent: {
        paddingBottom: 100,
    },
    folderItem: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        marginBottom: 12,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        elevation: 2,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    folderLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    dragHandle: {
        marginRight: 12,
    },
    folderInfo: {
        flex: 1,
    },
    folderName: {
        fontSize: 16,
        fontWeight: "500",
        color: Colors.gray500,
        marginBottom: 4,
    },
    folderCount: {
        fontSize: 13,
        color: Colors.textTertiary,
    },
    menuButton: {
        padding: 8,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.textTertiary,
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: Colors.iconMedium,
        textAlign: "center",
        paddingHorizontal: 40,
    },
    createButton: {
        position: "absolute",
        bottom: 20,
        left: 16,
        right: 16,
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        elevation: 4,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        borderWidth: 2,
        borderColor: Colors.primaryDark,
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.primaryDark,
        marginLeft: 8,
    },
    createDialog: {
        position: "absolute",
        bottom: 20,
        left: 16,
        right: 16,
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 20,
        elevation: 8,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    dialogHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    dialogTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: Colors.gray500,
    },
    emojiSection: {
        marginBottom: 20,
    },
    emojiLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 12,
        fontWeight: "500",
    },
    emojiGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    emojiButton: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: Colors.background,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: Colors.transparent,
    },
    emojiButtonSelected: {
        borderColor: Colors.primaryDark,
        backgroundColor: Colors.backgroundAccent,
    },
    emojiText: {
        fontSize: 24,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 8,
        fontWeight: "500",
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: Colors.backgroundLight,
    },
    dialogActions: {
        flexDirection: "row",
        gap: 12,
    },
    dialogButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: Colors.background,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.textSecondary,
    },
    createActionButton: {
        backgroundColor: Colors.primaryDark,
    },
    createActionButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.white,
    },
    disabledButton: {
        backgroundColor: Colors.iconLight,
        opacity: 0.5,
    },
    chatSelectionContainer: {
        marginBottom: 20,
    },
    chatList: {
        maxHeight: 200,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        backgroundColor: Colors.backgroundLight,
    },
    emptyChatsContainer: {
        padding: 20,
        alignItems: "center",
    },
    emptyChatsText: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    chatSelectItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    chatSelectItemSelected: {
        backgroundColor: Colors.backgroundAccent,
    },
    chatSelectLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    chatSelectAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    chatSelectAvatarInitials: {
        justifyContent: "center",
        alignItems: "center",
    },
    chatSelectAvatarText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.white,
    },
    chatSelectInfo: {
        flex: 1,
    },
    chatSelectName: {
        fontSize: 15,
        fontWeight: "500",
        color: Colors.gray500,
        marginBottom: 2,
    },
    chatSelectType: {
        fontSize: 12,
        color: Colors.textTertiary,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: Colors.border,
        justifyContent: "center",
        alignItems: "center",
    },
    checkboxSelected: {
        backgroundColor: Colors.primaryDark,
        borderColor: Colors.primaryDark,
    },
});

export default ChatFoldersScreen;
