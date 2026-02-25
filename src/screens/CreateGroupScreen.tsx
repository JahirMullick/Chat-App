import { Ionicons } from "@expo/vector-icons";
import { CommonActions, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
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
import { ChatService } from "../services/firestore";

export default function CreateGroupScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
    const route = useRoute();
    const { selectedUsers } = (route.params as any) || { selectedUsers: [] };
    const currentUserId = useCurrentUserId();
    const { users } = useUsers();
    const [groupName, setGroupName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    // Get selected user details
    const selectedMembers = users.filter((user) =>
        selectedUsers.includes(user.uid)
    );

    const getAvatarColor = (userId: string): string => {
        const colors = [
            "#9C7CF4",
            "#FF9800",
            "#E53935",
            "#66BB6A",
            "#42A5F5",
        ];
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            hash = userId.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const getInitials = (name: string): string => {
        const words = name.trim().split(/\s+/);
        if (words.length >= 2) {
            return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
        }
        return name.charAt(0).toUpperCase();
    };

    const formatLastSeen = (user: any): string => {
        if (user.isOnline) return "online";
        if (!user.lastSeen) return "last seen a long time ago";
        const date = user.lastSeen.toDate ? user.lastSeen.toDate() : new Date(user.lastSeen);
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

    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            Alert.alert("Group Name Required", "Please enter a group name");
            return;
        }

        if (!currentUserId) {
            Alert.alert("Error", "You must be logged in to create a group");
            return;
        }

        if (selectedUsers.length === 0) {
            Alert.alert("Error", "Please select at least one member");
            return;
        }

        setIsCreating(true);

        try {
            // Generate random avatar color for the group
            const colors = ["#9C7CF4", "#FF9800", "#E53935", "#66BB6A", "#42A5F5"];
            const avatarColor = colors[Math.floor(Math.random() * colors.length)];

            // Create group chat in database
            const chatId = await ChatService.createGroupChat(
                currentUserId,
                selectedUsers,
                groupName.trim(),
                {
                    avatarColor: avatarColor,
                    category: "groups",
                }
            );

            console.log("Group created successfully with ID:", chatId);

            // Navigate to the new group chat and reset navigation stack
            // This ensures pressing back from Chat goes to Home, not CreateGroup
            navigation.dispatch(
                CommonActions.reset({
                    index: 1,
                    routes: [
                        { name: 'Home' },
                        {
                            name: 'Chat',
                            params: {
                                chatId: chatId,
                                name: groupName,
                                avatarColor: avatarColor,
                            },
                        },
                    ],
                })
            );
        } catch (error) {
            console.error("Error creating group:", error);
            Alert.alert("Error", "Failed to create group. Please try again.");
        } finally {
            setIsCreating(false);
        }
    };

    const renderMember = ({ item }: { item: any }) => {
        return (
            <View style={styles.memberItem}>
                {item.photoURL ? (
                    <Image source={{ uri: item.photoURL }} style={styles.memberAvatar} />
                ) : (
                    <View
                        style={[
                            styles.memberAvatar,
                            { backgroundColor: getAvatarColor(item.uid) },
                        ]}
                    >
                        <Text style={styles.memberAvatarText}>
                            {getInitials(item.displayName || "U")}
                        </Text>
                    </View>
                )}
                <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{item.displayName || "Unknown"}</Text>
                    <Text style={styles.memberStatus}>{formatLastSeen(item)}</Text>
                </View>
            </View>
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
                <Text style={styles.headerTitle}>New Group</Text>
            </View>

            {/* Group Info Section */}
            <View style={styles.groupInfoSection}>
                <TouchableOpacity style={styles.groupAvatarContainer}>
                    <View style={styles.groupAvatar}>
                        <Ionicons name="camera-outline" size={28} color="#fff" />
                    </View>
                </TouchableOpacity>

                <View style={styles.groupNameContainer}>
                    <TextInput
                        style={styles.groupNameInput}
                        placeholder="Group name"
                        placeholderTextColor="#999"
                        value={groupName}
                        onChangeText={setGroupName}
                        autoFocus
                    />
                    <TouchableOpacity>
                        <Ionicons name="happy-outline" size={24} color="#999" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Auto-Delete Section */}
            <View style={styles.autoDeleteSection}>
                <View style={styles.autoDeleteLeft}>
                    <Ionicons name="timer-outline" size={24} color="#999" />
                    <Text style={styles.autoDeleteText}>Auto-Delete Messages</Text>
                </View>
                <Text style={styles.autoDeleteValue}>Off</Text>
            </View>
            <Text style={styles.autoDeleteDescription}>
                Automatically delete messages in this group for everyone after a period of time.
            </Text>

            {/* Members Section */}
            <View style={styles.membersHeader}>
                <Text style={styles.membersCount}>
                    {selectedMembers.length} member{selectedMembers.length !== 1 ? "s" : ""}
                </Text>
            </View>

            <FlatList
                data={selectedMembers}
                renderItem={renderMember}
                keyExtractor={(item) => item.uid}
                contentContainerStyle={styles.membersList}
                showsVerticalScrollIndicator={false}
            />

            {/* Create Button */}
            <TouchableOpacity
                style={[styles.createButton, isCreating && styles.createButtonDisabled]}
                onPress={handleCreateGroup}
                activeOpacity={0.8}
                disabled={isCreating}
            >
                {isCreating ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Ionicons name="checkmark" size={28} color="#fff" />
                )}
            </TouchableOpacity>
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
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#fff",
    },
    groupInfoSection: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5EA",
    },
    groupAvatarContainer: {
        marginRight: 16,
    },
    groupAvatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: Colors.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    groupNameContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 2,
        borderBottomColor: Colors.primary,
        paddingBottom: 8,
    },
    groupNameInput: {
        flex: 1,
        fontSize: 18,
        color: "#000",
        padding: 0,
    },
    autoDeleteSection: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: "#F5F5F5",
    },
    autoDeleteLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    autoDeleteText: {
        fontSize: 16,
        color: "#000",
        marginLeft: 12,
    },
    autoDeleteValue: {
        fontSize: 16,
        color: Colors.primary,
    },
    autoDeleteDescription: {
        fontSize: 14,
        color: "#999",
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 16,
        backgroundColor: "#F5F5F5",
    },
    membersHeader: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fff",
    },
    membersCount: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.primary,
    },
    membersList: {
        paddingBottom: 100,
    },
    memberItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fff",
    },
    memberAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    memberAvatarText: {
        fontSize: 20,
        fontWeight: "600",
        color: "#fff",
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: 16,
        fontWeight: "500",
        color: "#000",
        marginBottom: 2,
    },
    memberStatus: {
        fontSize: 14,
        color: "#999",
    },
    createButton: {
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
    createButtonDisabled: {
        backgroundColor: "#999",
        opacity: 0.6,
    },
});
