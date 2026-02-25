import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    ImageBackground,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    ToastAndroid,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChatInput from "../components/ChatInput";
import OptionsModal, {
    MenuItemType,
    OptionsModalRef
} from "../components/hoc/withOptionsModal";
import MessageBubble, { MessageBubbleData } from "../components/MessageBubble";
import { getBackgroundSource } from "../constants/backgrounds";
import Colors from "../constants/colors";
import { useResponsive } from "../Controller/Styles/useResponsive";
import { useBehavior } from "../Hooks/useBehavior";
import { useCurrentUserId, useMessages, useUserProfile } from "../Hooks/useFirestore";
import { MainStackParamList } from "../Navigation/types";
import { ChatService, MessageService, ReactionService, UserService } from "../services/firestore";
import { BackgroundStorage } from "../utils/storage";

// Message type for display
interface DisplayMessage {
    id: string;
    text: string;
    time: string;
    timestamp: any;
    isMe: boolean;
    senderId: string;
    senderName?: string;
    senderPhotoURL?: string | null;
    isRead?: boolean;
    isEdited?: boolean;
    imageUri?: string;
    videoThumbnail?: string;
    videoDuration?: string;
    videoParticipants?: string[];
    showDateSeparator?: boolean;
    dateLabel?: string;
    reactions?: { [emoji: string]: { emoji: string; userIds: string[]; count: number } };
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

function ChatScreen() {
    const optionsModalRef = useRef<OptionsModalRef>(null);
    const flatListRef = useRef<FlatList>(null);
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const behavior = useBehavior();
    const { hp } = useResponsive();
    const [message, setMessage] = useState("");
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [chatInfo, setChatInfo] = useState<any>(null);
    const [isGroupChat, setIsGroupChat] = useState(false);
    const [backgroundImage, setBackgroundImage] = useState<any>(null);

    // Get current user ID
    const currentUserId = useCurrentUserId();

    // Load background image from storage
    useEffect(() => {
        const loadBackground = () => {
            const bgId = BackgroundStorage.getBackground();
            console.log("📸 Loading background, ID:", bgId);
            const bgSource = getBackgroundSource(bgId);
            console.log("📸 Background source:", bgSource ? "Found" : "Null");

            if (bgSource) {
                setBackgroundImage(bgSource);
            } else {
                // No background selected - use null for default white/transparent background
                setBackgroundImage(null);
            }
        };

        loadBackground();

        // Reload background when screen comes into focus (after changing in settings)
        const unsubscribe = navigation.addListener('focus', () => {
            console.log("📸 Screen focused, reloading background");
            loadBackground();
        });

        return unsubscribe;
    }, [navigation]);

    // Get chat info from route params
    const initialChatId = (route.params as any)?.chatId;
    const recipientId = (route.params as any)?.recipientId; // For new chats
    const chatName = (route.params as any)?.name || "Chat";
    const chatAvatar = (route.params as any)?.avatar || null;
    const avatarColor = (route.params as any)?.avatarColor || Colors.avatarDefault;

    // Get recipient's profile to track online status in real-time
    const { profile: recipientProfile } = useUserProfile(recipientId);

    // Track current chatId (may be null initially for new chats)
    const [activeChatId, setActiveChatId] = useState<string | null>(initialChatId || null);

    // Fetch chat info to determine if it's a group
    useEffect(() => {
        if (activeChatId) {
            ChatService.getChatById(activeChatId).then((chat) => {
                if (chat) {
                    setChatInfo(chat);
                    setIsGroupChat(chat.type === "group");
                }
            }).catch(console.error);
        }
    }, [activeChatId]);

    // Use Firestore messages if chatId exists
    const {
        messages: firestoreMessages,
        loading: messagesLoading,
        sendMessage: sendFirestoreMessage,
        deleteMessage,
        deleteMessageForMe,
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
                senderId: msg.senderId,
                senderName: msg.senderName,
                senderPhotoURL: msg.senderPhotoURL,
                isRead: readByOthers, // True only if read by recipient(s)
                isEdited: msg.isEdited,
                imageUri: msg.mediaType === "image" ? msg.mediaUrl : undefined,
                videoThumbnail: msg.mediaType === "video" ? msg.mediaThumbnail : undefined,
                reactions: msg.reactions,
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

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (displayMessages.length > 0 && !refreshing) {
            setTimeout(() => {
                flatListRef.current?.scrollToIndex({
                    index: displayMessages.length - 1,
                    animated: true,
                });
            }, 100);
        }
    }, [displayMessages.length]);

    const handleRefresh = useCallback(async () => {
        if (!activeChatId) return;
        setRefreshing(true);
        try {
            // The useMessages hook already subscribes to real-time updates
            // This refresh is just for manual pull-to-refresh feedback
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error("Error refreshing messages:", error);
        } finally {
            setRefreshing(false);
        }
    }, [activeChatId]);

    const handleSendMessage = async (text?: string) => {
        const messageText = text || message;
        if (!messageText.trim() || isSending || !currentUserId) return;

        setIsSending(true);
        setMessage("");

        try {
            let chatIdToUse = activeChatId;

            // If no chat exists yet, create one first
            if (!chatIdToUse && recipientId) {
                console.log("Creating new chat with recipient:", recipientId);
                chatIdToUse = await ChatService.createIndividualChat(
                    currentUserId,
                    recipientId
                );
                setActiveChatId(chatIdToUse);

                // Wait a brief moment for React to process the state update
                // and establish the message subscription before sending
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // Send the message - use MessageService directly with the new chatId
            if (chatIdToUse) {
                const userProfile = await UserService.getUserById(currentUserId);
                // ✅ UPDATED: Now passing receiverId
                await MessageService.sendMessage(
                    chatIdToUse,
                    currentUserId,
                    userProfile?.displayName || "Unknown",
                    messageText.trim(),
                    {
                        senderPhotoURL: userProfile?.photoURL || null,
                        receiverId: recipientId, // ✅ ADD THIS LINE
                    }
                );

                // Scroll to end after sending message
                setTimeout(() => {
                    if (displayMessages.length > 0) {
                        flatListRef.current?.scrollToIndex({
                            index: displayMessages.length - 1,
                            animated: true,
                        });
                    }
                }, 200);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessage(messageText); // Restore message on error
        } finally {
            setIsSending(false);
        }
    };

    // Delete message handlers
    const handleDeleteMessageForMe = useCallback(async (messageId: string) => {
        if (!activeChatId) return;
        await deleteMessageForMe(messageId);
    }, [activeChatId, deleteMessageForMe]);

    const handleDeleteMessageForEveryone = useCallback(async (messageId: string) => {
        if (!activeChatId) return;
        Alert.alert(
            "Delete Message",
            "Delete this message for everyone?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => await deleteMessage(messageId),
                },
            ]
        );
    }, [activeChatId, deleteMessage]);

    // Delete chat handlers
    const handleDeleteChatForMe = useCallback(async () => {
        if (!activeChatId || !currentUserId) return;
        Alert.alert(
            "Delete Chat",
            "Delete this chat from your list? This won't delete it for the other person.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await ChatService.leaveChat(currentUserId, activeChatId);
                            navigation.goBack();
                        } catch (error) {
                            console.error("Error deleting chat:", error);
                            Alert.alert("Error", "Failed to delete chat");
                        }
                    },
                },
            ]
        );
    }, [activeChatId, currentUserId, navigation]);

    const handleDeleteChatForEveryone = useCallback(async () => {
        if (!activeChatId) return;
        Alert.alert(
            "Delete Chat for Everyone",
            "This will permanently delete the chat and all messages for everyone. This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await ChatService.deleteEntireChat(activeChatId);
                            navigation.goBack();
                        } catch (error) {
                            console.error("Error deleting chat:", error);
                            Alert.alert("Error", "Failed to delete chat");
                        }
                    },
                },
            ]
        );
    }, [activeChatId, navigation]);

    const handleClearHistory = useCallback(async () => {
        if (!activeChatId) return;
        Alert.alert(
            "Clear Chat History",
            "Delete all messages in this chat?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await MessageService.deleteAllMessages(activeChatId);
                        } catch (error) {
                            console.error("Error clearing history:", error);
                            Alert.alert("Error", "Failed to clear history");
                        }
                    },
                },
            ]
        );
    }, [activeChatId]);

    // Handle message reactions
    const handleReaction = useCallback(async (messageId: string, emoji: string) => {
        if (!activeChatId || !currentUserId) return;
        try {
            await ReactionService.toggleReaction(activeChatId, messageId, currentUserId, emoji);
        } catch (error) {
            console.error("Error toggling reaction:", error);
        }
    }, [activeChatId, currentUserId]);

    const handleSaveMessage = useCallback(async (message: MessageBubbleData) => {
        if (!currentUserId) return;

        try {
            // Find or create Saved Messages chat (self-chat)
            let savedChatId: string | null = null;

            // Check if a self-chat exists
            const existingChat = await ChatService.findIndividualChat(currentUserId, currentUserId);

            if (existingChat) {
                savedChatId = existingChat.id;
            } else {
                savedChatId = await ChatService.createIndividualChat(currentUserId, currentUserId);
            }

            if (savedChatId) {
                // Determine message type and content
                let mediaType: "image" | "video" | undefined;
                if (message.videoThumbnail) {
                    mediaType = "video";
                } else if (message.imageUri) {
                    mediaType = "image";
                }

                // Create a caption including original sender info if not sent by me (and not "Me" sender name)
                const originalSender = message.senderName || "Unknown";

                // If the message is already from me, or from "Me", don't add the prefix
                const shouldAddPrefix = !message.isMe && originalSender !== "Me" && originalSender !== "Saved Messages";

                // Format: "Sender Name" then "Message"
                const forwardPrefix = shouldAddPrefix ? `${originalSender}\n` : "";

                // If it's pure media without text, handle the description
                const mediaDesc = (mediaType === "image" ? "Photo" : mediaType === "video" ? "Video" : "Forwarded Message");
                const textDetail = message.text || mediaDesc;

                // Combine prefix and content
                const textContent = `${forwardPrefix}${textDetail}`;

                await MessageService.sendMessage(
                    savedChatId,
                    currentUserId,
                    "Me",
                    textContent,
                    {
                        receiverId: currentUserId,
                        mediaUrl: message.imageUri, // Assumption: imageUri holds the main media URL
                        mediaThumbnail: message.videoThumbnail,
                        mediaType,
                        // Note: replyTo structure must match what sendMessage expects
                    }
                );

                if (Platform.OS === 'android') {
                    ToastAndroid.show("Message saved to Saved Messages", ToastAndroid.SHORT);
                } else {
                    Alert.alert("Success", "Message saved to Saved Messages");
                }
            }
        } catch (error) {
            console.error("Error saving message:", error);
            if (Platform.OS === 'android') {
                ToastAndroid.show("Failed to save message", ToastAndroid.SHORT);
            } else {
                Alert.alert("Error", "Failed to save message");
            }
        }
    }, [currentUserId]);

    // Navigate to user profile screen
    const handleOpenProfile = useCallback(() => {
        if (isGroupChat) {
            navigation.navigate("GroupProfile", {
                chatId: activeChatId || undefined,
                groupName: chatName,
                memberCount: chatInfo?.participantIds?.length || 1,
            });
        } else {
            if (!recipientId) return;
            navigation.navigate("UserProfile", {
                recipientId,
                chatId: activeChatId || undefined,
                name: chatName,
                avatar: chatAvatar,
                avatarColor,
                phoneNumber: recipientProfile?.phoneNumber || undefined,
                username: recipientProfile?.displayName?.replace(/\s/g, "").toLowerCase(),
            });
        }
    }, [isGroupChat, activeChatId, chatName, chatInfo, recipientId, chatAvatar, avatarColor, recipientProfile, navigation]);

    // Chat menu items (using handlers defined above)
    const chatMenuItems: MenuItemType[] = useMemo(() => [
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
            onPress: handleClearHistory,
        },
        {
            label: "Delete for Me",
            icon: "trash-outline",
            onPress: handleDeleteChatForMe,
        },
        {
            label: "Delete for Everyone",
            icon: "trash-outline",
            onPress: handleDeleteChatForEveryone,
        },
    ], [handleClearHistory, handleDeleteChatForMe, handleDeleteChatForEveryone]);

    const isSavedMessagesChat = useMemo(() => {
        return recipientId === currentUserId || chatName === "Saved Messages" || chatName === "Saved Messages (Me)";
    }, [recipientId, currentUserId, chatName]);

    const renderMessage = ({ item }: { item: DisplayMessage }) => {
        return (
            <>
                {item.showDateSeparator && item.dateLabel && (
                    <View style={styles.dateHeaderContainer}>
                        <View style={styles.dateHeader}>
                            <Text style={styles.dateHeaderText}>{item.dateLabel}</Text>
                        </View>
                    </View>
                )}
                <MessageBubble
                    message={item as MessageBubbleData}
                    isGroupChat={isGroupChat}
                    chatId={activeChatId || ''}
                    currentUserId={currentUserId || ''}
                    onReaction={handleReaction}
                    onDeleteForMe={handleDeleteMessageForMe}
                    onDeleteForEveryone={handleDeleteMessageForEveryone}
                    onSave={!isSavedMessagesChat ? handleSaveMessage : undefined}
                />
            </>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.headerProfile} onPress={handleOpenProfile}>
                    <View style={styles.headerAvatarContainer}>
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
                        {recipientProfile?.isOnline && <View style={styles.onlineBadge} />}
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerName}>{chatName}</Text>
                        <Text style={styles.headerStatus}>
                            {recipientProfile?.isOnline ? "online" : "last seen recently"}
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.headerAction}
                    onPress={() => alert("Starting call...")}
                >
                    <Ionicons name="call-outline" size={22} color={Colors.white} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.headerAction} onPress={() => optionsModalRef.current?.open()}>
                    <Ionicons name="ellipsis-vertical" size={24} color={Colors.white} />
                </TouchableOpacity>
            </View>

            {/* Chat Background - extends behind input */}
            <ImageBackground
                source={backgroundImage}
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
                            <ActivityIndicator size="large" color={Colors.primary} />
                        </View>
                    ) : (
                        <FlatList
                            ref={flatListRef}
                            data={displayMessages}
                            renderItem={renderMessage}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.messagesList}
                            showsVerticalScrollIndicator={false}
                            style={styles.messagesFlatList}
                            onScrollToIndexFailed={(info) => {
                                const wait = new Promise(resolve => setTimeout(resolve, 500));
                                wait.then(() => {
                                    flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                                });
                            }}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={handleRefresh}
                                    tintColor={Colors.primary}
                                    colors={[Colors.primary]}
                                />
                            }
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

            {/* Options Modal */}
            <OptionsModal
                ref={optionsModalRef}
                items={chatMenuItems}
                position="top-right"
            />
        </View >
    );
}

export default ChatScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.primary,
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
    headerAvatarContainer: {
        position: "relative",
        marginRight: 12,
    },
    headerAvatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        overflow: "hidden",
    },
    onlineBadge: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#34C759",
        borderWidth: 2,
        borderColor: Colors.primary,
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
        color: Colors.white,
        fontSize: 18,
        fontWeight: "600",
    },
    headerInfo: {
        flex: 1,
    },
    headerName: {
        color: Colors.white,
        fontSize: 17,
        fontWeight: "600",
    },
    headerStatus: {
        color: Colors.whiteOpacity,
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
        backgroundColor: Colors.shadowDark,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    dateHeaderText: {
        color: Colors.white,
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
        backgroundColor: Colors.white,
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
        color: Colors.black,
        lineHeight: 22,
    },
    messageTextMe: {
        color: Colors.black,
    },
    messageFooter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        marginTop: 2,
    },
    timeText: {
        fontSize: 12,
        color: Colors.textLight,
    },
    timeTextMe: {
        color: Colors.messageTimeMe,
    },
    editedText: {
        fontSize: 12,
        color: Colors.textLight,
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
        backgroundColor: Colors.shadowDark,
    },
    videoParticipants: {
        flexDirection: "row",
    },
    videoNames: {
        color: Colors.white,
        fontSize: 13,
        fontWeight: "600",
    },
    videoDuration: {
        color: Colors.whiteOpacity,
        fontSize: 12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
