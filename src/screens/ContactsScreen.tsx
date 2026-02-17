import { Ionicons } from "@expo/vector-icons";
import { getAuth } from "@react-native-firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Header from "../components/Header";
import Colors from "../constants/colors";
import { MainStackParamList } from "../Navigation/types";
import { UserService } from "../services/firestore/userService";
import { UserProfile } from "../types/firestore.types";

export default function ContactsScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const auth = getAuth();
    const currentUser = auth.currentUser;

    useEffect(() => {
        loadContacts();
    }, []);

    const loadContacts = async () => {
        setIsLoading(true);
        try {
            // In a real app, this might fetch friends/contacts. 
            // For now, we fetch all users except current user.
            const allUsers = await UserService.searchUsersByEmail("", currentUser?.uid);
            setUsers(allUsers);
            setFilteredUsers(allUsers);
        } catch (error) {
            console.error("Error loading contacts:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (text.trim() === "") {
            setFilteredUsers(users);
        } else {
            const query = text.toLowerCase();
            const filtered = users.filter(
                (user) =>
                    (user.displayName && user.displayName.toLowerCase().includes(query)) ||
                    (user.email && user.email.toLowerCase().includes(query))
            );
            setFilteredUsers(filtered);
        }
    };

    const handleUserPress = (user: UserProfile) => {
        // Navigate to chat with selected user
        navigation.navigate("Chat", {
            recipientId: user.uid,
            name: user.displayName || "User",
            avatar: user.photoURL || undefined,
            avatarColor: Colors.primary, // You might want a better color generation strategy
        });
    };

    const renderItem = ({ item }: { item: UserProfile }) => (
        <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleUserPress(item)}
            activeOpacity={0.7}
        >
            <View style={styles.avatarContainer}>
                {item.photoURL ? (
                    <Image source={{ uri: item.photoURL }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: Colors.primary }]}>
                        <Text style={styles.avatarText}>
                            {item.displayName?.charAt(0).toUpperCase() || "?"}
                        </Text>
                    </View>
                )}
                {item.isOnline && <View style={styles.onlineBadge} />}
            </View>
            <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{item.displayName || "Unknown User"}</Text>
                <Text style={styles.contactStatus} numberOfLines={1}>
                    {item.email || ""}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
            <Header
                title="Contacts"
                showBack={true}
                onBackPress={() => navigation.goBack()}
            />

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#666" style={{ marginRight: 8 }} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search contacts..."
                        value={searchQuery}
                        onChangeText={handleSearch}
                        placeholderTextColor="#999"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => handleSearch("")}>
                            <Ionicons name="close-circle" size={20} color="#666" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredUsers}
                    keyExtractor={(item) => item.uid}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No contacts found</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    searchContainer: {
        padding: 10,
        backgroundColor: "#f0f0f0",
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 40,
    },
    searchInput: {
        flex: 1,
        height: 40,
        color: "#000",
    },
    listContent: {
        paddingBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    contactItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    avatarContainer: {
        position: "relative",
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
    },
    onlineBadge: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: "#4CAF50",
        borderWidth: 2,
        borderColor: "#fff",
    },
    contactInfo: {
        flex: 1,
        marginLeft: 15,
    },
    contactName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
    },
    contactStatus: {
        fontSize: 14,
        color: "#666",
        marginTop: 2,
    },
    emptyContainer: {
        padding: 40,
        alignItems: "center",
    },
    emptyText: {
        color: "#666",
        fontSize: 16,
    },
});
