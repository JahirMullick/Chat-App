import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabItem = {
    name: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    activeIcon: keyof typeof Ionicons.glyphMap;
    badge?: number;
};

const tabs: TabItem[] = [
    {
        name: "chats",
        label: "Chats",
        icon: "chatbubbles-outline",
        activeIcon: "chatbubbles",
        badge: 3,
    },
    {
        name: "contacts",
        label: "Contacts",
        icon: "people-outline",
        activeIcon: "people",
    },
    {
        name: "settings",
        label: "Settings",
        icon: "settings-outline",
        activeIcon: "settings",
    },
    // {
    //     name: "premium",
    //     label: "Premium",
    //     icon: "star-outline",
    //     activeIcon: "star",
    // },
];

interface TabNavigationProps {
    activeTab?: string;
    onTabPress?: (tabName: string) => void;
}

const TabNavigation = ({ activeTab = "chats", onTabPress }: TabNavigationProps) => {
    const [currentTab, setCurrentTab] = useState(activeTab);
    const insets = useSafeAreaInsets();

    const handleTabPress = (tabName: string) => {
        setCurrentTab(tabName);
        onTabPress?.(tabName);
    };

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom > 0 ? insets.bottom : 10 }]}>
            {tabs.map((tab) => {
                const isActive = currentTab === tab.name;
                return (
                    <TouchableOpacity
                        key={tab.name}
                        style={styles.tabItem}
                        onPress={() => handleTabPress(tab.name)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.iconContainer}>
                            <Ionicons
                                name={isActive ? tab.activeIcon : tab.icon}
                                size={26}
                                color={isActive ? "#007AFF" : "#8E8E93"}
                            />
                            {tab.badge !== undefined && tab.badge > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{tab.badge}</Text>
                                </View>
                            )}
                        </View>
                        <Text style={[styles.tabLabel, isActive && styles.activeLabel]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

export default TabNavigation;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        backgroundColor: "#F8F8F8",
        borderTopWidth: 0.5,
        borderTopColor: "#E5E5EA",
        paddingTop: 8,
    },
    tabItem: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    iconContainer: {
        position: "relative",
    },
    badge: {
        position: "absolute",
        top: -4,
        right: -10,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: "#FF3B30",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 4,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#fff",
    },
    tabLabel: {
        fontSize: 10,
        marginTop: 2,
        color: "#8E8E93",
        fontWeight: "500",
    },
    activeLabel: {
        color: "#007AFF",
    },
});
