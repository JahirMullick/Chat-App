import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const tabs = [
    { label: "All" },
    { label: "Groups", count: 10 },
    { label: "Channels", count: 3 },
    { label: "Bots", count: 2 },
];

export default function ScreenWrapper({ title, children }: any) {
    return (
        <View style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <Ionicons name="search-outline" size={26} color="#000" />
            </View>

            {/* Tabs */}
            <View style={styles.tabsRow}>
                {tabs.map((item, index) => (
                    <View key={index} style={styles.tabBtn}>
                        <Text style={styles.tabText}>
                            {item.label} {item.count ? `(${item.count})` : ""}
                        </Text>
                    </View>
                ))}
            </View>

            {children}

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },

    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    title: { fontSize: 32, fontWeight: "700" },

    tabsRow: {
        flexDirection: "row",
        paddingHorizontal: 14,
        marginBottom: 10,
    },

    tabBtn: { marginRight: 20 },
    tabText: { fontSize: 16, color: "#555", fontWeight: "500" },
});
