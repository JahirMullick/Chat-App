import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { getAuth } from "@react-native-firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Header from "../components/Header";
import QrCodeScanner from "../components/QrCodeScanner";
import Colors from "../constants/colors";
import { MainStackParamList } from "../Navigation/types";
import { ChatService } from "../services/firestore/chatService";
import UserService from "../services/firestore/userService";
import { UserProfile } from "../types/firestore.types";

export default function NewChatScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
    const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [isCreatingChat, setIsCreatingChat] = useState(false);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [showQrScanner, setShowQrScanner] = useState(false);

    const auth = getAuth();
    const currentUser = auth.currentUser;

    // Load all users on mount
    useEffect(() => {
        loadAllUsers();
    }, []);

    const loadAllUsers = async () => {
        setIsLoadingUsers(true);
        try {
            const users = await UserService.searchUsersByEmail("", currentUser?.uid);
            setAllUsers(users);
        } catch (error) {
            console.error("Error loading users:", error);
        } finally {
            setIsLoadingUsers(false);
        }
    };

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

    // Handle user selection - navigate to chat without creating it yet
    const handleUserSelect = async (user: UserProfile) => {
        if (!currentUser) return;

        // Navigate to chat screen with user info (chat will be created on first message)
        navigation.replace("Chat", {
            chatId: undefined, // No chat created yet
            recipientId: user.uid, // Pass recipient ID for creating chat later
            name: user.displayName || user.email || "Unknown",
            avatarColor: getRandomColor(user.uid),
            isOnline: user.isOnline,
        });
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

    // Handle QR code scan
    const handleQrCodeScanned = async (data: string) => {
        console.log("QR Code scanned:", data);
        setShowQrScanner(false);

        if (!currentUser) {
            alert("You must be logged in to start a chat");
            return;
        }

        try {
            // Parse QR code data
            const parsedData = JSON.parse(data);

            if (parsedData.type !== "user_profile" || !parsedData.userId) {
                alert("Invalid QR code format");
                return;
            }

            const scannedUserId = parsedData.userId;

            // Check if scanning own QR code
            if (scannedUserId === currentUser.uid) {
                alert("You cannot scan your own QR code");
                return;
            }

            // Fetch the scanned user's profile
            const scannedUser = await UserService.getUserById(scannedUserId);

            if (!scannedUser) {
                alert("User not found");
                return;
            }

            // Check if chat already exists
            const existingChat = await ChatService.findIndividualChat(
                currentUser.uid,
                scannedUserId
            );

            if (existingChat) {
                // Navigate to existing chat
                navigation.replace("Chat", {
                    chatId: existingChat.id,
                    recipientId: scannedUserId,
                    name: scannedUser.displayName || scannedUser.email || "Unknown",
                    avatarColor: getRandomColor(scannedUserId),
                    isOnline: scannedUser.isOnline,
                });
            } else {
                // Navigate to new chat (will be created on first message)
                navigation.replace("Chat", {
                    chatId: undefined,
                    recipientId: scannedUserId,
                    name: scannedUser.displayName || scannedUser.email || "Unknown",
                    avatarColor: getRandomColor(scannedUserId),
                    isOnline: scannedUser.isOnline,
                });
            }
        } catch (error) {
            console.error("Error handling QR scan:", error);
            alert("Failed to process QR code. Please try again.");
        }
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
            activeOpacity={0.7}
        >
            <View style={{ position: "relative" }}>
                {item.photoURL ? (
                    <Image source={{ uri: item.photoURL }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, { backgroundColor: getRandomColor(item.uid) }]}>
                        <Text style={styles.avatarText}>{getInitials(item)}</Text>
                    </View>
                )}
                {item.isOnline && <View style={styles.onlineIndicator} />}
            </View>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>
                    {item.displayName || "Unknown User"}
                </Text>
                <Text style={styles.userEmail}>last seen recently</Text>
            </View>
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

    // Display data - use search results if searching, otherwise show all users
    const displayData = searchQuery.trim().length >= 3 ? searchResults : allUsers;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

            {/* Header */}
            <Header
                title="New Message"
                showBackButton
                showSearch={false}
                showDrawerIcon={false}
            />

            {/* Search Input */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={18} color={Colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search"
                    placeholderTextColor={Colors.textSecondary}
                    value={searchQuery}
                    onChangeText={handleSearch}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity
                        onPress={() => {
                            setSearchQuery("");
                            setSearchResults([]);
                            setHasSearched(false);
                        }}
                        style={styles.clearButton}
                    >
                        <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
                <TouchableOpacity
                    style={styles.quickActionItem}
                    onPress={() => navigation.navigate('NewGroup')}>
                    <View style={styles.quickActionIcon}>
                        <Ionicons name="people" size={24} color={Colors.primary} />
                    </View>
                    <Text style={styles.quickActionText}>New Group</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.quickActionItem}
                    onPress={() => setShowQrScanner(true)}
                >
                    <View style={styles.quickActionIcon}>
                        <MaterialCommunityIcons name="qrcode-scan" size={24} color={Colors.primary} />
                    </View>
                    <Text style={styles.quickActionText}>New Contact</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.quickActionItem}
                    onPress={() => console.log("Button Pressed")}>
                    <View style={styles.quickActionIcon}>
                        <MaterialCommunityIcons name="bullhorn" size={24} color={Colors.primary} />
                    </View>
                    <Text style={styles.quickActionText}>New Channel</Text>
                </TouchableOpacity>
            </View>



            {/* Section Header */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Sorted by last seen time</Text>
            </View>

            {/* Results List */}
            <FlatList
                data={displayData}
                renderItem={renderUserItem}
                keyExtractor={(item) => item.uid}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmptyState}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
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

            {/* QR Code Scanner Modal */}
            <Modal
                visible={showQrScanner}
                animationType="slide"
                onRequestClose={() => setShowQrScanner(false)}
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity
                        onPress={() => setShowQrScanner(false)}
                        style={styles.closeButtonAbsolute}
                    >
                        <Ionicons name="arrow-back" size={28} color={Colors.white} />
                    </TouchableOpacity>
                    <QrCodeScanner onScanned={handleQrCodeScanned} />
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    headerAction: {
        padding: 4,
    },
    quickActions: {
        flexDirection: "row",
        paddingVertical: 16,
        paddingHorizontal: 8,
        backgroundColor: Colors.white,
        borderBottomWidth: 8,
        borderBottomColor: Colors.gray50,
    },
    quickActionItem: {
        flex: 1,
        alignItems: "center",
    },
    quickActionIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.backgroundAccent,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    quickActionText: {
        fontSize: 12,
        color: Colors.textPrimary,
        textAlign: "center",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.gray50,
        borderRadius: 8,
        marginHorizontal: 8,
        marginVertical: 8,
        paddingHorizontal: 10,
        height: 36,
    },
    searchIcon: {
        marginRight: 6,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: Colors.textPrimary,
        height: "100%",
        paddingVertical: 0,
    },
    clearButton: {
        padding: 4,
    },
    sectionHeader: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: Colors.gray50,
    },
    sectionTitle: {
        fontSize: 13,
        color: Colors.textSecondary,
        textTransform: "capitalize",
    },
    listContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    userItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: Colors.white,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        fontSize: 20,
        fontWeight: "600",
        color: Colors.white,
    },
    userInfo: {
        flex: 1,
        marginLeft: 12,
    },
    userName: {
        fontSize: 16,
        fontWeight: "400",
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    onlineIndicator: {
        position: "absolute",
        right: 0,
        bottom: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: Colors.online,
        borderWidth: 2,
        borderColor: Colors.white,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
        paddingTop: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.textPrimary,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: "center",
        lineHeight: 20,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Colors.blackOpacity,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingBox: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    loadingText: {
        fontSize: 15,
        fontWeight: "500",
        color: Colors.textPrimary,
        marginTop: 12,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: Colors.black,
    },
    closeButtonAbsolute: {
        position: 'absolute',
        top: 40,
        left: 16,
        zIndex: 10,
        padding: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 20,
    },
});
