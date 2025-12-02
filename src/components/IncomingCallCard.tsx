import React from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
    type?: "single" | "group";
    name?: string;
    avatar?: string;
    groupAvatars?: string[];
    subtitle?: string;
    onAccept?: () => void;
    onReject?: () => void;
    onOpenSheet?: () => void;
}

export const IncomingCallCard = ({
    type = "single",
    name = "Unknown",
    avatar,
    groupAvatars = [],
    subtitle = "Telegram voice call",
    onAccept,
    onReject,
    onOpenSheet,
}: Props) => {
    return (
        <View style={styles.container}>
            {/* Avatar Section */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                {type === "single" ? (
                    <Image source={{ uri: avatar }} style={styles.avatar} />
                ) : (
                    <FlatList
                        data={groupAvatars}
                        horizontal
                        scrollEnabled={false}
                        renderItem={({ item }) => (
                            <Image source={{ uri: item }} style={styles.groupAvatar} />
                        )}
                    />
                )}

                {/* Name + Call type */}
                <View style={{ marginLeft: 12 }}>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>
                </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttons}>
                <TouchableOpacity style={styles.rejectBtn} onPress={onReject}>
                    <Text style={styles.icon}>📵</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.acceptBtn} onPress={onAccept}>
                    <Text style={styles.icon}>📞</Text>
                </TouchableOpacity>
            </View>

            {/* Swipe-up pill */}
            <TouchableOpacity style={styles.swipePill} onPress={onOpenSheet} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 30,
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 22,
        marginHorizontal: 18,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        elevation: 5,
    },
    avatar: {
        width: 68,
        height: 68,
        borderRadius: 50,
    },
    groupAvatar: {
        width: 45,
        height: 45,
        borderRadius: 40,
        marginRight: -12,
    },
    name: {
        fontSize: 20,
        fontWeight: "700",
        color: "#000",
    },
    subtitle: {
        fontSize: 16,
        opacity: 0.6,
        marginTop: 2,
    },
    buttons: {
        flexDirection: "row",
        gap: 16,
        alignItems: "center",
    },
    rejectBtn: {
        width: 68,
        height: 68,
        borderRadius: 50,
        backgroundColor: "#E53935",
        alignItems: "center",
        justifyContent: "center",
    },
    acceptBtn: {
        width: 68,
        height: 68,
        borderRadius: 50,
        backgroundColor: "#4CAF50",
        alignItems: "center",
        justifyContent: "center",
    },
    icon: { fontSize: 28, color: "white" },
    swipePill: {
        position: "absolute",
        bottom: -16,
        left: "48%",
        width: 65,
        height: 6,
        backgroundColor: "#ccc",
        borderRadius: 20,
    },
});
