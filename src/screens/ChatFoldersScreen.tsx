import { Ionicons } from "@expo/vector-icons";
import auth from "@react-native-firebase/auth";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TabService } from "../services/firestore";
import { Tab } from "../types/firestore.types";

const ChatFoldersScreen = () => {
    const navigation = useNavigation();
    const [tabs, setTabs] = useState<Tab[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [selectedEmoji, setSelectedEmoji] = useState("");
    const [editingTab, setEditingTab] = useState<Tab | null>(null);

    const currentUser = auth().currentUser;

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
            } else {
                // Create new folder
                await TabService.createTab(currentUser.uid, folderName);
            }

            setShowCreateDialog(false);
            setNewFolderName("");
            setSelectedEmoji("");
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
        setShowCreateDialog(true);
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
                        <Ionicons name="reorder-three" size={24} color="#999" />
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
                        <Ionicons name="ellipsis-vertical" size={20} color="#666" />
                    </TouchableOpacity>
                )}
            </Animated.View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Chat Folders</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#5B9BD5" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chat Folders</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
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
                            <Ionicons name="folder-open-outline" size={64} color="#ccc" />
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
                        <Ionicons name="add-circle" size={24} color="#5B9BD5" />
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
                                setEditingTab(null);
                            }}>
                                <Ionicons name="close" size={24} color="#666" />
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

                        {/* Action Buttons */}
                        <View style={styles.dialogActions}>
                            <TouchableOpacity
                                style={[styles.dialogButton, styles.cancelButton]}
                                onPress={() => {
                                    setShowCreateDialog(false);
                                    setNewFolderName("");
                                    setSelectedEmoji("");
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
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    header: {
        backgroundColor: "#5B9BD5",
        paddingVertical: 16,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    backButton: {
        marginRight: 16,
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#fff",
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
        color: "#5B9BD5",
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: "#666",
    },
    listContent: {
        paddingBottom: 100,
    },
    folderItem: {
        backgroundColor: "#fff",
        borderRadius: 12,
        marginBottom: 12,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        elevation: 2,
        shadowColor: "#000",
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
        color: "#333",
        marginBottom: 4,
    },
    folderCount: {
        fontSize: 13,
        color: "#999",
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
        color: "#999",
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: "#bbb",
        textAlign: "center",
        paddingHorizontal: 40,
    },
    createButton: {
        position: "absolute",
        bottom: 20,
        left: 16,
        right: 16,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        borderWidth: 2,
        borderColor: "#5B9BD5",
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#5B9BD5",
        marginLeft: 8,
    },
    createDialog: {
        position: "absolute",
        bottom: 20,
        left: 16,
        right: 16,
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        elevation: 8,
        shadowColor: "#000",
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
        color: "#333",
    },
    emojiSection: {
        marginBottom: 20,
    },
    emojiLabel: {
        fontSize: 14,
        color: "#666",
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
        backgroundColor: "#F5F5F5",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "transparent",
    },
    emojiButtonSelected: {
        borderColor: "#5B9BD5",
        backgroundColor: "#E3F2FD",
    },
    emojiText: {
        fontSize: 24,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        color: "#666",
        marginBottom: 8,
        fontWeight: "500",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: "#F9F9F9",
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
        backgroundColor: "#F5F5F5",
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#666",
    },
    createActionButton: {
        backgroundColor: "#5B9BD5",
    },
    createActionButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
    disabledButton: {
        backgroundColor: "#ccc",
        opacity: 0.5,
    },
});

export default ChatFoldersScreen;
