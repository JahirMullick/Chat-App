import firestore from "@react-native-firebase/firestore";
import {
  Chat,
  ChatCategory,
  ChatType,
  ParticipantInfo,
  UserChat
} from "../../types/firestore.types";
import { UserService } from "./userService";

const CHATS_COLLECTION = "chats";
const USER_CHATS_COLLECTION = "userChats";

/**
 * Chat Service - Handles all chat-related Firestore operations
 */
export const ChatService = {
    /**
     * Get reference to chats collection
     */
    getCollection: () => firestore().collection(CHATS_COLLECTION),

    /**
     * Get reference to a specific chat document
     */
    getDocRef: (chatId: string) => firestore().collection(CHATS_COLLECTION).doc(chatId),

    /**
     * Get reference to user's chats subcollection
     */
    getUserChatsCollection: (userId: string) =>
        firestore().collection(USER_CHATS_COLLECTION).doc(userId).collection("chats"),

    /**
     * Create a new individual (1-on-1) chat
     */
    createIndividualChat: async (
        currentUserId: string,
        otherUserId: string
    ): Promise<string> => {
        try {
            // Check if chat already exists between these users
            const existingChat = await ChatService.findIndividualChat(currentUserId, otherUserId);
            if (existingChat) {
                return existingChat.id;
            }

            // Get both users' details
            const [currentUser, otherUser] = await Promise.all([
                UserService.getUserById(currentUserId),
                UserService.getUserById(otherUserId),
            ]);

            const now = firestore.FieldValue.serverTimestamp();
            const participants = [currentUserId, otherUserId].sort(); // Sort for consistency

            const participantDetails: { [userId: string]: ParticipantInfo } = {
                [currentUserId]: {
                    displayName: currentUser?.displayName || null,
                    photoURL: currentUser?.photoURL || null,
                },
                [otherUserId]: {
                    displayName: otherUser?.displayName || null,
                    photoURL: otherUser?.photoURL || null,
                },
            };

            // Create chat document
            const chatRef = await ChatService.getCollection().add({
                type: "individual" as ChatType,
                participants,
                participantDetails,
                lastMessage: "",
                lastMessageSenderId: "",
                lastMessageTime: now,
                createdBy: currentUserId,
                createdAt: now,
                updatedAt: now,
            });

            // Create userChat entries for both users
            const batch = firestore().batch();
            
            for (const userId of participants) {
                const userChatRef = ChatService.getUserChatsCollection(userId).doc(chatRef.id);
                batch.set(userChatRef, {
                    chatId: chatRef.id,
                    unreadCount: 0,
                    isMuted: false,
                    isPinned: false,
                    isArchived: false,
                    lastReadAt: null,
                    joinedAt: now,
                });
            }

            await batch.commit();
            console.log("Individual chat created:", chatRef.id);
            return chatRef.id;
        } catch (error) {
            console.error("Error creating individual chat:", error);
            throw error;
        }
    },

    /**
     * Create a new group chat
     */
    createGroupChat: async (
        creatorId: string,
        memberIds: string[],
        groupName: string,
        options?: {
            description?: string;
            avatarUrl?: string;
            avatarColor?: string;
            category?: ChatCategory;
        }
    ): Promise<string> => {
        try {
            const allMembers = [...new Set([creatorId, ...memberIds])]; // Ensure unique members
            
            // Get all members' details
            const users = await UserService.getUsersByIds(allMembers);
            const participantDetails: { [userId: string]: ParticipantInfo } = {};
            
            users.forEach(user => {
                participantDetails[user.uid] = {
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                };
            });

            const now = firestore.FieldValue.serverTimestamp();

            // Create chat document
            const chatRef = await ChatService.getCollection().add({
                type: "group" as ChatType,
                participants: allMembers,
                participantDetails,
                lastMessage: "",
                lastMessageSenderId: "",
                lastMessageTime: now,
                createdBy: creatorId,
                createdAt: now,
                updatedAt: now,
                name: groupName,
                description: options?.description || "",
                avatarUrl: options?.avatarUrl || "",
                avatarColor: options?.avatarColor || "#007AFF",
                category: options?.category || "groups",
                admins: [creatorId],
            });

            // Create userChat entries for all members
            const batch = firestore().batch();
            
            for (const userId of allMembers) {
                const userChatRef = ChatService.getUserChatsCollection(userId).doc(chatRef.id);
                batch.set(userChatRef, {
                    chatId: chatRef.id,
                    unreadCount: 0,
                    isMuted: false,
                    isPinned: false,
                    isArchived: false,
                    lastReadAt: null,
                    joinedAt: now,
                });
            }

            await batch.commit();
            console.log("Group chat created:", chatRef.id);
            return chatRef.id;
        } catch (error) {
            console.error("Error creating group chat:", error);
            throw error;
        }
    },

    /**
     * Find existing individual chat between two users
     */
    findIndividualChat: async (userId1: string, userId2: string): Promise<Chat | null> => {
        try {
            const participants = [userId1, userId2].sort();
            
            const snapshot = await ChatService.getCollection()
                .where("type", "==", "individual")
                .where("participants", "==", participants)
                .limit(1)
                .get();

            if (snapshot.empty) return null;

            const doc = snapshot.docs[0];
            return { id: doc.id, ...doc.data() } as Chat;
        } catch (error) {
            console.error("Error finding individual chat:", error);
            throw error;
        }
    },

    /**
     * Get chat by ID
     */
    getChatById: async (chatId: string): Promise<Chat | null> => {
        try {
            const doc = await ChatService.getDocRef(chatId).get();
            if (doc.exists()) {
                return { id: doc.id, ...doc.data() } as Chat;
            }
            return null;
        } catch (error) {
            console.error("Error getting chat:", error);
            throw error;
        }
    },

    /**
     * Get user's chats with metadata
     */
    getUserChats: async (userId: string): Promise<{ chat: Chat; userChat: UserChat }[]> => {
        try {
            // Get user's chat references
            const userChatsSnapshot = await ChatService.getUserChatsCollection(userId)
                .orderBy("joinedAt", "desc")
                .get();

            if (userChatsSnapshot.empty) return [];

            const results: { chat: Chat; userChat: UserChat }[] = [];

            // Fetch each chat's details
            for (const userChatDoc of userChatsSnapshot.docs) {
                const userChat = userChatDoc.data() as UserChat;
                const chat = await ChatService.getChatById(userChat.chatId);
                
                if (chat) {
                    results.push({ chat, userChat });
                }
            }

            // Sort by last message time
            results.sort((a, b) => {
                const timeA = a.chat.lastMessageTime?.toMillis() || 0;
                const timeB = b.chat.lastMessageTime?.toMillis() || 0;
                return timeB - timeA;
            });

            return results;
        } catch (error) {
            console.error("Error getting user chats:", error);
            throw error;
        }
    },

    /**
     * Subscribe to user's chats (real-time)
     */
    subscribeToUserChats: (
        userId: string,
        onUpdate: (chats: { chat: Chat; userChat: UserChat }[]) => void,
        onError?: (error: Error) => void
    ) => {
        return ChatService.getUserChatsCollection(userId)
            .orderBy("joinedAt", "desc")
            .onSnapshot(
                async (snapshot) => {
                    try {
                        const results: { chat: Chat; userChat: UserChat }[] = [];

                        for (const doc of snapshot.docs) {
                            const userChat = doc.data() as UserChat;
                            const chat = await ChatService.getChatById(userChat.chatId);
                            
                            if (chat) {
                                results.push({ chat, userChat });
                            }
                        }

                        // Sort by last message time
                        results.sort((a, b) => {
                            const timeA = a.chat.lastMessageTime?.toMillis() || 0;
                            const timeB = b.chat.lastMessageTime?.toMillis() || 0;
                            return timeB - timeA;
                        });

                        onUpdate(results);
                    } catch (error) {
                        console.error("Error processing chat updates:", error);
                        onError?.(error as Error);
                    }
                },
                (error) => {
                    console.error("Error in chats subscription:", error);
                    onError?.(error);
                }
            );
    },

    /**
     * Update last message in chat (called by MessageService)
     */
    updateLastMessage: async (
        chatId: string,
        message: string,
        senderId: string
    ): Promise<void> => {
        try {
            await ChatService.getDocRef(chatId).update({
                lastMessage: message,
                lastMessageSenderId: senderId,
                lastMessageTime: firestore.FieldValue.serverTimestamp(),
                updatedAt: firestore.FieldValue.serverTimestamp(),
            });
        } catch (error) {
            console.error("Error updating last message:", error);
            throw error;
        }
    },

    /**
     * Increment unread count for all participants except sender
     */
    incrementUnreadCounts: async (chatId: string, senderId: string): Promise<void> => {
        try {
            const chat = await ChatService.getChatById(chatId);
            if (!chat) return;

            const batch = firestore().batch();
            
            for (const participantId of chat.participants) {
                if (participantId !== senderId) {
                    const userChatRef = ChatService.getUserChatsCollection(participantId).doc(chatId);
                    batch.update(userChatRef, {
                        unreadCount: firestore.FieldValue.increment(1),
                    });
                }
            }

            await batch.commit();
        } catch (error) {
            console.error("Error incrementing unread counts:", error);
            throw error;
        }
    },

    /**
     * Mark chat as read (reset unread count)
     */
    markChatAsRead: async (userId: string, chatId: string): Promise<void> => {
        try {
            await ChatService.getUserChatsCollection(userId).doc(chatId).update({
                unreadCount: 0,
                lastReadAt: firestore.FieldValue.serverTimestamp(),
            });
        } catch (error) {
            console.error("Error marking chat as read:", error);
            throw error;
        }
    },

    /**
     * Mute/unmute chat
     */
    toggleMute: async (userId: string, chatId: string, isMuted: boolean): Promise<void> => {
        try {
            await ChatService.getUserChatsCollection(userId).doc(chatId).update({
                isMuted,
            });
        } catch (error) {
            console.error("Error toggling mute:", error);
            throw error;
        }
    },

    /**
     * Pin/unpin chat
     */
    togglePin: async (userId: string, chatId: string, isPinned: boolean): Promise<void> => {
        try {
            await ChatService.getUserChatsCollection(userId).doc(chatId).update({
                isPinned,
            });
        } catch (error) {
            console.error("Error toggling pin:", error);
            throw error;
        }
    },

    /**
     * Archive/unarchive chat
     */
    toggleArchive: async (userId: string, chatId: string, isArchived: boolean): Promise<void> => {
        try {
            await ChatService.getUserChatsCollection(userId).doc(chatId).update({
                isArchived,
            });
        } catch (error) {
            console.error("Error toggling archive:", error);
            throw error;
        }
    },

    /**
     * Add member to group chat
     */
    addMemberToGroup: async (chatId: string, newMemberId: string): Promise<void> => {
        try {
            const chat = await ChatService.getChatById(chatId);
            if (!chat || chat.type !== "group") {
                throw new Error("Chat not found or not a group");
            }

            const newMember = await UserService.getUserById(newMemberId);
            if (!newMember) {
                throw new Error("User not found");
            }

            const now = firestore.FieldValue.serverTimestamp();

            // Update chat document
            await ChatService.getDocRef(chatId).update({
                participants: firestore.FieldValue.arrayUnion(newMemberId),
                [`participantDetails.${newMemberId}`]: {
                    displayName: newMember.displayName,
                    photoURL: newMember.photoURL,
                },
                updatedAt: now,
            });

            // Create userChat entry for new member
            await ChatService.getUserChatsCollection(newMemberId).doc(chatId).set({
                chatId,
                unreadCount: 0,
                isMuted: false,
                isPinned: false,
                isArchived: false,
                lastReadAt: null,
                joinedAt: now,
            });

            console.log("Member added to group:", newMemberId);
        } catch (error) {
            console.error("Error adding member to group:", error);
            throw error;
        }
    },

    /**
     * Remove member from group chat
     */
    removeMemberFromGroup: async (chatId: string, memberId: string): Promise<void> => {
        try {
            const now = firestore.FieldValue.serverTimestamp();

            // Update chat document
            await ChatService.getDocRef(chatId).update({
                participants: firestore.FieldValue.arrayRemove(memberId),
                [`participantDetails.${memberId}`]: firestore.FieldValue.delete(),
                updatedAt: now,
            });

            // Delete userChat entry
            await ChatService.getUserChatsCollection(memberId).doc(chatId).delete();

            console.log("Member removed from group:", memberId);
        } catch (error) {
            console.error("Error removing member from group:", error);
            throw error;
        }
    },

    /**
     * Delete chat (for current user only - leaves the chat)
     */
    leaveChat: async (userId: string, chatId: string): Promise<void> => {
        try {
            const chat = await ChatService.getChatById(chatId);
            if (!chat) return;

            if (chat.type === "group") {
                await ChatService.removeMemberFromGroup(chatId, userId);
            } else {
                // For individual chats, just remove from user's list
                await ChatService.getUserChatsCollection(userId).doc(chatId).delete();
            }

            console.log("User left chat:", chatId);
        } catch (error) {
            console.error("Error leaving chat:", error);
            throw error;
        }
    },
};

export default ChatService;
