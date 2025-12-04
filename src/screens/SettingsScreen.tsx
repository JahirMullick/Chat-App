import { Ionicons } from "@expo/vector-icons";
import auth from "@react-native-firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MainStackParamList } from "../Navigation/types";
import { UserService } from "../services/firestore";
import { UserProfile } from "../types/firestore.types";

type SettingsMenuItem = {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value?: string;
    iconColor?: string;
    onPress?: () => void;
};

type SettingsSection = {
    title?: string;
    items: SettingsMenuItem[];
};

export default function SettingsScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
    const currentUser = auth().currentUser;
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        if (currentUser?.uid) {
            // Subscribe to user profile changes
            const unsubscribe = UserService.subscribeToUser(
                currentUser.uid,
                (profile) => setUserProfile(profile)
            );
            return unsubscribe;
        }
    }, [currentUser?.uid]);

    const getInitials = (): string => {
        if (userProfile?.displayName) {
            return userProfile.displayName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .substring(0, 2);
        }
        if (currentUser?.email) {
            return currentUser.email[0].toUpperCase();
        }
        return "U";
    };

    // Settings sections data
    const settingsSections: SettingsSection[] = [
        {
            title: "Account",
            items: [
                {
                    icon: "call-outline",
                    label: userProfile?.phoneNumber || "~Not Added",
                    value: "Tap to change phone number",
                    onPress: () => console.log("Change phone"),
                },
                {
                    icon: "at",
                    label: `@${userProfile?.displayName?.replace(/\s/g, "") || "username"}`,
                    value: "Username",
                    onPress: () => console.log("Change username"),
                },
                {
                    icon: "information-circle-outline",
                    label: "Bio",
                    value: userProfile?.bio || "Add a few words about yourself",
                    onPress: () => console.log("Edit bio"),
                },
            ],
        },
        {
            title: "Settings",
            items: [
                {
                    icon: "chatbubble-outline",
                    label: "Chat Settings",
                    onPress: () => console.log("Chat Settings"),
                },
                {
                    icon: "lock-closed-outline",
                    label: "Privacy and Security",
                    onPress: () => console.log("Privacy"),
                },
                {
                    icon: "notifications-outline",
                    label: "Notifications and Sounds",
                    onPress: () => console.log("Notifications"),
                },
                {
                    icon: "time-outline",
                    label: "Data and Storage",
                    onPress: () => console.log("Data Storage"),
                },
                {
                    icon: "battery-charging-outline",
                    label: "Power Saving",
                    onPress: () => console.log("Power Saving"),
                },
                {
                    icon: "folder-outline",
                    label: "Chat Folders",
                    onPress: () => console.log("Chat Folders"),
                },
                {
                    icon: "laptop-outline",
                    label: "Devices",
                    onPress: () => console.log("Devices"),
                },
                {
                    icon: "globe-outline",
                    label: "Language",
                    value: "English",
                    onPress: () => console.log("Language"),
                },
            ],
        },
        {
            items: [
                // {
                //     icon: "star-outline",
                //     label: "Premium",
                //     iconColor: "#9C7CF4",
                //     onPress: () => console.log("Premium"),
                // },
                {
                    icon: "star",
                    label: "My Stars",
                    iconColor: "#FFB800",
                    onPress: () => console.log("My Stars"),
                },
                {
                    icon: "briefcase-outline",
                    label: "Business",
                    onPress: () => console.log("Business"),
                },
                {
                    icon: "gift-outline",
                    label: "Send a Gift",
                    onPress: () => console.log("Send Gift"),
                },
            ],
        },
        {
            title: "Help",
            items: [
                {
                    icon: "chatbubbles-outline",
                    label: "Ask a Question",
                    onPress: () => console.log("Ask Question"),
                },
                {
                    icon: "help-circle-outline",
                    label: "FAQ",
                    onPress: () => console.log("FAQ"),
                },
                {
                    icon: "shield-checkmark-outline",
                    label: "Privacy Policy",
                    onPress: () => console.log("Privacy Policy"),
                },
            ],
        },
    ];

    const handleLogout = () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout",
                style: "destructive",
                onPress: async () => {
                    try {
                        await auth().signOut();
                    } catch (error) {
                        Alert.alert("Error", "Failed to logout");
                    }
                },
            },
        ]);
    };

    return (
        <View style={[styles.container]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.headerIcon}>
                        <Ionicons name="qr-code-outline" size={22} color="#fff" />
                    </TouchableOpacity>
                    {/* <TouchableOpacity style={styles.headerIcon}>
                        <Ionicons name="search" size={22} color="#fff" />
                    </TouchableOpacity> */}
                    <TouchableOpacity style={styles.headerIcon}>
                        <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Profile Header */}
            <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                    {userProfile?.photoURL ? (
                        <Image
                            source={{ uri: userProfile.photoURL }}
                            style={styles.avatar}
                        />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Text style={styles.avatarText}>{getInitials()}</Text>
                        </View>
                    )}
                    <TouchableOpacity style={styles.cameraButton}>
                        <Ionicons name="camera-outline" size={20} color="#666" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.profileName}>
                    {userProfile?.displayName || currentUser?.displayName || "User"}
                </Text>
                <Text style={styles.profileStatus}>
                    {userProfile?.isOnline ? "online" : "offline"}
                </Text>
            </View>

            {/* Settings List */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
                showsVerticalScrollIndicator={false}
            >
                {settingsSections.map((section, sectionIndex) => (
                    <View key={sectionIndex} style={styles.section}>
                        {section.title && (
                            <Text style={styles.sectionTitle}>{section.title}</Text>
                        )}
                        <View style={styles.sectionContent}>
                            {section.items.map((item, itemIndex) => (
                                <TouchableOpacity
                                    key={itemIndex}
                                    style={[
                                        styles.menuItem,
                                        itemIndex < section.items.length - 1 && styles.menuItemBorder,
                                    ]}
                                    onPress={item.onPress}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons
                                        name={item.icon}
                                        size={24}
                                        color={item.iconColor || "#8E8E93"}
                                        style={styles.menuIcon}
                                    />
                                    <View style={styles.menuTextContainer}>
                                        <Text style={styles.menuLabel}>{item.label}</Text>
                                        {item.value && (
                                            <Text style={styles.menuValue}>{item.value}</Text>
                                        )}
                                    </View>
                                    {item.value && section.title !== "Account" && (
                                        <Text style={styles.menuRightValue}>{item.value}</Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F2F2F7",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#2196F3",
        paddingHorizontal: 8,
        paddingTop: 40,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    headerRight: {
        flexDirection: "row",
        alignItems: "center",
    },
    headerIcon: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    profileHeader: {
        backgroundColor: "#2196F3",
        alignItems: "center",
        paddingBottom: 24,
        paddingTop: 8,
    },
    avatarContainer: {
        position: "relative",
        marginBottom: 12,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarPlaceholder: {
        backgroundColor: "#64B5F6",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        fontSize: 36,
        fontWeight: "600",
        color: "#fff",
    },
    cameraButton: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    profileName: {
        fontSize: 22,
        fontWeight: "600",
        color: "#fff",
        marginBottom: 4,
    },
    profileStatus: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.8)",
    },
    scrollView: {
        flex: 1,
    },
    section: {
        marginTop: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#2196F3",
        paddingHorizontal: 16,
        marginBottom: 8,
        textTransform: "uppercase",
    },
    sectionContent: {
        backgroundColor: "#fff",
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    menuItemBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#E5E5EA",
    },
    menuIcon: {
        marginRight: 16,
        width: 28,
        textAlign: "center",
    },
    menuTextContainer: {
        flex: 1,
    },
    menuLabel: {
        fontSize: 16,
        color: "#000",
    },
    menuValue: {
        fontSize: 13,
        color: "#8E8E93",
        marginTop: 2,
    },
    menuRightValue: {
        fontSize: 16,
        color: "#2196F3",
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        marginTop: 16,
        marginHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FF3B30",
        marginLeft: 8,
    },
});
