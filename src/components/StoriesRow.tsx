import React from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";

export default function StoriesRow({ data }: any) {
    return (
        <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
            data={data}
            renderItem={({ item }) => (
                <View style={styles.storyItem}>
                    <Image source={item.image} style={styles.avatar} />
                    <Text style={styles.label}>{item.label}</Text>
                </View>
            )}
            keyExtractor={(_, i) => i.toString()}
        />
    );
}

const styles = StyleSheet.create({
    container: { paddingHorizontal: 10 },
    storyItem: { alignItems: "center", marginRight: 18 },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: "#1D9BF0",
    },
    label: { marginTop: 6, fontSize: 12, color: "#333" },
});
