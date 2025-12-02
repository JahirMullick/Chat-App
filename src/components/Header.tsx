import { Ionicons } from "@expo/vector-icons";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface HeaderProps {
    title?: string;
    showSearch?: boolean;
    showDrawerIcon?: boolean;
    onSearchPress?: () => void;
}

export default function Header({
    title = "Chats",
    showSearch = true,
    showDrawerIcon = true,
    onSearchPress,
}: HeaderProps) {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<DrawerNavigationProp<any>>();

    const handleDrawerOpen = () => {
        navigation.openDrawer();
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
            <View style={styles.leftSection}>
                {showDrawerIcon && (
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={handleDrawerOpen}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="menu-outline" size={28} color="#000" />
                    </TouchableOpacity>
                )}
                <Text style={styles.title}>{title}</Text>
            </View>

            {showSearch && (
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={onSearchPress}
                    activeOpacity={0.7}
                >
                    <Ionicons name="search-outline" size={24} color="#000" />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingBottom: 10,
        backgroundColor: "#fff",
    },
    leftSection: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconButton: {
        padding: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#000",
        marginLeft: 8,
    },
});
