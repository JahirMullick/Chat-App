import firestore from "@react-native-firebase/firestore";
import { Message, MessageStatus } from "../../types/firestore.types";
import { ChatService } from "./chatService";

const CHATS_COLLECTION = "chats";
const MESSAGES_SUBCOLLECTION = "messages";

/**
 * Message Service - Handles all message-related Firestore operations
 */
export const MessageService = {
    /**
     * Get reference to messages subcollection for a chat
     */
    getCollection: (chatId: string) =>
        firestore()
            .collection(CHATS_COLLECTION)
            .doc(chatId)
            .collection(MESSAGES_SUBCOLLECTION),

    /**
     * Get reference to a specific message document
     */
    getDocRef: (chatId: string, messageId: string) =>
        firestore()
            .collection(CHATS_COLLECTION)
            .doc(chatId)
            .collection(MESSAGES_SUBCOLLECTION)
            .doc(messageId),

    /**
     * Send a new message
     */
    sendMessage: async (
        chatId: string,
        senderId: string,
        senderName: string,
        text: string,
        options?: {
            mediaUrl?: string;
            mediaType?: "image" | "video" | "audio" | "document";
            mediaThumbnail?: string;
            replyTo?: {
                messageId: string;
                text: string;
                senderId: string;
                senderName: string;
            };
        }
    ): Promise<string> => {
        try {
            const now = firestore.FieldValue.serverTimestamp();

            const messageData: Omit<Message, "id"> = {
                chatId,
                senderId,
                senderName,
                text,
                timestamp: now as any,
                status: "sent",
                isEdited: false,
                readBy: [senderId], // Sender has "read" their own message
                ...(options?.mediaUrl && { mediaUrl: options.mediaUrl }),
                ...(options?.mediaType && { mediaType: options.mediaType }),
                ...(options?.mediaThumbnail && { mediaThumbnail: options.mediaThumbnail }),
                ...(options?.replyTo && { replyTo: options.replyTo }),
            };

            // Add message to subcollection
            const messageRef = await MessageService.getCollection(chatId).add(messageData);

            // Update chat's last message
            await ChatService.updateLastMessage(chatId, text, senderId);

            // Increment unread counts for other participants
            await ChatService.incrementUnreadCounts(chatId, senderId);

            console.log("Message sent:", messageRef.id);
            return messageRef.id;
        } catch (error) {
            console.error("Error sending message:", error);
            throw error;
        }
    },

    /**
     * Get messages for a chat (paginated)
     */
    getMessages: async (
        chatId: string,
        limit: number = 50,
        startAfter?: Message
    ): Promise<Message[]> => {
        try {
            let query = MessageService.getCollection(chatId)
                .orderBy("timestamp", "desc")
                .limit(limit);

            if (startAfter?.timestamp) {
                query = query.startAfter(startAfter.timestamp);
            }

            const snapshot = await query.get();
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            } as Message));
        } catch (error) {
            console.error("Error getting messages:", error);
            throw error;
        }
    },

    /**
     * Subscribe to messages (real-time)
     */
    subscribeToMessages: (
        chatId: string,
        onUpdate: (messages: Message[]) => void,
        onError?: (error: Error) => void,
        limit: number = 50
    ) => {
        return MessageService.getCollection(chatId)
            .orderBy("timestamp", "desc")
            .limit(limit)
            .onSnapshot(
                (snapshot) => {
                    const messages = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    } as Message));
                    onUpdate(messages);
                },
                (error) => {
                    console.error("Error in messages subscription:", error);
                    onError?.(error);
                }
            );
    },

    /**
     * Mark message as read by user
     */
    markMessageAsRead: async (
        chatId: string,
        messageId: string,
        userId: string
    ): Promise<void> => {
        try {
            await MessageService.getDocRef(chatId, messageId).update({
                readBy: firestore.FieldValue.arrayUnion(userId),
            });
        } catch (error) {
            console.error("Error marking message as read:", error);
            throw error;
        }
    },

    /**
     * Mark all messages as read by user
     */
    markAllMessagesAsRead: async (
        chatId: string,
        userId: string
    ): Promise<void> => {
        try {
            // Get unread messages for this user
            const snapshot = await MessageService.getCollection(chatId)
                .where("senderId", "!=", userId)
                .get();

            if (snapshot.empty) return;

            const batch = firestore().batch();
            
            snapshot.docs.forEach(doc => {
                const message = doc.data();
                if (!message.readBy?.includes(userId)) {
                    batch.update(doc.ref, {
                        readBy: firestore.FieldValue.arrayUnion(userId),
                    });
                }
            });

            await batch.commit();
            
            // Also update chat's unread count
            await ChatService.markChatAsRead(userId, chatId);
        } catch (error) {
            console.error("Error marking all messages as read:", error);
            throw error;
        }
    },

    /**
     * Update message status
     */
    updateMessageStatus: async (
        chatId: string,
        messageId: string,
        status: MessageStatus
    ): Promise<void> => {
        try {
            await MessageService.getDocRef(chatId, messageId).update({
                status,
            });
        } catch (error) {
            console.error("Error updating message status:", error);
            throw error;
        }
    },

    /**
     * Edit message text
     */
    editMessage: async (
        chatId: string,
        messageId: string,
        newText: string
    ): Promise<void> => {
        try {
            await MessageService.getDocRef(chatId, messageId).update({
                text: newText,
                isEdited: true,
                editedAt: firestore.FieldValue.serverTimestamp(),
            });
        } catch (error) {
            console.error("Error editing message:", error);
            throw error;
        }
    },

    /**
     * Delete message
     */
    deleteMessage: async (chatId: string, messageId: string): Promise<void> => {
        try {
            await MessageService.getDocRef(chatId, messageId).delete();
            console.log("Message deleted:", messageId);
        } catch (error) {
            console.error("Error deleting message:", error);
            throw error;
        }
    },

    /**
     * Delete all messages in a chat (admin only)
     */
    deleteAllMessages: async (chatId: string): Promise<void> => {
        try {
            const snapshot = await MessageService.getCollection(chatId).get();
            
            if (snapshot.empty) return;

            // Delete in batches of 500 (Firestore limit)
            const batchSize = 500;
            const batches: FirebaseFirestoreTypes.WriteBatch[] = [];
            let currentBatch = firestore().batch();
            let operationCount = 0;

            snapshot.docs.forEach(doc => {
                currentBatch.delete(doc.ref);
                operationCount++;

                if (operationCount >= batchSize) {
                    batches.push(currentBatch);
                    currentBatch = firestore().batch();
                    operationCount = 0;
                }
            });

            if (operationCount > 0) {
                batches.push(currentBatch);
            }

            await Promise.all(batches.map(batch => batch.commit()));
            console.log("All messages deleted for chat:", chatId);
        } catch (error) {
            console.error("Error deleting all messages:", error);
            throw error;
        }
    },

    /**
     * Get message by ID
     */
    getMessageById: async (chatId: string, messageId: string): Promise<Message | null> => {
        try {
            const doc = await MessageService.getDocRef(chatId, messageId).get();
            if (doc.exists()) {
                return { id: doc.id, ...doc.data() } as Message;
            }
            return null;
        } catch (error) {
            console.error("Error getting message:", error);
            throw error;
        }
    },

    /**
     * Search messages in a chat
     */
    searchMessages: async (
        chatId: string,
        searchTerm: string,
        limit: number = 20
    ): Promise<Message[]> => {
        try {
            // Note: Firestore doesn't support full-text search natively
            // This is a simple prefix search, for better search consider Algolia or similar
            const snapshot = await MessageService.getCollection(chatId)
                .where("text", ">=", searchTerm)
                .where("text", "<=", searchTerm + "\uf8ff")
                .limit(limit)
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            } as Message));
        } catch (error) {
            console.error("Error searching messages:", error);
            throw error;
        }
    },
};

// Import type for batch
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export default MessageService;
