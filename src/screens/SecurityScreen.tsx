import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../constants/colors";
import { MainStackParamList } from "../Navigation/types";
import { SecurityStorage } from "../utils/storage";

export default function SecurityScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
    const [isPasscodeEnabled, setIsPasscodeEnabled] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const checkPasscode = async () => {
                const passcode = await SecurityStorage.getPasscode();
                setIsPasscodeEnabled(!!passcode);
            };
            checkPasscode();
        }, [])
    );

    const handlePasscodePress = () => {
        if (isPasscodeEnabled) {
            // Verify passcode before opening settings
            navigation.navigate("Passcode", {
                mode: "verify",
                onSuccess: () => navigation.replace("PasscodeSettings"),
            });
        } else {
            // Create new passcode
            navigation.navigate("Passcode", { mode: "create" });
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Security</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content}>
                <Text style={styles.sectionHeader}>APP SECURITY</Text>
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={handlePasscodePress}
                    >
                        <View style={styles.menuItemLeft}>
                            <Ionicons name="lock-closed-outline" size={24} color={Colors.black} />
                            <Text style={styles.menuItemText}>Passcode Lock</Text>
                        </View>
                        <View style={styles.menuItemRight}>
                            <Text style={styles.statusText}>{isPasscodeEnabled ? "On" : "Off"}</Text>
                            <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: Colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: 50, // Adjust for status bar
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.white,
    },
    content: {
        paddingTop: 20,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: "600",
        color: Colors.gray500,
        marginLeft: 16,
        marginBottom: 8,
        textTransform: "uppercase",
    },
    section: {
        backgroundColor: Colors.white,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.border,
    },
    menuItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    menuItemLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    menuItemText: {
        fontSize: 16,
        color: Colors.black,
    },
    menuItemRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    statusText: {
        fontSize: 16,
        color: Colors.primary,
    },
});
