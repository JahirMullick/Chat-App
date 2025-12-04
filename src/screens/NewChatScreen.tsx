import { Ionicons } from "@expo/vector-icons";
import auth from "@react-native-firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MainStackParamList } from "../Navigation/types";
import { ChatService } from "../services/firestore";
import UserService from "../services/firestore/userService";
import { UserProfile } from "../types/firestore.types";

export default function NewChatScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [isCreatingChat, setIsCreatingChat] = useState(false);

    const currentUser = auth().currentUser;

    // Debounced search function
    const handleSearch = useCallback(async (query: string) => {
        setSearchQuery(query);

        if (query.trim().length < 3) {
            setSearchResults([]);
            setHasSearched(false);
            return;
        }

        setIsSearching(true);
        setHasSearched(true);

        try {
            const results = await UserService.searchUsersByEmail(
                query.trim(),
                currentUser?.uid
            );
            setSearchResults(results);
        } catch (error) {
            console.error("Search error:", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [currentUser?.uid]);

    // Handle user selection
    const handleUserSelect = async (user: UserProfile) => {
        if (!currentUser) return;

        setIsCreatingChat(true);

        try {
            // Check if chat already exists or create a new one
            const chatId = await ChatService.createIndividualChat(
                currentUser.uid,
                user.uid
            );

            // Navigate to chat screen
            navigation.replace("Chat", {
                chatId,
                name: user.displayName || user.email || "Unknown",
                avatarColor: getRandomColor(user.uid),
                isOnline: user.isOnline,
            });
        } catch (error) {
            console.error("Error creating chat:", error);
            setIsCreatingChat(false);
        }
    };

    // Generate a random color based on user ID
    const getRandomColor = (uid: string): string => {
        const colors = [
            "#E91E63", "#9C27B0", "#673AB7", "#3F51B5",
            "#2196F3", "#00BCD4", "#009688", "#4CAF50",
            "#FF9800", "#FF5722", "#795548", "#607D8B",
        ];
        const index = uid.charCodeAt(0) % colors.length;
        return colors[index];
    };

    // Get initials from name or email
    const getInitials = (user: UserProfile): string => {
        if (user.displayName) {
            return user.displayName
                .split(" ")
                .map(n => n[0])
                .join("")
                .toUpperCase()
                .substring(0, 2);
        }
        if (user.email) {
            return user.email[0].toUpperCase();
        }
        return "?";
    };

    // Render user item
    const renderUserItem = ({ item }: { item: UserProfile }) => (
        <TouchableOpacity
            style={styles.userItem}
            onPress={() => handleUserSelect(item)}
            disabled={isCreatingChat}
        >
            {item.photoURL ? (
                <Image source={{ uri: item.photoURL }} style={styles.avatar} />
            ) : (
                <View style={[styles.avatar, { backgroundColor: getRandomColor(item.uid) }]}>
                    <Text style={styles.avatarText}>{getInitials(item)}</Text>
                </View>
            )}
            <View style={styles.userInfo}>
                <Text style={styles.userName}>
                    {item.displayName || "Unknown User"}
                </Text>
                <Text style={styles.userEmail}>{item.email}</Text>
            </View>
            {item.isOnline && <View style={styles.onlineIndicator} />}
        </TouchableOpacity>
    );

    // Render empty state
    const renderEmptyState = () => {
        if (isSearching) {
            return (
                <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color="#2196F3" />
                    <Text style={styles.emptyText}>Searching...</Text>
                </View>
            );
        }

        if (hasSearched && searchResults.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <Ionicons name="person-outline" size={64} color="#C7C7CC" />
                    <Text style={styles.emptyTitle}>No Users Found</Text>
                    <Text style={styles.emptyText}>
                        No users found with this email address.
                    </Text>
                </View>
            );
        }

        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={64} color="#C7C7CC" />
                <Text style={styles.emptyTitle}>Search by Email</Text>
                <Text style={styles.emptyText}>
                    Enter an email address to find users and start a conversation.
                </Text>
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Chat</Text>
                <View style={styles.headerRight} />
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by email address..."
                    placeholderTextColor="#8E8E93"
                    value={searchQuery}
                    onChangeText={handleSearch}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity
                        onPress={() => {
                            setSearchQuery("");
                            setSearchResults([]);
                            setHasSearched(false);
                        }}
                    >
                        <Ionicons name="close-circle" size={20} color="#8E8E93" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Search hint */}
            {searchQuery.length > 0 && searchQuery.length < 3 && (
                <Text style={styles.searchHint}>
                    Enter at least 3 characters to search
                </Text>
            )}

            {/* Results List */}
            <FlatList
                data={searchResults}
                renderItem={renderUserItem}
                keyExtractor={(item) => item.uid}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmptyState}
                keyboardShouldPersistTaps="handled"
            />

            {/* Loading overlay when creating chat */}
            {isCreatingChat && (
                <View style={styles.loadingOverlay}>
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="large" color="#2196F3" />
                        <Text style={styles.loadingText}>Starting chat...</Text>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#E5E5EA",
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000",
    },
    headerRight: {
        width: 40,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F2F2F7",
        borderRadius: 12,
        marginHorizontal: 16,
        marginVertical: 12,
        paddingHorizontal: 12,
        height: 44,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: "#000",
        height: "100%",
    },
    searchHint: {
        fontSize: 13,
        color: "#8E8E93",
        textAlign: "center",
        marginBottom: 8,
    },
    listContent: {
        flexGrow: 1,
    },
    userItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#E5E5EA",
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#fff",
    },
    userInfo: {
        flex: 1,
        marginLeft: 12,
    },
    userName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 14,
        color: "#8E8E93",
    },
    onlineIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#4CAF50",
        borderWidth: 2,
        borderColor: "#fff",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
        paddingTop: 60,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#000",
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 15,
        color: "#8E8E93",
        textAlign: "center",
        lineHeight: 22,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    loadingBox: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    loadingText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#000",
        marginTop: 12,
    },
});
