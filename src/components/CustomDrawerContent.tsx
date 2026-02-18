import { Ionicons } from "@expo/vector-icons";
import { getAuth } from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import {
    DrawerContentComponentProps,
    DrawerContentScrollView,
} from "@react-navigation/drawer";
import React from "react";
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "../constants/colors";
import { useCurrentUserId, useUserProfile } from "../Hooks/useFirestore";
import { SessionStorage } from "../utils/storage";

const menuItems = [
    { icon: "person-outline", label: "My Profile", route: "Profile" },
    { icon: "people-outline", label: "Contacts", route: "Contacts" },
    { icon: "call-outline", label: "Calls", route: "Calls" },
    { icon: "bookmark-outline", label: "Saved Messages", route: "Saved" },
    { icon: "settings-outline", label: "Settings", route: "Settings" },
    { icon: "help-circle-outline", label: "Help & FAQ", route: "Help" },
    { icon: "flask-outline", label: "Test Custom Components", route: "Test" },
];

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
    const insets = useSafeAreaInsets();
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const currentUserId = useCurrentUserId();
    const { profile: userProfile } = useUserProfile(currentUserId || undefined);

    console.log("CustomDrawer - Auth photoURL:", currentUser?.photoURL);
    console.log("CustomDrawer - Firestore photoURL:", userProfile?.photoURL);

    const handleLogout = async () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout",
                style: "destructive",
                onPress: async () => {
                    try {
                        // Clear MMKV session
                        SessionStorage.clearSession();

                        // Sign out from Firebase
                        await auth.signOut();

                        // Sign out from Google if signed in
                        try {
                            await GoogleSignin.signOut();
                        } catch (e) {
                            // User might not be signed in with Google
                        }
                    } catch (error) {
                        Alert.alert("Error", "Failed to logout");
                    }
                },
            },
        ]);
    };

    return (
        <DrawerContentScrollView
            {...props}
            contentContainerStyle={[styles.container, { paddingTop: insets.top }]}
        >
            {/* User Profile Section */}
            <View style={styles.profileSection}>
                {userProfile?.photoURL ? (
                    <Image
                        source={{ uri: userProfile.photoURL }}
                        style={styles.avatarImage}
                        resizeMode="cover"
                        onError={(error) => console.log("Image load error:", error)}
                    />
                ) : (
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {userProfile?.displayName?.charAt(0) ||
                                currentUser?.displayName?.charAt(0) ||
                                currentUser?.email?.charAt(0)?.toUpperCase() ||
                                "U"}
                        </Text>
                    </View>
                )}
                <Text style={styles.userName}>
                    {userProfile?.displayName || currentUser?.displayName || "User"}
                </Text>
                <Text style={styles.userEmail}>
                    {userProfile?.email || currentUser?.email || ""}
                </Text>
            </View>

            {/* Menu Items */}
            <View style={styles.menuSection}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.menuItem}
                        onPress={() => {
                            if (item.route === "Test") {
                                props.navigation.getParent()?.navigate("Test");
                            } else if (item.route === "Settings") {
                                props.navigation.getParent()?.navigate("Settings");
                            } else if (item.route === "Profile") {
                                props.navigation.getParent()?.navigate("Settings");
                            } else if (item.route === "Contacts") {
                                // Navigate to Contacts screen
                                props.navigation.getParent()?.navigate("Contacts");
                            } else if (item.route === "Calls") {
                                props.navigation.getParent()?.navigate("Calls");
                            } else if (item.route === "Saved") {
                                // Close drawer first
                                props.navigation.closeDrawer();
                                // Navigate to Chat screen for Saved Messages
                                props.navigation.getParent()?.navigate("Chat", {
                                    chatId: "saved_messages",
                                    name: "Saved Messages (Me)",
                                    recipientId: currentUserId,
                                    avatarColor: Colors.iosBlue,
                                });
                            } else {
                                console.log("Navigate to:", item.route);
                            }

                            // Close drawer after navigation
                            if (item.route !== "Saved") {
                                setTimeout(() => {
                                    props.navigation.closeDrawer();
                                }, 100);
                            }
                        }}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={item.icon as any}
                            size={24}
                            color="#555"
                        />
                        <Text style={styles.menuLabel}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Logout Button */}
            <View style={styles.bottomSection}>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    activeOpacity={0.7}
                >
                    <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </DrawerContentScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    profileSection: {
        padding: 20,
        backgroundColor: Colors.primary,
        // alignItems: "center",
        justifyContent: "center",
        borderStartEndRadius: 20,
        borderStartStartRadius: 20,
        borderEndEndRadius: 20,
        borderEndStartRadius: 17,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5EA",
        marginBottom: 10,
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "#007AFF",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
        overflow: "hidden",
    },
    avatarImage: {
        width: 70,
        height: 70,
        borderRadius: 35,
        marginBottom: 12,
    },
    avatarText: {
        fontSize: 28,
        fontWeight: "600",
        color: "#fff",
    },
    userName: {
        fontSize: 20,
        fontWeight: "600",
        color: "#fff",
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.8)",
    },
    menuSection: {
        flex: 1,
        // paddingHorizontal: 10,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 10,
    },
    menuLabel: {
        fontSize: 16,
        color: "#000",
        marginLeft: 16,
        fontWeight: "500",
    },
    bottomSection: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: "#E5E5EA",
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        // paddingHorizontal: 16,
    },
    logoutText: {
        fontSize: 16,
        color: "#FF3B30",
        marginLeft: 16,
        fontWeight: "500",
    },
});
