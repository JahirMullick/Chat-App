import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
    FlatList,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "../constants/colors";
import { useCurrentUserId, useUsers } from "../Hooks/useFirestore";
import { MainStackParamList } from "../Navigation/types";

interface Contact {
    id: string;
    name: string;
    lastSeen: string;
    photoURL?: string | null;
    avatarColor?: string;
}

export default function NewGroupScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
    const currentUserId = useCurrentUserId();
    const { users } = useUsers();
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const formatLastSeen = (lastSeen: any): string => {
        if (!lastSeen) return "last seen a long time ago";
        const date = lastSeen.toDate ? lastSeen.toDate() : new Date(lastSeen);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "last seen recently";
        if (minutes < 60) return "last seen recently";
        if (hours < 24) return "last seen recently";
        if (days < 7) return "last seen within a week";
        if (days < 30) return "last seen within a month";
        return "last seen a long time ago";
    };

    const getAvatarColor = (userId: string): string => {
        const colors = [
            "#9C7CF4",
            "#FF9800",
            "#E53935",
            "#66BB6A",
            "#42A5F5",
            "#FF6B6B",
            "#4ECDC4",
            "#45B7D1",
        ];
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            hash = userId.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    // Convert users to contacts format
    const contacts: Contact[] = users
        .filter((user) => user.uid !== currentUserId)
        .map((user) => ({
            id: user.uid,
            name: user.displayName || "Unknown",
            lastSeen: user.isOnline
                ? "online"
                : user.lastSeen
                    ? formatLastSeen(user.lastSeen)
                    : "last seen a long time ago",
            photoURL: user.photoURL,
            avatarColor: getAvatarColor(user.uid),
        }));

    // Filter contacts based on search
    const filteredContacts = contacts.filter((contact) =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getInitials = (name: string): string => {
        const words = name.trim().split(/\s+/);
        if (words.length >= 2) {
            return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
        }
        return name.charAt(0).toUpperCase();
    };

    const toggleUserSelection = (userId: string) => {
        setSelectedUsers((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    const handleNext = () => {
        if (selectedUsers.length === 0) return;
        navigation.navigate("CreateGroup" as never, { selectedUsers } as never);
    };

    const renderSelectedUser = (userId: string) => {
        const user = contacts.find((c) => c.id === userId);
        if (!user) return null;

        return (
            <View key={userId} style={styles.selectedUserChip}>
                {user.photoURL ? (
                    <Image source={{ uri: user.photoURL }} style={styles.selectedUserAvatar} />
                ) : (
                    <View
                        style={[
                            styles.selectedUserAvatar,
                            { backgroundColor: user.avatarColor },
                        ]}
                    >
                        <Text style={styles.selectedUserAvatarText}>
                            {getInitials(user.name)}
                        </Text>
                    </View>
                )}
                <Text style={styles.selectedUserName} numberOfLines={1}>
                    {user.name.split(" ")[0]}
                </Text>
            </View>
        );
    };

    const renderContact = ({ item }: { item: Contact }) => {
        const isSelected = selectedUsers.includes(item.id);

        return (
            <TouchableOpacity
                style={styles.contactItem}
                onPress={() => toggleUserSelection(item.id)}
                activeOpacity={0.7}
            >
                <View style={styles.contactLeft}>
                    <View style={styles.avatarContainer}>
                        {item.photoURL ? (
                            <Image source={{ uri: item.photoURL }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
                                <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
                            </View>
                        )}
                        {isSelected && (
                            <View style={styles.checkmarkBadge}>
                                <Ionicons name="checkmark" size={16} color="#fff" />
                            </View>
                        )}
                    </View>
                    <View style={styles.contactInfo}>
                        <Text style={styles.contactName}>{item.name}</Text>
                        <Text style={styles.contactLastSeen}>{item.lastSeen}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>New Group</Text>
                    <Text style={styles.headerSubtitle}>
                        {selectedUsers.length > 0
                            ? `${selectedUsers.length} of 200000 selected`
                            : "up to 200000 members"}
                    </Text>
                </View>
            </View>

            {/* Selected Users Horizontal List */}
            {selectedUsers.length > 0 && (
                <View style={styles.selectedUsersContainer}>
                    <FlatList
                        horizontal
                        data={selectedUsers}
                        renderItem={({ item }) => renderSelectedUser(item)}
                        keyExtractor={(item) => item}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.selectedUsersList}
                    />
                </View>
            )}

            {/* Search Input */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Who would you like to add?"
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Contacts List */}
            <FlatList
                data={filteredContacts}
                renderItem={renderContact}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.contactsList}
                showsVerticalScrollIndicator={false}
            />

            {/* Next Button */}
            {selectedUsers.length > 0 && (
                <TouchableOpacity
                    style={styles.nextButton}
                    onPress={handleNext}
                    activeOpacity={0.8}
                >
                    <Ionicons name="arrow-forward" size={28} color="#fff" />
                </TouchableOpacity>
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
        backgroundColor: Colors.primary,
        paddingHorizontal: 16,
        paddingBottom: 16,
        flexDirection: "row",
        alignItems: "center",
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },
    headerTitleContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#fff",
    },
    headerSubtitle: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.8)",
        marginTop: 2,
    },
    selectedUsersContainer: {
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5EA",
        paddingVertical: 12,
    },
    selectedUsersList: {
        paddingHorizontal: 16,
    },
    selectedUserChip: {
        alignItems: "center",
        marginRight: 16,
        width: 70,
    },
    selectedUserAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 4,
    },
    selectedUserAvatarText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#fff",
    },
    selectedUserName: {
        fontSize: 12,
        color: "#000",
        textAlign: "center",
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: "#fff",
    },
    searchInput: {
        fontSize: 16,
        color: "#999",
        paddingVertical: 0,
    },
    contactsList: {
        paddingBottom: 100,
    },
    contactItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fff",
    },
    contactLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    avatarContainer: {
        position: "relative",
        marginRight: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        fontSize: 20,
        fontWeight: "600",
        color: "#fff",
    },
    checkmarkBadge: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#66BB6A",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#fff",
    },
    contactInfo: {
        flex: 1,
    },
    contactName: {
        fontSize: 16,
        fontWeight: "500",
        color: "#000",
        marginBottom: 2,
    },
    contactLastSeen: {
        fontSize: 14,
        color: "#999",
    },
    nextButton: {
        position: "absolute",
        bottom: 30,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary,
        justifyContent: "center",
        alignItems: "center",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
});
