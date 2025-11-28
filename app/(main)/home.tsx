import { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    StatusBar,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Home() {
    const [user] = useState({
        name: "John Doe",
        email: "john.doe@example.com",
    });

    const menuItems = [
        {
            id: 1,
            title: "Profile",
            icon: "person-outline" as const,
            color: "#007AFF",
        },
        {
            id: 2,
            title: "Settings",
            icon: "settings-outline" as const,
            color: "#34C759",
        },
        {
            id: 3,
            title: "Notifications",
            icon: "notifications-outline" as const,
            color: "#FF9500",
        },
        {
            id: 4,
            title: "Help & Support",
            icon: "help-circle-outline" as const,
            color: "#AF52DE",
        },
    ];

    const quickActions = [
        {
            id: 1,
            title: "Messages",
            icon: "chatbubbles-outline" as const,
            count: 5,
        },
        {
            id: 2,
            title: "Tasks",
            icon: "checkbox-outline" as const,
            count: 3,
        },
        {
            id: 3,
            title: "Calendar",
            icon: "calendar-outline" as const,
            count: 2,
        },
        {
            id: 4,
            title: "Files",
            icon: "folder-outline" as const,
            count: 0,
        },
    ];

    const handleLogout = () => {
        router.replace("/(auth)/login" as any);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.greeting}>Welcome back,</Text>
                        <Text style={styles.userName}>{user.name}</Text>
                    </View>
                    <TouchableOpacity style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {user.name.split(" ").map((n) => n[0]).join("")}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActionsGrid}>
                        {quickActions.map((action) => (
                            <TouchableOpacity key={action.id} style={styles.quickActionCard}>
                                <View style={styles.quickActionIconContainer}>
                                    <Ionicons name={action.icon} size={28} color="#007AFF" />
                                    {action.count > 0 && (
                                        <View style={styles.badge}>
                                            <Text style={styles.badgeText}>{action.count}</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.quickActionTitle}>{action.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Stats Card */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Overview</Text>
                    <View style={styles.statsCard}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>12</Text>
                            <Text style={styles.statLabel}>Active</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>28</Text>
                            <Text style={styles.statLabel}>Completed</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>5</Text>
                            <Text style={styles.statLabel}>Pending</Text>
                        </View>
                    </View>
                </View>

                {/* Menu Items */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Menu</Text>
                    <View style={styles.menuContainer}>
                        {menuItems.map((item) => (
                            <TouchableOpacity key={item.id} style={styles.menuItem}>
                                <View style={[styles.menuIconContainer, { backgroundColor: `${item.color}15` }]}>
                                    <Ionicons name={item.icon} size={22} color={item.color} />
                                </View>
                                <Text style={styles.menuItemText}>{item.title}</Text>
                                <Ionicons name="chevron-forward" size={20} color="#ccc" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <View style={styles.bottomSpace} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    header: {
        backgroundColor: "#fff",
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    headerTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    greeting: {
        fontSize: 14,
        color: "#666",
        marginBottom: 4,
    },
    userName: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1a1a1a",
    },
    avatarContainer: {
        padding: 2,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#007AFF",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1a1a1a",
        marginBottom: 16,
    },
    quickActionsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    quickActionCard: {
        width: "47%",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    quickActionIconContainer: {
        position: "relative",
        marginBottom: 12,
    },
    badge: {
        position: "absolute",
        top: -6,
        right: -10,
        backgroundColor: "#FF3B30",
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 6,
    },
    badgeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
    quickActionTitle: {
        fontSize: 14,
        fontWeight: "500",
        color: "#1a1a1a",
    },
    statsCard: {
        backgroundColor: "#007AFF",
        borderRadius: 16,
        padding: 24,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
    },
    statItem: {
        alignItems: "center",
    },
    statValue: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: "rgba(255,255,255,0.8)",
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: "rgba(255,255,255,0.3)",
    },
    menuContainer: {
        backgroundColor: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    menuItemText: {
        flex: 1,
        fontSize: 16,
        color: "#1a1a1a",
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 32,
        paddingVertical: 16,
        backgroundColor: "#fff",
        borderRadius: 12,
        gap: 8,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FF3B30",
    },
    bottomSpace: {
        height: 40,
    },
});
