import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import {
    FlatList,
    Image,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChatInput from "../components/ChatInput";
import {
    MenuItemType,
    withOptionsModal,
} from "../components/hoc/withOptionsModal";

// Message type
interface Message {
    id: string;
    text: string;
    time: string;
    isMe: boolean;
    isRead?: boolean;
    isEdited?: boolean;
    imageUri?: string;
    videoThumbnail?: string;
    videoDuration?: string;
    videoParticipants?: string[];
}

// Sample messages data
const sampleMessages: Message[] = [
    {
        id: "1",
        text: "Just ask - I will do everything for you.",
        time: "10:03 AM",
        isMe: false,
    },
    {
        id: "2",
        text: "Well, yes, of course - you very rarely keep your promises.",
        time: "12:06 AM",
        isMe: true,
        isRead: true,
    },
    {
        id: "3",
        text: "And you lie very often.",
        time: "12:06 AM",
        isMe: true,
        isRead: true,
    },
    {
        id: "4",
        text: "I always keep my promises",
        time: "12:34 AM",
        isMe: false,
    },
    {
        id: "5",
        text: "Where is my flamethrower?",
        time: "1:50 PM",
        isMe: true,
        isRead: true,
        isEdited: true,
    },
    {
        id: "6",
        text: "Tomorrow, everything tomorrow...",
        time: "6:07 AM",
        isMe: false,
    },
];

// Menu items for chat options modal
const chatMenuItems: MenuItemType[] = [
    {
        label: "Mute",
        icon: "volume-high-outline",
        showArrow: true,
        onPress: () => alert("Mute options will appear here"),
    },
    {
        label: "Video Call",
        icon: "videocam-outline",
        onPress: () => alert("Starting video call..."),
    },
    {
        label: "Search",
        icon: "search-outline",
        onPress: () => alert("Opening search..."),
    },
    {
        label: "Change Wallpaper",
        icon: "image-outline",
        onPress: () => alert("Change wallpaper options..."),
    },
    {
        label: "Clear History",
        icon: "brush-outline",
        onPress: () => alert("Are you sure you want to clear chat history?"),
    },
    {
        label: "Delete chat",
        icon: "trash-outline",
        onPress: () => alert("Are you sure you want to delete this chat?"),
    },
];

function ChatScreenBase({ openOptionsModal }: { openOptionsModal: () => void }) {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>(sampleMessages);

    // Get chat info from route params
    const chatName = (route.params as any)?.name || "Chat";
    const chatAvatar = (route.params as any)?.avatar;
    const avatarColor = (route.params as any)?.avatarColor || "#4CAF50";
    const isOnline = true; // You can pass this from params

    const renderMessage = ({ item }: { item: Message }) => {
        const isMe = item.isMe;

        return (
            <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
                <View
                    style={[
                        styles.messageBubble,
                        isMe ? styles.messageBubbleMe : styles.messageBubbleOther,
                    ]}
                >
                    {item.videoThumbnail ? (
                        <View style={styles.videoContainer}>
                            <Image
                                source={{ uri: item.videoThumbnail }}
                                style={styles.videoThumbnail}
                            />
                            <View style={styles.videoOverlay}>
                                <View style={styles.videoParticipants}>
                                    {/* Participant avatars would go here */}
                                </View>
                                <Text style={styles.videoNames}>
                                    {item.videoParticipants?.join(", ")}
                                </Text>
                                <Text style={styles.videoDuration}>{item.videoDuration}</Text>
                            </View>
                        </View>
                    ) : (
                        <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
                            {item.text}
                        </Text>
                    )}
                    <View style={styles.messageFooter}>
                        {item.isEdited && (
                            <Text style={[styles.editedText, isMe && styles.timeTextMe]}>
                                edited{" "}
                            </Text>
                        )}
                        <Text style={[styles.timeText, isMe && styles.timeTextMe]}>
                            {item.time}
                        </Text>
                        {isMe && (
                            <Ionicons
                                name={item.isRead ? "checkmark-done" : "checkmark"}
                                size={16}
                                color="#4CAF50"
                                style={styles.readIcon}
                            />
                        )}
                    </View>
                </View>
            </View>
        );
    };

    const renderDateHeader = () => (
        <View style={styles.dateHeaderContainer}>
            <View style={styles.dateHeader}>
                <Text style={styles.dateHeaderText}>21 July</Text>
            </View>
        </View>
    );

    const sendMessage = (text?: string) => {
        const messageText = text || message;
        if (messageText.trim()) {
            const newMessage: Message = {
                id: Date.now().toString(),
                text: messageText.trim(),
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                isMe: true,
                isRead: false,
            };
            setMessages([...messages, newMessage]);
            setMessage("");
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#517DA2" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.headerProfile}>
                    <View style={styles.headerAvatar}>
                        {chatAvatar ? (
                            <Image source={{ uri: chatAvatar }} style={styles.avatarImage} />
                        ) : (
                            <View style={[styles.avatarPlaceholder, { backgroundColor: avatarColor }]}>
                                <Text style={styles.avatarText}>
                                    {chatName.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerName}>{chatName}</Text>
                        <Text style={styles.headerStatus}>
                            {isOnline ? "online" : "last seen recently"}
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.headerAction} onPress={openOptionsModal}>
                    <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Chat Background - extends behind input */}
            <ImageBackground
                source={require("../../assets/images/bgte1.png")}
                style={styles.chatBackground}
                resizeMode="cover"
            >
                <KeyboardAvoidingView
                    style={styles.keyboardAvoidingView}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
                >
                    <FlatList
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.messagesList}
                        ListHeaderComponent={renderDateHeader}
                        showsVerticalScrollIndicator={false}
                        style={styles.messagesFlatList}
                    />

                    {/* Input Bar */}
                    <ChatInput
                        value={message}
                        onChangeText={setMessage}
                        onSend={sendMessage}
                        onAttachPress={() => console.log("Attach pressed")}
                        onCameraPress={() => console.log("Camera pressed")}
                        onEmojiPress={() => console.log("Emoji pressed")}
                        containerStyle={{ paddingBottom: insets.bottom + 10 || 8 }}
                    />
                </KeyboardAvoidingView>
            </ImageBackground>
        </View>
    );
}

const ChatScreen = withOptionsModal(ChatScreenBase, chatMenuItems, "top-right");

export default ChatScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#517DA2",
        paddingHorizontal: 4,
        paddingBottom: 10,
    },
    backButton: {
        padding: 10,
    },
    headerProfile: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },
    headerAvatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        marginRight: 12,
        overflow: "hidden",
    },
    avatarImage: {
        width: "100%",
        height: "100%",
    },
    avatarPlaceholder: {
        width: "100%",
        height: "100%",
        borderRadius: 21,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
    headerInfo: {
        flex: 1,
    },
    headerName: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "600",
    },
    headerStatus: {
        color: "rgba(255,255,255,0.8)",
        fontSize: 13,
    },
    headerAction: {
        padding: 10,
    },
    chatBackground: {
        flex: 1,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    messagesFlatList: {
        flex: 1,
    },
    messagesList: {
        padding: 8,
        paddingBottom: 16,
    },
    dateHeaderContainer: {
        alignItems: "center",
        marginVertical: 12,
    },
    dateHeader: {
        backgroundColor: "rgba(0,0,0,0.2)",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    dateHeaderText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "500",
    },
    messageRow: {
        flexDirection: "row",
        marginVertical: 2,
        paddingHorizontal: 8,
    },
    messageRowMe: {
        justifyContent: "flex-end",
    },
    messageBubble: {
        maxWidth: "80%",
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 6,
        borderRadius: 16,
    },
    messageBubbleMe: {
        backgroundColor: "#EEFFDE",
        borderBottomRightRadius: 4,
    },
    messageBubbleOther: {
        backgroundColor: "#fff",
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
        color: "#000",
        lineHeight: 22,
    },
    messageTextMe: {
        color: "#000",
    },
    messageFooter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        marginTop: 2,
    },
    timeText: {
        fontSize: 12,
        color: "#8E8E93",
    },
    timeTextMe: {
        color: "#6B9F5D",
    },
    editedText: {
        fontSize: 12,
        color: "#8E8E93",
        fontStyle: "italic",
    },
    readIcon: {
        marginLeft: 4,
    },
    videoContainer: {
        width: 200,
        height: 280,
        borderRadius: 12,
        overflow: "hidden",
    },
    videoThumbnail: {
        width: "100%",
        height: "100%",
    },
    videoOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 8,
        backgroundColor: "rgba(0,0,0,0.3)",
    },
    videoParticipants: {
        flexDirection: "row",
    },
    videoNames: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "600",
    },
    videoDuration: {
        color: "rgba(255,255,255,0.8)",
        fontSize: 12,
    },
});
