import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

// User types
export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    isOnline: boolean;
    lastSeen: FirebaseFirestoreTypes.Timestamp | null;
    createdAt: FirebaseFirestoreTypes.Timestamp;
    updatedAt: FirebaseFirestoreTypes.Timestamp;
    phoneNumber?: string | null;
    bio?: string;
    pushToken?: string;
    fcmToken?: string;
    lastTokenUpdate?: FirebaseFirestoreTypes.Timestamp;
    profileCompleted?: boolean;
    gender?: string;
    dateOfBirth?: string;
}

// Story types
export interface Story {
    id: string;
    userId: string;
    userName: string;
    userPhotoURL: string | null;
    mediaUrl: string;
    mediaType: "image" | "video";
    caption?: string;
    createdAt: FirebaseFirestoreTypes.Timestamp;
    expiresAt: FirebaseFirestoreTypes.Timestamp;
    viewers: string[]; // array of userIds who viewed
}

export interface StoryGroup {
    userId: string;
    userName: string;
    userPhotoURL: string | null;
    stories: Story[];
    hasUnseenStory: boolean;
    latestStoryTime: FirebaseFirestoreTypes.Timestamp;
}

// Chat types
export type ChatType = "individual" | "group";
export type MessageStatus = "sending" | "sent" | "delivered" | "read";
export type ChatCategory = "groups" | "channels" | "bots" | "design" | "books" | "ai" | "sign";
export type MessageType = "text" | "image" | "video" | "audio" | "document";

export interface Chat {
    id: string;
    type: ChatType;
    participants: string[]; // userIds
    participantDetails: { [userId: string]: ParticipantInfo };
    lastMessage: string;
    lastMessageType?: MessageType; // Type of the last message (for preview)
    lastMessageSenderId: string;
    lastMessageTime: FirebaseFirestoreTypes.Timestamp;
    createdBy: string;
    createdAt: FirebaseFirestoreTypes.Timestamp;
    updatedAt: FirebaseFirestoreTypes.Timestamp;
    // Group-specific fields
    name?: string; // for groups
    description?: string;
    avatarUrl?: string;
    avatarColor?: string;
    category?: ChatCategory;
    isVerified?: boolean;
    admins?: string[]; // userIds who are admins (for groups)
}

export interface ParticipantInfo {
    displayName: string | null;
    photoURL: string | null;
    isOnline?: boolean;
}

// Message Reaction
export interface MessageReaction {
    emoji: string;
    userIds: string[]; // Array of userIds who reacted with this emoji
    count: number;
}

export interface Message {
    id: string;
    chatId: string;
    senderId: string;
    senderName: string;
    senderPhotoURL?: string | null;
    receiverId?: string | null;
    text: string;
    timestamp: FirebaseFirestoreTypes.Timestamp;
    status: MessageStatus;
    isEdited: boolean;
    editedAt?: FirebaseFirestoreTypes.Timestamp;
    mediaUrl?: string;
    mediaType?: "image" | "video" | "audio" | "document";
    mediaThumbnail?: string;
    replyTo?: {
        messageId: string;
        text: string;
        senderId: string;
        senderName: string;
    };
    reactions?: { [emoji: string]: MessageReaction }; // Emoji -> Reaction mapping
    readBy: string[]; // userIds who have read this message
    deletedFor?: string[]; // userIds who deleted this message for themselves
}

// User's chat metadata (for each user's perspective of a chat)
export interface UserChat {
    chatId: string;
    unreadCount: number;
    isMuted: boolean;
    isPinned: boolean;
    isArchived: boolean;
    isHidden: boolean; // Hide chat until recipient sends first message
    lastReadAt: FirebaseFirestoreTypes.Timestamp | null;
    joinedAt: FirebaseFirestoreTypes.Timestamp;
}

/**
 * Get display preview text for media messages
 */
export const getMessagePreview = (messageType: MessageType | undefined, text: string): string => {
    if (!messageType || messageType === "text") return text;
    
    switch (messageType) {
        case "image":
            return "📷 Photo";
        case "video":
            return "🎥 Video";
        case "audio":
            return "🎵 Audio";
        case "document":
            return "📎 File";
        default:
            return text;
    }
};

// Tab types
export interface Tab {
    id: string;
    label: string;
    count: number;
    isActive: boolean;
    order: number;
    category?: ChatCategory;
    chatIds?: string[]; // Array of chat IDs included in this folder
}

// Typing indicator
export interface TypingStatus {
    userId: string;
    isTyping: boolean;
    timestamp: FirebaseFirestoreTypes.Timestamp;
}

// For creating new documents (without id and timestamps)
export type CreateUserProfile = Omit<UserProfile, "uid" | "createdAt" | "updatedAt">;
export type CreateStory = Omit<Story, "id" | "createdAt" | "expiresAt" | "viewers">;
export type CreateChat = Omit<Chat, "id" | "createdAt" | "updatedAt" | "lastMessage" | "lastMessageTime" | "lastMessageSenderId">;
export type CreateMessage = Omit<Message, "id" | "timestamp" | "status" | "isEdited" | "readBy">;
