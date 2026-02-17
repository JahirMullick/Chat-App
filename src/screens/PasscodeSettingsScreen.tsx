import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { Colors } from "../constants/colors";
import { MainStackParamList } from "../Navigation/types";
import { SecurityStorage } from "../utils/storage";

export default function PasscodeSettingsScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

    // State for settings
    const [isFingerprintEnabled, setIsFingerprintEnabled] = useState(false);
    const [autoLock, setAutoLock] = useState("in 1 minute");
    const [showInTaskSwitcher, setShowInTaskSwitcher] = useState(true);

    // Load initial settings
    useEffect(() => {
        setIsFingerprintEnabled(SecurityStorage.getEnableFingerprint());
        setAutoLock(SecurityStorage.getAutoLock());
        setShowInTaskSwitcher(SecurityStorage.getShowInTaskSwitcher());
    }, []);

    // Handlers
    const toggleFingerprint = (value: boolean) => {
        setIsFingerprintEnabled(value);
        SecurityStorage.setEnableFingerprint(value);
    };

    const toggleShowInTaskSwitcher = (value: boolean) => {
        setShowInTaskSwitcher(value);
        SecurityStorage.setShowInTaskSwitcher(value);
    };

    const handleAutoLockPress = () => {
        // Simple cycle for now or show options
        const options = ["immediately", "in 1 minute", "in 5 minutes", "in 1 hour", "in 5 hours"];
        const currentIndex = options.indexOf(autoLock);
        const nextIndex = (currentIndex + 1) % options.length;
        const nextValue = options[nextIndex];

        setAutoLock(nextValue);
        SecurityStorage.setAutoLock(nextValue);
    };

    const handleChangePasscode = async () => {
        // First verify old passcode, then create new one.
        // LockScreen component logic is a bit complex, it handles creation if "app_pin" is missing.
        // To "Change", we should:
        // 1. Verify current PIN (Unlock)
        // 2. Clear current PIN (so LockScreen goes into creation mode)
        // 3. Show LockScreen again (to Set new PIN)

        navigation.navigate("Passcode", {
            mode: "verify",
            onSuccess: async () => {
                // Pin Verified. Now clear it to trigger "Create" mode
                await SecureStore.deleteItemAsync("app_pin");
                // Navigate to Create mode
                navigation.replace("Passcode", {
                    mode: "create",
                    onSuccess: async () => {
                        await SecureStore.setItemAsync("lock_enabled", "true");
                        navigation.goBack();
                    }
                });
            }
        });
    };

    const handleTurnPasscodeOff = () => {
        Alert.alert(
            "Turn Passcode Off",
            "Are you sure you want to disable passcode lock?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Turn Off",
                    style: "destructive",
                    onPress: () => {
                        // Verify before disabling
                        navigation.navigate("Passcode", {
                            mode: "verify", // Verify first
                            onSuccess: async () => {
                                // After successful verification, disable lock
                                await SecureStore.deleteItemAsync("app_pin");
                                await SecureStore.setItemAsync("lock_enabled", "false");
                                // After successful disable, go back to Security screen
                                navigation.pop(2); // Pop PasscodeSettings and Passcode(verify) screens
                            }
                        });
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Passcode Lock</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Illustration */}
                <View style={styles.illustrationContainer}>
                    <View style={styles.passcodeIcons}>
                        <View style={styles.passcodeIconBox}><Ionicons name="medical" size={12} color={Colors.primary} /></View>
                        <View style={styles.passcodeIconBox}><Ionicons name="medical" size={12} color={Colors.primary} /></View>
                        <View style={styles.passcodeIconBox}><Ionicons name="medical" size={12} color={Colors.primary} /></View>
                        <View style={styles.passcodeIconBox}><Ionicons name="medical" size={12} color={Colors.primary} /></View>
                    </View>
                    {/* Using a placeholder for the duck illustration, maybe an icon for now */}
                    <Ionicons name="lock-closed" size={80} color={Colors.primary} style={{ marginTop: 10 }} />

                    <Text style={styles.instructionText}>
                        Tap the lock icon above your chat list to lock the app.
                    </Text>
                </View>

                {/* Settings Block 1 */}
                <View style={styles.settingsGroup}>
                    <TouchableOpacity style={styles.settingItem} onPress={handleChangePasscode}>
                        <Text style={styles.settingLabel}>Change Passcode</Text>
                    </TouchableOpacity>

                    <View style={styles.settingItem}>
                        <Text style={styles.settingLabel}>Unlock with Fingerprint</Text>
                        <Switch
                            value={isFingerprintEnabled}
                            onValueChange={toggleFingerprint}
                            trackColor={{ false: "#767577", true: Colors.primaryLight }}
                            thumbColor={isFingerprintEnabled ? Colors.primary : "#f4f3f4"}
                        />
                    </View>

                    <TouchableOpacity style={[styles.settingItem, styles.lastItem]} onPress={handleAutoLockPress}>
                        <Text style={styles.settingLabel}>Auto-lock</Text>
                        <View style={styles.settingRight}>
                            <Text style={styles.settingValue}>{autoLock}</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <Text style={styles.groupFooter}>
                    Require passcode if away for some time.
                </Text>

                {/* Settings Block 2 */}
                <View style={styles.sectionHeaderContainer}>
                    <Text style={styles.sectionHeader}>App Content in Task Switcher</Text>
                </View>
                <View style={styles.settingsGroup}>
                    <View style={[styles.settingItem, styles.lastItem]}>
                        <Text style={styles.settingLabel}>Show Content</Text>
                        <Switch
                            value={showInTaskSwitcher}
                            onValueChange={toggleShowInTaskSwitcher}
                            trackColor={{ false: "#767577", true: Colors.primaryLight }}
                            thumbColor={showInTaskSwitcher ? Colors.primary : "#f4f3f4"}
                        />
                    </View>
                </View>

                <Text style={styles.groupFooter}>
                    If disabled, chat content will be hidden in the task switcher but you won't be able to take screenshots in the app.
                </Text>

                {/* Turn Off Button */}
                <TouchableOpacity style={styles.turnOffButton} onPress={handleTurnPasscodeOff}>
                    <Text style={styles.turnOffText}>Turn Passcode Off</Text>
                </TouchableOpacity>

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
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 15,
        backgroundColor: Colors.background, // Match screen background
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: Colors.black,
    },
    content: {
        paddingBottom: 40,
    },
    illustrationContainer: {
        alignItems: "center",
        paddingVertical: 30,
        marginBottom: 20,
    },
    passcodeIcons: {
        flexDirection: "row",
        marginBottom: 10,
        backgroundColor: Colors.white,
        padding: 5,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: Colors.primary,
        gap: 5,
    },
    passcodeIconBox: {
        width: 20,
        height: 20,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: Colors.primary,
        borderRadius: 2,
    },
    instructionText: {
        fontSize: 14,
        color: Colors.gray500,
        textAlign: "center",
        marginTop: 20,
        paddingHorizontal: 40,
    },
    settingsGroup: {
        backgroundColor: Colors.white,
        marginHorizontal: 16,
        borderRadius: 12,
        overflow: "hidden",
    },
    settingItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.border,
    },
    lastItem: {
        borderBottomWidth: 0,
    },
    settingLabel: {
        fontSize: 16,
        color: Colors.black,
    },
    settingRight: {
        flexDirection: "row",
        alignItems: "center",
    },
    settingValue: {
        fontSize: 16,
        color: Colors.primary,
    },
    groupFooter: {
        fontSize: 13,
        color: Colors.gray500,
        marginHorizontal: 32,
        marginTop: 8,
        marginBottom: 20,
    },
    sectionHeaderContainer: {
        marginHorizontal: 32,
        marginTop: 10,
        marginBottom: 8,
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.primary,
    },
    turnOffButton: {
        backgroundColor: Colors.white,
        marginHorizontal: 16,
        marginTop: 10,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    turnOffText: {
        fontSize: 16,
        color: "#FF3B30", // Red color
        fontWeight: "500",
    },
});
