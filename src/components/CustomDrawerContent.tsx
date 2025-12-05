import { Ionicons } from "@expo/vector-icons";
import auth from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import {
    DrawerContentComponentProps,
    DrawerContentScrollView,
} from "@react-navigation/drawer";
import React from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
    const currentUser = auth().currentUser;

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
                        await auth().signOut();

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
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {currentUser?.displayName?.charAt(0) ||
                            currentUser?.email?.charAt(0)?.toUpperCase() ||
                            "U"}
                    </Text>
                </View>
                <Text style={styles.userName}>
                    {currentUser?.displayName || "User"}
                </Text>
                <Text style={styles.userEmail}>
                    {currentUser?.email || ""}
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
                            } else {
                                console.log("Navigate to:", item.route);
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
    },
    avatarText: {
        fontSize: 28,
        fontWeight: "600",
        color: "#fff",
    },
    userName: {
        fontSize: 20,
        fontWeight: "600",
        color: "#000",
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: "#8E8E93",
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
        paddingHorizontal: 16,
    },
    logoutText: {
        fontSize: 16,
        color: "#FF3B30",
        marginLeft: 16,
        fontWeight: "500",
    },
});
