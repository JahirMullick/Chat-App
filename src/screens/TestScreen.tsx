import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    MenuItemType,
    withOptionsModal,
} from "../components/hoc/withOptionsModal";

// Menu items like in the screenshot
const chatMenuItems: MenuItemType[] = [
    {
        label: "Mute",
        icon: "volume-high-outline",
        showArrow: true,
        onPress: () => Alert.alert("Mute", "Mute options will appear here"),
    },
    {
        label: "Video Call",
        icon: "videocam-outline",
        onPress: () => Alert.alert("Video Call", "Starting video call..."),
    },
    {
        label: "Search",
        icon: "search-outline",
        onPress: () => Alert.alert("Search", "Opening search..."),
    },
    {
        label: "Change Wallpaper",
        icon: "image-outline",
        onPress: () => Alert.alert("Wallpaper", "Change wallpaper options..."),
    },
    {
        label: "Clear History",
        icon: "brush-outline",
        onPress: () => Alert.alert("Clear History", "Are you sure you want to clear chat history?"),
    },
    {
        label: "Delete chat",
        icon: "trash-outline",
        onPress: () => Alert.alert("Delete Chat", "Are you sure you want to delete this chat?"),
    },
];

// Base Test Screen Component
const TestScreenBase = ({
    openOptionsModal,
}: {
    openOptionsModal: () => void;
}) => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Test Screen</Text>
                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={openOptionsModal}
                >
                    <Ionicons name="ellipsis-vertical" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Options Modal HOC Test</Text>
                <Text style={styles.description}>
                    Tap the three dots icon in the header to open the options modal.
                </Text>

                {/* Alternative button to open modal */}
                <TouchableOpacity
                    style={styles.openButton}
                    onPress={openOptionsModal}
                >
                    <Text style={styles.openButtonText}>Open Options Modal</Text>
                </TouchableOpacity>

                <View style={styles.separator} />
                <Text style={styles.subtitle}>Test Call Screens</Text>

                <TouchableOpacity
                    style={styles.testButton}
                    onPress={() => navigation.navigate("Calling", {
                        callId: "test_call_id",
                        channelId: "test_channel",
                        callType: "audio",
                        remoteName: "Test User",
                        remoteAvatar: "https://i.pravatar.cc/150",
                        isGroup: false,
                        groupName: ""
                    })}
                >
                    <Text style={styles.testButtonText}>Test Calling</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.testButton}
                    onPress={() => navigation.navigate("IncomingCall")}
                >
                    <Text style={styles.testButtonText}>Test Incoming Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.testButton}
                    onPress={() => navigation.navigate("ZegoCall", {
                        callId: "test_zego_call_id",
                        channelId: "test_channel",
                        userID: "test_user_id",
                        userName: "Test Zego User",
                        callType: "video",
                        isCaller: true,
                        remoteName: "Remote User",
                        remoteAvatar: "https://i.pravatar.cc/150"
                    })}
                >
                    <Text style={styles.testButtonText}>Test Zego Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.testButton}
                    onPress={() => navigation.navigate("ZegoGroupCall", {
                        callId: "test_zego_group_call_id",
                        channelId: "test_group_channel",
                        userID: "test_user_id",
                        userName: "Test Zego User",
                        callType: "video",
                        isCaller: true,
                        groupName: "Test Group"
                    })}
                >
                    <Text style={styles.testButtonText}>Test Zego Group Call</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

// Wrap the component with the HOC
const TestScreen = withOptionsModal(TestScreenBase, chatMenuItems, "top-right");

export default TestScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F2F2F7",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fff",
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#C6C6C8",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1C1C1E",
    },
    menuButton: {
        padding: 8,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#1C1C1E",
        marginBottom: 12,
        textAlign: "center",
    },
    description: {
        fontSize: 16,
        color: "#8E8E93",
        textAlign: "center",
        marginBottom: 32,
        lineHeight: 22,
    },
    openButton: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
    },
    openButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    separator: {
        height: 1,
        backgroundColor: "#C6C6C8",
        width: "100%",
        marginVertical: 24,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1C1C1E",
        marginBottom: 16,
    },
    testButton: {
        backgroundColor: "#34C759",
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 12,
        width: "100%",
    },
    testButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        textAlign: "center",
    },
});