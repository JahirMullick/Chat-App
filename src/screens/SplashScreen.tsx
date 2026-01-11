import React, { useEffect } from "react";
import { StatusBar, StyleSheet, Text, View } from "react-native";
import Logo from "../../assets/images/Logo.svg";

interface SplashScreenProps {
    onFinish?: () => void;
    duration?: number;
}

export default function SplashScreen({
    onFinish,
    duration = 200000 * 60,
}: SplashScreenProps) {
    useEffect(() => {
        if (onFinish) {
            const timer = setTimeout(() => {
                onFinish();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [onFinish, duration]);

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor="#fff"
                translucent={false}
            />
            <View style={styles.logoContainer}>
                <Logo width={120} height={120} />
            </View>
            <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 20, fontWeight: "bold" }}>Chat App</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    },
    logoContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
});
