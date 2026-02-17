import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as SecureStore from "expo-secure-store";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LockScreen from "../components/LockScreen";
import { Colors } from "../constants/colors";
import { MainStackParamList } from "../Navigation/types";

type PasscodeScreenRouteProp = RouteProp<MainStackParamList, "Passcode">;

export default function PasscodeScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
    const route = useRoute<PasscodeScreenRouteProp>();
    const insets = useSafeAreaInsets();
    const { mode, onSuccess } = route.params || { mode: "verify" };

    const handleUnlock = async () => {
        if (mode === "create") {
            // After creating/setting PIN, we enable lock
            await SecureStore.setItemAsync("lock_enabled", "true");
        } else if (mode === "disable") {
            // After unlocking to disable, we clear PIN and disable lock
            await SecureStore.deleteItemAsync("app_pin");
            await SecureStore.setItemAsync("lock_enabled", "false");
        }

        if (onSuccess) {
            onSuccess();
        } else {
            navigation.goBack();
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.content}>
                <LockScreen onUnlock={handleUnlock} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        zIndex: 10,
    },
    backButton: {
        padding: 5,
    },
    cancelText: {
        fontSize: 16,
        color: Colors.primary,
        fontWeight: "500",
    },
    content: {
        flex: 1,
    }
});
