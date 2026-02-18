import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import Colors from "../constants/colors";

export default function CallsScreen() {
    const navigation = useNavigation<any>();
    const [calls, setCalls] = useState<any[]>([]); // Empty initially to show empty state

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.iconContainer}>
                <Ionicons name="call-outline" size={80} color={Colors.gray300} />
            </View>
            <Text style={styles.emptyTitle}>No Recent Calls</Text>
            <Text style={styles.emptySubtitle}>
                Start a new call from your contacts to see it here.
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <Header
                title="Calls"
                showSearch={false}
                showBackButton={true}
                onBackPress={() => navigation.navigate("Home")}
            />
            {calls.length === 0 ? (
                renderEmptyState()
            ) : (
                <FlatList
                    data={calls}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => <Text>Call Log Item</Text>}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
        marginTop: -50,
    },
    iconContainer: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: Colors.gray100,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: Colors.black,
        marginBottom: 12,
        textAlign: "center",
    },
    emptySubtitle: {
        fontSize: 16,
        color: Colors.gray400,
        textAlign: "center",
        lineHeight: 24,
    },
});
