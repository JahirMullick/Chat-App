import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    ImageBackground,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChatInput from "../components/ChatInput";
import {
    MenuItemType,
    withOptionsModal,
} from "../components/hoc/withOptionsModal";
import { useResponsive } from "../Controller/Styles/useResponsive";
import { useBehavior } from "../Hooks/useBehavior";
import { useCurrentUserId, useMessages } from "../Hooks/useFirestore";
import { ChatService } from "../services/firestore";

// Message type for display
interface DisplayMessage {
    id: string;
    text: string;
    time: string;
    timestamp: any;
    isMe: boolean;
    isRead?: boolean;
    isEdited?: boolean;
    imageUri?: string;
    videoThumbnail?: string;
    videoDuration?: string;
    videoParticipants?: string[];
    showDateSeparator?: boolean;
    dateLabel?: string;
}

// Helper function to format time
const formatMessageTime = (timestamp: any): string => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// Helper function to format date for header
const formatDateHeader = (timestamp: any): string => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();

    // Reset time to start of day for accurate comparison
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.getTime() === today.getTime()) {
        return "Today";
    } else if (messageDate.getTime() === yesterday.getTime()) {
        return "Yesterday";
    } else {
        return date.toLocaleDateString([], { day: "numeric", month: "long", year: "numeric" });
    }
};

// Helper function to get date key for grouping
const getDateKey = (timestamp: any): string => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toDateString(); // Returns like "Thu Dec 05 2024"
};

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
    const behavior = useBehavior();
    const { hp } = useResponsive();
    const [message, setMessage] = useState("");
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [isSending, setIsSending] = useState(false);

    // Get current user ID
    const currentUserId = useCurrentUserId();

    // Get chat info from route params
    const initialChatId = (route.params as any)?.chatId;
    const recipientId = (route.params as any)?.recipientId; // For new chats
    const chatName = (route.params as any)?.name || "Chat";
    const chatAvatar = (route.params as any)?.avatar;
    const avatarColor = (route.params as any)?.avatarColor || "#4CAF50";
    const isOnline = (route.params as any)?.isOnline ?? true;

    // Track current chatId (may be null initially for new chats)
    const [activeChatId, setActiveChatId] = useState<string | null>(initialChatId || null);

    // Use Firestore messages if chatId exists
    const {
        messages: firestoreMessages,
        loading: messagesLoading,
        sendMessage: sendFirestoreMessage
    } = useMessages(activeChatId);

    // Convert Firestore messages to display format
    const displayMessages: DisplayMessage[] = useMemo(() => {
        if (!activeChatId) {
            return []; // No chat yet
        }
        const messages = firestoreMessages.map((msg): DisplayMessage => {
            // Check if message is read by someone other than the sender
            const readByOthers = msg.readBy?.some(id => id !== msg.senderId) || false;

            return {
                id: msg.id,
                text: msg.text,
                time: formatMessageTime(msg.timestamp),
                timestamp: msg.timestamp,
                isMe: msg.senderId === currentUserId,
                isRead: readByOthers, // True only if read by recipient(s)
                isEdited: msg.isEdited,
                imageUri: msg.mediaType === "image" ? msg.mediaUrl : undefined,
                videoThumbnail: msg.mediaType === "video" ? msg.mediaThumbnail : undefined,
            };
        }).reverse(); // Reverse to show oldest first

        // Add date separators
        let lastDateKey = "";
        return messages.map((msg) => {
            const currentDateKey = getDateKey(msg.timestamp);
            const showDateSeparator = currentDateKey !== lastDateKey;
            lastDateKey = currentDateKey;
            return {
                ...msg,
                showDateSeparator,
                dateLabel: showDateSeparator ? formatDateHeader(msg.timestamp) : undefined,
            };
        });
    }, [firestoreMessages, activeChatId, currentUserId]);

    useEffect(() => {
        const showListener = Keyboard.addListener(
            Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
            () => setIsKeyboardVisible(true)
        );
        const hideListener = Keyboard.addListener(
            Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
            () => setIsKeyboardVisible(false)
        );
        return () => {
            showListener.remove();
            hideListener.remove();
        };
    }, []);

    const renderMessage = ({ item }: { item: DisplayMessage }) => {
        const isMe = item.isMe;

        return (
            <>
                {item.showDateSeparator && item.dateLabel && (
                    <View style={styles.dateHeaderContainer}>
                        <View style={styles.dateHeader}>
                            <Text style={styles.dateHeaderText}>{item.dateLabel}</Text>
                        </View>
                    </View>
                )}
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
            </>
        );
    };

    const handleSendMessage = async (text?: string) => {
        const messageText = text || message;
        if (!messageText.trim() || isSending) return;

        setIsSending(true);
        setMessage("");

        try {
            let chatIdToUse = activeChatId;

            // If no chat exists yet, create one first
            if (!chatIdToUse && recipientId && currentUserId) {
                console.log("Creating new chat with recipient:", recipientId);
                chatIdToUse = await ChatService.createIndividualChat(
                    currentUserId,
                    recipientId
                );
                setActiveChatId(chatIdToUse);
            }

            // Send the message
            if (chatIdToUse) {
                await sendFirestoreMessage(messageText.trim());
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessage(messageText); // Restore message on error
        } finally {
            setIsSending(false);
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

                <TouchableOpacity
                    style={styles.headerAction}
                    onPress={() => alert("Starting call...")}
                >
                    <Ionicons name="call-outline" size={22} color="#fff" />
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
                    style={[
                        styles.keyboardAvoidingView,
                        isKeyboardVisible && {
                            paddingBottom: insets.bottom
                        }
                    ]}
                    behavior={behavior}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
                >
                    {messagesLoading && activeChatId ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#517DA2" />
                        </View>
                    ) : (
                        <FlatList
                            data={displayMessages}
                            renderItem={renderMessage}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.messagesList}
                            showsVerticalScrollIndicator={false}
                            style={styles.messagesFlatList}
                        />
                    )}

                    {/* Input Bar */}
                    <ChatInput
                        value={message}
                        onChangeText={setMessage}
                        onSend={handleSendMessage}
                        onAttachPress={() => console.log("Attach pressed")}
                        onCameraPress={() => console.log("Camera pressed")}
                        onEmojiPress={() => console.log("Emoji pressed")}
                        containerStyle={{ paddingBottom: insets.bottom + 10 || 8 }}
                    />

                </KeyboardAvoidingView>
            </ImageBackground>
        </View >
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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
