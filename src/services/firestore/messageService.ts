import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { Message, MessageStatus, MessageType } from "../../types/firestore.types";
import { ChatService } from "./chatService";

const CHATS_COLLECTION = "chats";
const MESSAGES_SUBCOLLECTION = "messages";

/**
 * Message Service - Handles all message-related Firestore operations
 */
// export const MessageService = {
//     /**
//      * Get reference to messages subcollection for a chat
//      */
//     getCollection: (chatId: string) =>
//         firestore()
//             .collection(CHATS_COLLECTION)
//             .doc(chatId)
//             .collection(MESSAGES_SUBCOLLECTION),

//     /**
//      * Get reference to a specific message document
//      */
//     getDocRef: (chatId: string, messageId: string) =>
//         firestore()
//             .collection(CHATS_COLLECTION)
//             .doc(chatId)
//             .collection(MESSAGES_SUBCOLLECTION)
//             .doc(messageId),

//     /**
//      * Send a new message
//      */
//     sendMessage: async (
//         chatId: string,
//         senderId: string,
//         senderName: string,
//         text: string,
//         options?: {
//             mediaUrl?: string;
//             receiverId?: string;
//             mediaType?: "image" | "video" | "audio" | "document";
//             mediaThumbnail?: string;
//             senderPhotoURL?: string | null;
//             replyTo?: {
//                 messageId: string;
//                 text: string;
//                 senderId: string;
//                 senderName: string;
//             };
//         }
//     ): Promise<string> => {
//         try {
//             const now = firestore.FieldValue.serverTimestamp();

//             const messageData: Omit<Message, "id"> = {
//                 chatId,
//                 senderId,
//                 senderName,
//                 senderPhotoURL: options?.senderPhotoURL || null,
//                 text,
//                 timestamp: now as any,
//                 status: "sent",
//                 isEdited: false,
//                 readBy: [senderId], // Sender has "read" their own message
//                 ...(options?.mediaUrl && { mediaUrl: options.mediaUrl }),
//                 ...(options?.mediaType && { mediaType: options.mediaType }),
//                 ...(options?.mediaThumbnail && { mediaThumbnail: options.mediaThumbnail }),
//                 ...(options?.replyTo && { replyTo: options.replyTo }),
//             };

//             // Add message to subcollection
//             const messageRef = await MessageService.getCollection(chatId).add(messageData);
//             console.log("✅ Message added to Firestore:", messageRef.id);

//             // Update chat's last message
//             await ChatService.updateLastMessage(chatId, text, senderId);
//             console.log("✅ Chat lastMessage updated");

//             // Increment unread counts for other participants
//             await ChatService.incrementUnreadCounts(chatId, senderId);
//             console.log("✅ Unread counts incremented");

//             // Unhide chat for all participants who have it hidden
//             console.log("🔓 Starting unhideChat...");
//             await ChatService.unhideChat(senderId, chatId);
//             console.log("✅ UnhideChat completed");

//             // Send push notification to other participants
//             try {
//                 const chatDoc = await firestore().collection(CHATS_COLLECTION).doc(chatId).get();
//                 const chatData = chatDoc.data();

//                 if (chatData?.participants) {
//                     await NotificationService.sendChatNotification(
//                         chatId,
//                         senderId,
//                         senderName,
//                         text,
//                         chatData.participants
//                     );
//                     console.log("✅ Push notifications sent");
//                 }
//             } catch (notifError) {
//                 console.error("Error sending push notification:", notifError);
//                 // Don't throw - notification failure shouldn't block message sending
//             }

//             console.log("✅ Message sent successfully:", messageRef.id);
//             return messageRef.id;
//         } catch (error) {
//             console.error("Error sending message:", error);
//             throw error;
//         }
//     },

//     /**
//      * Get messages for a chat (paginated)
//      */
//     getMessages: async (
//         chatId: string,
//         limit: number = 50,
//         startAfter?: Message
//     ): Promise<Message[]> => {
//         try {
//             let query = MessageService.getCollection(chatId)
//                 .orderBy("timestamp", "desc")
//                 .limit(limit);

//             if (startAfter?.timestamp) {
//                 query = query.startAfter(startAfter.timestamp);
//             }

//             const snapshot = await query.get();

//             return snapshot.docs.map(doc => ({
//                 id: doc.id,
//                 ...doc.data(),
//             } as Message));
//         } catch (error) {
//             console.error("Error getting messages:", error);
//             throw error;
//         }
//     },

//     /**
//      * Subscribe to messages (real-time)
//      */
//     subscribeToMessages: (
//         chatId: string,
//         onUpdate: (messages: Message[]) => void,
//         onError?: (error: Error) => void,
//         limit: number = 50
//     ) => {
//         return MessageService.getCollection(chatId)
//             .orderBy("timestamp", "desc")
//             .limit(limit)
//             .onSnapshot(
//                 (snapshot) => {
//                     const messages = snapshot.docs.map(doc => ({
//                         id: doc.id,
//                         ...doc.data(),
//                     } as Message));
//                     onUpdate(messages);
//                 },
//                 (error) => {
//                     console.error("Error in messages subscription:", error);
//                     onError?.(error);
//                 }
//             );
//     },

//     /**
//      * Mark message as read by user
//      */
//     markMessageAsRead: async (
//         chatId: string,
//         messageId: string,
//         userId: string
//     ): Promise<void> => {
//         try {
//             await MessageService.getDocRef(chatId, messageId).update({
//                 readBy: firestore.FieldValue.arrayUnion(userId),
//             });
//         } catch (error) {
//             console.error("Error marking message as read:", error);
//             throw error;
//         }
//     },

//     /**
//      * Mark all messages as read by user
//      */
//     markAllMessagesAsRead: async (
//         chatId: string,
//         userId: string
//     ): Promise<void> => {
//         try {
//             // Get unread messages for this user
//             const snapshot = await MessageService.getCollection(chatId)
//                 .where("senderId", "!=", userId)
//                 .get();

//             if (snapshot.empty) return;

//             const batch = firestore().batch();

//             snapshot.docs.forEach(doc => {
//                 const message = doc.data();
//                 if (!message.readBy?.includes(userId)) {
//                     batch.update(doc.ref, {
//                         readBy: firestore.FieldValue.arrayUnion(userId),
//                     });
//                 }
//             });

//             await batch.commit();

//             // Also update chat's unread count
//             await ChatService.markChatAsRead(userId, chatId);
//         } catch (error) {
//             console.error("Error marking all messages as read:", error);
//             throw error;
//         }
//     },

//     /**
//      * Update message status
//      */
//     updateMessageStatus: async (
//         chatId: string,
//         messageId: string,
//         status: MessageStatus
//     ): Promise<void> => {
//         try {
//             await MessageService.getDocRef(chatId, messageId).update({
//                 status,
//             });
//         } catch (error) {
//             console.error("Error updating message status:", error);
//             throw error;
//         }
//     },

//     /**
//      * Edit message text
//      */
//     editMessage: async (
//         chatId: string,
//         messageId: string,
//         newText: string
//     ): Promise<void> => {
//         try {
//             await MessageService.getDocRef(chatId, messageId).update({
//                 text: newText,
//                 isEdited: true,
//                 editedAt: firestore.FieldValue.serverTimestamp(),
//             });
//         } catch (error) {
//             console.error("Error editing message:", error);
//             throw error;
//         }
//     },

//     /**
//      * Delete message (hard delete - removes for everyone)
//      */
//     deleteMessage: async (chatId: string, messageId: string): Promise<void> => {
//         try {
//             await MessageService.getDocRef(chatId, messageId).delete();
//             console.log("Message deleted:", messageId);
//         } catch (error) {
//             console.error("Error deleting message:", error);
//             throw error;
//         }
//     },

//     /**
//      * Delete message for me only (soft delete - adds userId to deletedFor array)
//      */
//     deleteMessageForMe: async (chatId: string, messageId: string, userId: string): Promise<void> => {
//         try {
//             await MessageService.getDocRef(chatId, messageId).update({
//                 deletedFor: firestore.FieldValue.arrayUnion(userId),
//             });
//             console.log("Message deleted for user:", userId);
//         } catch (error) {
//             console.error("Error deleting message for user:", error);
//             throw error;
//         }
//     },

//     /**
//      * Delete all messages in a chat (admin only)
//      */
//     deleteAllMessages: async (chatId: string): Promise<void> => {
//         try {
//             const snapshot = await MessageService.getCollection(chatId).get();

//             if (snapshot.empty) return;

//             // Delete in batches of 500 (Firestore limit)
//             const batchSize = 500;
//             const batches: FirebaseFirestoreTypes.WriteBatch[] = [];
//             let currentBatch = firestore().batch();
//             let operationCount = 0;

//             snapshot.docs.forEach(doc => {
//                 currentBatch.delete(doc.ref);
//                 operationCount++;

//                 if (operationCount >= batchSize) {
//                     batches.push(currentBatch);
//                     currentBatch = firestore().batch();
//                     operationCount = 0;
//                 }
//             });

//             if (operationCount > 0) {
//                 batches.push(currentBatch);
//             }

//             await Promise.all(batches.map(batch => batch.commit()));
//             console.log("All messages deleted for chat:", chatId);
//         } catch (error) {
//             console.error("Error deleting all messages:", error);
//             throw error;
//         }
//     },

//     /**
//      * Get message by ID
//      */
//     getMessageById: async (chatId: string, messageId: string): Promise<Message | null> => {
//         try {
//             const doc = await MessageService.getDocRef(chatId, messageId).get();
//             if (doc.exists()) {
//                 return { id: doc.id, ...doc.data() } as Message;
//             }
//             return null;
//         } catch (error) {
//             console.error("Error getting message:", error);
//             throw error;
//         }
//     },

//     /**
//      * Search messages in a chat
//      */
//     searchMessages: async (
//         chatId: string,
//         searchTerm: string,
//         limit: number = 20
//     ): Promise<Message[]> => {
//         try {
//             // Note: Firestore doesn't support full-text search natively
//             // This is a simple prefix search, for better search consider Algolia or similar
//             const snapshot = await MessageService.getCollection(chatId)
//                 .where("text", ">=", searchTerm)
//                 .where("text", "<=", searchTerm + "\uf8ff")
//                 .limit(limit)
//                 .get();

//             return snapshot.docs.map(doc => ({
//                 id: doc.id,
//                 ...doc.data(),
//             } as Message));
//         } catch (error) {
//             console.error("Error searching messages:", error);
//             throw error;
//         }
//     },
// };

// V2

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
            receiverId?: string;
            mediaType?: "image" | "video" | "audio" | "document";
            mediaThumbnail?: string;
            senderPhotoURL?: string | null;
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

            // ✅ FIX: Get receiverId from options or fetch from chat participants
            let receiverId = options?.receiverId;
            let participants: string[] = [];

            // Always fetch the chat doc so we have participants for later operations
            const chatDoc = await firestore()
                .collection(CHATS_COLLECTION)
                .doc(chatId)
                .get();

            const chatData = chatDoc.data();
            if (chatData) {
                participants = chatData?.participants || [];
                if (!receiverId) {
                    // Find the other participant (not the sender)
                    receiverId = participants.find((id: string) => id !== senderId);
                }
            }

            // ✅ FIX: Include receiverId in messageData
            const messageData: Omit<Message, "id"> = {
                chatId,
                senderId,
                senderName,
                senderPhotoURL: options?.senderPhotoURL || null,
                receiverId: receiverId || null, // ✅ ADD THIS LINE
                text,
                timestamp: now as any,
                status: "sent",
                isEdited: false,
                readBy: [senderId],
                deletedFor: [], // ✅ Initialize empty array
                ...(options?.mediaUrl && { mediaUrl: options.mediaUrl }),
                ...(options?.mediaType && { mediaType: options.mediaType }),
                ...(options?.mediaThumbnail && { mediaThumbnail: options.mediaThumbnail }),
                ...(options?.replyTo && { replyTo: options.replyTo }),
            };

            // ✅ Debug log
            console.log("📤 Sending message with data:", {
                chatId,
                senderId,
                receiverId,
                text: text.substring(0, 50),
            });

            // Add message to subcollection
            const messageRef = await MessageService.getCollection(chatId).add(messageData);
            console.log("✅ Message added to Firestore:", messageRef.id);

            // Clear any local overrides for all participants so this new message is displayed
            if (participants.length > 0) {
                await ChatService.clearLastMessageOverrides(chatId, participants);
                console.log("✅ Cleared lastMessage overrides");
            }

            // Update chat's last message (pass media type if present)
            await ChatService.updateLastMessage(
                chatId,
                text,
                senderId,
                options?.mediaType || "text"
            );
            console.log("✅ Chat lastMessage updated");

            // Increment unread counts for other participants
            await ChatService.incrementUnreadCounts(chatId, senderId);
            console.log("✅ Unread counts incremented");

            // Unhide chat for all participants who have it hidden
            console.log("🔓 Starting unhideChat...");
            await ChatService.unhideChat(senderId, chatId);
            console.log("✅ UnhideChat completed");

            // ✅ REMOVE OR COMMENT OUT THIS BLOCK
            // Cloud Function will handle push notifications now!
            // Keeping this would send duplicate notifications
            /*
            try {
                const chatDoc = await firestore().collection(CHATS_COLLECTION).doc(chatId).get();
                const chatData = chatDoc.data();
                
                if (chatData?.participants) {
                    await NotificationService.sendChatNotification(
                        chatId,
                        senderId,
                        senderName,
                        text,
                        chatData.participants
                    );
                    console.log("✅ Push notifications sent");
                }
            } catch (notifError) {
                console.error("Error sending push notification:", notifError);
            }
            */

            console.log("✅ Message sent successfully:", messageRef.id);
            return messageRef.id;
        } catch (error) {
            console.error("Error sending message:", error);
            throw error;
        }
    },

    // ... rest of your methods stay the same

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
     * Recalculates and updates the global last message for a chat after a message is deleted
     */
    updateLastMessageAfterDeletion: async (chatId: string): Promise<void> => {
        try {
            // Get the most recent message that hasn't been deleted globally
            const snapshot = await MessageService.getCollection(chatId)
                .orderBy("timestamp", "desc")
                .limit(1)
                .get();

            let lastMessageText = "";
            let lastMessageSenderId = "";
            let lastMessageType: MessageType | undefined = undefined;
            const now = firestore.FieldValue.serverTimestamp();

            if (!snapshot.empty) {
                const lastMessageData = snapshot.docs[0].data();
                lastMessageText = lastMessageData.text || "";
                lastMessageSenderId = lastMessageData.senderId || "";
                lastMessageType = lastMessageData.mediaType;

                await ChatService.getDocRef(chatId).update({
                    lastMessage: lastMessageText,
                    lastMessageSenderId: lastMessageSenderId,
                    lastMessageType: lastMessageType || firestore.FieldValue.delete(),
                    updatedAt: now,
                });
            } else {
                // Chat is completely empty now
                await ChatService.getDocRef(chatId).update({
                    lastMessage: "",
                    lastMessageSenderId: "",
                    lastMessageType: firestore.FieldValue.delete(),
                    updatedAt: now,
                });
            }
        } catch (error) {
            console.error("Error updating last message after deletion:", error);
        }
    },

    /**
     * Delete message (hard delete - removes for everyone)
     */
    deleteMessage: async (chatId: string, messageId: string): Promise<void> => {
        try {
            await MessageService.getDocRef(chatId, messageId).delete();
            console.log("Message deleted:", messageId);

            // Recalculate global last message
            await MessageService.updateLastMessageAfterDeletion(chatId);
        } catch (error) {
            console.error("Error deleting message:", error);
            throw error;
        }
    },

    /**
     * Delete message for me only
     */
    deleteMessageForMe: async (chatId: string, messageId: string, userId: string): Promise<void> => {
        try {
            await MessageService.getDocRef(chatId, messageId).update({
                deletedFor: firestore.FieldValue.arrayUnion(userId),
            });
            console.log("Message deleted for user:", userId);

            // Fetch the latest message that this user hasn't deleted to act as their local override
            const snapshot = await MessageService.getCollection(chatId)
                .orderBy("timestamp", "desc")
                .get();

            let lastValidMessageForUser = null;
            for (const doc of snapshot.docs) {
                const data = doc.data();
                if (!data.deletedFor?.includes(userId)) {
                    lastValidMessageForUser = data;
                    break;
                }
            }

            const userChatRef = ChatService.getUserChatsCollection(userId).doc(chatId);
            if (lastValidMessageForUser) {
                await userChatRef.update({
                    lastMessageOverride: lastValidMessageForUser.text || "",
                    lastMessageTypeOverride: lastValidMessageForUser.mediaType || firestore.FieldValue.delete(),
                    lastMessageTimeOverride: lastValidMessageForUser.timestamp || firestore.FieldValue.serverTimestamp(),
                });
            } else {
                await userChatRef.update({
                    lastMessageOverride: "",
                    lastMessageTypeOverride: firestore.FieldValue.delete(),
                    lastMessageTimeOverride: firestore.FieldValue.serverTimestamp(),
                });
            }

        } catch (error) {
            console.error("Error deleting message for user:", error);
            throw error;
        }
    },

    /**
     * Delete all messages in a chat
     */
    deleteAllMessages: async (chatId: string): Promise<void> => {
        try {
            const snapshot = await MessageService.getCollection(chatId).get();

            if (snapshot.empty) return;

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

export default MessageService;
