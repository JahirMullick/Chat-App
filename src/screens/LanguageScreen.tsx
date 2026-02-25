import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MainStackParamList } from "../Navigation/types";

const LANGUAGES = [
    { id: "en", name: "English", alt: "English" },
    { id: "ar", name: "العربية", alt: "Arabic" },
    { id: "hr", name: "Hrvatski", alt: "Croatian" },
    { id: "cs", name: "Čeština", alt: "Czech" },
    { id: "nl", name: "Nederlands", alt: "Dutch" },
    { id: "fi", name: "Suomi", alt: "Finnish" },
    { id: "fr", name: "Français", alt: "French" },
    { id: "de", name: "Deutsch", alt: "German" },
];

export default function LanguageScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
    const insets = useSafeAreaInsets();

    const [showTranslate, setShowTranslate] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState("en");

    const PRIMARY_BLUE = "#1DA1F2"; // similar to standard blue
    const BG_COLOR = "#F2F2F7";

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor={BG_COLOR} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={26} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Language</Text>
                <TouchableOpacity style={styles.headerButton}>
                    <Ionicons name="search-outline" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Translate Section */}
                <View style={styles.card}>
                    <Text style={styles.sectionHeader}>Translate Messages</Text>

                    <View style={styles.row}>
                        <Text style={styles.rowText}>Show Translate Button</Text>
                        <Switch
                            value={showTranslate}
                            onValueChange={setShowTranslate}
                            trackColor={{ false: "#E5E5EA", true: PRIMARY_BLUE }}
                            thumbColor="#fff"
                        />
                    </View>

                    {showTranslate && (
                        <>
                            <View style={styles.divider} />
                            <TouchableOpacity style={styles.row} activeOpacity={0.7}>
                                <Text style={styles.rowText}>Do Not Translate</Text>
                                <Text style={styles.rowRightText}>English</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* Info text */}
                <Text style={styles.infoText}>
                    The 'Translate' button will appear when you make a single tap on a text message.
                </Text>

                {/* Languages Section */}
                <View style={styles.card}>
                    <Text style={styles.sectionHeader}>Language</Text>

                    {LANGUAGES.map((lang, index) => {
                        const isSelected = selectedLanguage === lang.id;
                        return (
                            <View key={lang.id}>
                                <TouchableOpacity
                                    style={styles.langRow}
                                    activeOpacity={0.7}
                                    onPress={() => setSelectedLanguage(lang.id)}
                                >
                                    {/* Custom Radio Button */}
                                    <View style={[
                                        styles.radio,
                                        isSelected ? styles.radioSelected : styles.radioUnselected
                                    ]}>
                                        {isSelected && <View style={styles.radioInner} />}
                                    </View>

                                    <View style={styles.langTexts}>
                                        <Text style={styles.langName}>{lang.name}</Text>
                                        <Text style={styles.langAlt}>{lang.alt}</Text>
                                    </View>
                                </TouchableOpacity>
                                {index < LANGUAGES.length - 1 && <View style={styles.dividerLang} />}
                            </View>
                        );
                    })}
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F2F2F7",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        height: 56,
    },
    headerButton: {
        padding: 4,
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: "600",
        color: "#000",
        marginLeft: 16,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 40,
        paddingTop: 10,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 14,
        overflow: "hidden",
        marginBottom: 8,
    },
    sectionHeader: {
        color: "#1DA1F2",
        fontSize: 14,
        fontWeight: "600",
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 10,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 16,
        minHeight: 52,
    },
    rowText: {
        fontSize: 16,
        color: "#000",
    },
    rowRightText: {
        fontSize: 16,
        color: "#1DA1F2",
    },
    lockSwitchContainer: {
        position: 'relative',
        justifyContent: 'center',
    },
    lockIconContainer: {
        position: 'absolute',
        left: 5, // Approximate position over the switch thumb when off
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: "#E5E5EA",
        marginLeft: 16,
    },
    dividerLang: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: "#E5E5EA",
        marginLeft: 48,
    },
    infoText: {
        fontSize: 13,
        color: "#8E8E93",
        paddingHorizontal: 8,
        marginBottom: 20,
        lineHeight: 18,
    },
    langRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    radio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    radioUnselected: {
        borderColor: "#C7C7CC",
    },
    radioSelected: {
        borderColor: "#1DA1F2",
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#1DA1F2",
    },
    langTexts: {
        flex: 1,
    },
    langName: {
        fontSize: 16,
        color: "#000",
        marginBottom: 2,
    },
    langAlt: {
        fontSize: 13,
        color: "#8E8E93",
    },
});
