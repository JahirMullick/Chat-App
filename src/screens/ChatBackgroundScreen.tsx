import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
    Dimensions,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    ToastAndroid,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "../constants/colors";
import { MainStackParamList } from "../Navigation/types";
import { BackgroundStorage } from "../utils/storage";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width + 65) / 4;
// const ITEM_WIDTH = (width - 48) / 3; // 3 columns with padding

// Background images from assets/Backgrounds
const BACKGROUNDS = [

    {
        id: "batman",
        name: "Batman",
        source: require("../../assets/Backgrounds/batman.jpg"),
    },
    {
        id: "eyes",
        name: "Eyes",
        source: require("../../assets/Backgrounds/eyes.jpg"),
    },
    {
        id: "file",
        name: "File",
        source: require("../../assets/Backgrounds/file.jpg"),
    },
    {
        id: "sayings",
        name: "Sayings",
        source: require("../../assets/Backgrounds/sayings.jpg"),
    },
    {
        id: "sayings1",
        name: "Sayings 1",
        source: require("../../assets/Backgrounds/sayings1.jpg"),
    },
    {
        id: "sayings2",
        name: "Sayings 2",
        source: require("../../assets/Backgrounds/sayings2.jpg"),
    },
    {
        id: "totoro",
        name: "Totoro",
        source: require("../../assets/Backgrounds/totoro.jpg"),
    },
    {
        id: "tweety_bird",
        name: "Tweety Bird",
        source: require("../../assets/Backgrounds/tweety_bird.jpg"),
    },
    {
        id: "anime",
        name: "Anime",
        source: require("../../assets/Backgrounds/anime.jpg"),
    },
    {
        id: "a1",
        name: "A1",
        source: require("../../assets/Backgrounds/a1.jpeg"),
    },
    {
        id: "a2",
        name: "A2",
        source: require("../../assets/Backgrounds/a2.jpeg"),
    },
    {
        id: "a3",
        name: "A3",
        source: require("../../assets/Backgrounds/a3.jpeg"),
    },

];

export default function ChatBackgroundScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
    const [selectedBackground, setSelectedBackground] = useState<string | null>(null);
    const [savedBackground, setSavedBackground] = useState<string | null>(null);

    // Load saved background on mount
    React.useEffect(() => {
        loadSavedBackground();
    }, []);

    const loadSavedBackground = () => {
        try {
            const saved = BackgroundStorage.getBackground();
            if (saved) {
                setSavedBackground(saved);
                setSelectedBackground(saved);
            } else {
                setSelectedBackground("none");
            }
        } catch (error) {
            console.error("Error loading background:", error);
            setSelectedBackground("none");
        }
    };

    const handleSelectBackground = (id: string) => {
        setSelectedBackground(id);
    };

    const handleSave = () => {
        try {
            if (selectedBackground) {
                BackgroundStorage.setBackground(selectedBackground);
                setSavedBackground(selectedBackground);

                // Show toast message
                if (Platform.OS === 'android') {
                    ToastAndroid.show(
                        '✅ Background changed successfully!',
                        ToastAndroid.SHORT
                    );
                }

                // Navigate back after short delay
                setTimeout(() => {
                    navigation.goBack();
                }, 500);
            }
        } catch (error) {
            console.error("Error saving background:", error);
            if (Platform.OS === 'android') {
                ToastAndroid.show(
                    '❌ Failed to save background',
                    ToastAndroid.SHORT
                );
            }
        }
    };

    const isBackgroundChanged = selectedBackground !== savedBackground;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Change Background</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Background Grid */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.instruction}>
                    Select a background for your chat screens
                </Text>

                <View style={styles.grid}>
                    {BACKGROUNDS.map((bg) => (
                        <TouchableOpacity
                            key={bg.id}
                            style={[
                                styles.backgroundItem,
                                selectedBackground === bg.id && styles.backgroundItemSelected,
                            ]}
                            onPress={() => handleSelectBackground(bg.id)}
                            activeOpacity={0.7}
                        >
                            {bg.source ? (
                                <Image source={bg.source} style={styles.backgroundImage} />
                            ) : (
                                <View style={styles.noBackground}>
                                    <Ionicons name="close-circle-outline" size={40} color={Colors.gray400} />
                                </View>
                            )}
                            <Text
                                style={[
                                    styles.backgroundName,
                                    selectedBackground === bg.id && styles.backgroundNameSelected,
                                ]}
                                numberOfLines={1}
                            >
                                {bg.name}
                            </Text>
                            {selectedBackground === bg.id && (
                                <View style={styles.checkmark}>
                                    <Ionicons name="checkmark-circle" size={28} color={Colors.primary} />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Save Button */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        !isBackgroundChanged && styles.saveButtonDisabled,
                    ]}
                    onPress={handleSave}
                    disabled={!isBackgroundChanged}
                    activeOpacity={0.8}
                >
                    <Ionicons
                        name="checkmark-circle-outline"
                        size={22}
                        color={isBackgroundChanged ? Colors.white : Colors.gray400}
                    />
                    <Text
                        style={[
                            styles.saveButtonText,
                            !isBackgroundChanged && styles.saveButtonTextDisabled,
                        ]}
                    >
                        Save Background
                    </Text>
                </TouchableOpacity>
            </View>
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
        paddingHorizontal: 8,
        paddingVertical: 12,
        elevation: 4,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
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
    placeholder: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    instruction: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 20,
        textAlign: "center",
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    backgroundItem: {
        width: ITEM_WIDTH,
        aspectRatio: 0.75,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: Colors.white,
        elevation: 2,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        borderWidth: 2,
        borderColor: "transparent",
    },
    backgroundItemSelected: {
        borderColor: Colors.primary,
        elevation: 4,
    },
    backgroundImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    noBackground: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.gray100,
    },
    backgroundName: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        color: Colors.white,
        fontSize: 11,
        fontWeight: "500",
        paddingVertical: 6,
        paddingHorizontal: 8,
        textAlign: "center",
    },
    backgroundNameSelected: {
        backgroundColor: "rgba(81, 125, 162, 0.9)",
    },
    checkmark: {
        position: "absolute",
        top: 8,
        right: 8,
        backgroundColor: Colors.white,
        borderRadius: 14,
        elevation: 2,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    footer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        elevation: 8,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    saveButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.primary,
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    saveButtonDisabled: {
        backgroundColor: Colors.gray200,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.white,
    },
    saveButtonTextDisabled: {
        color: Colors.gray400,
    },
});
