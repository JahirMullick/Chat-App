import firestore from "@react-native-firebase/firestore";
import { MessageReaction } from "../../types/firestore.types";

const CHATS_COLLECTION = "chats";
const MESSAGES_SUBCOLLECTION = "messages";

/**
 * Reaction Service
 * Manages message reactions for both individual and group chats
 */
export const ReactionService = {
    /**
     * Get reference to messages collection
     */
    getMessagesCollection: (chatId: string) =>
        firestore()
            .collection(CHATS_COLLECTION)
            .doc(chatId)
            .collection(MESSAGES_SUBCOLLECTION),

    /**
     * Get reference to a specific message
     */
    getMessageRef: (chatId: string, messageId: string) =>
        ReactionService.getMessagesCollection(chatId).doc(messageId),

    /**
     * Add or remove a reaction to/from a message
     * If user already reacted with this emoji, it removes the reaction
     * If user hasn't reacted with this emoji, it adds the reaction
     * 
     * @param chatId - The chat ID
     * @param messageId - The message ID
     * @param userId - The user ID adding/removing the reaction
     * @param emoji - The emoji reaction (e.g., "👍", "❤️", "😂")
     */
    toggleReaction: async (
        chatId: string,
        messageId: string,
        userId: string,
        emoji: string
    ): Promise<void> => {
        try {
            const messageRef = ReactionService.getMessageRef(chatId, messageId);
            const messageDoc = await messageRef.get();

            if (!messageDoc.exists) {
                console.error("Message not found:", messageId);
                return;
            }

            const messageData = messageDoc.data();
            const reactions = messageData?.reactions || {};
            const existingReaction: MessageReaction | undefined = reactions[emoji];

            // Check if user already reacted with this SAME emoji - remove it
            if (existingReaction && existingReaction.userIds.includes(userId)) {
                const updatedUserIds = existingReaction.userIds.filter(id => id !== userId);

                if (updatedUserIds.length === 0) {
                    // No more users with this reaction - delete the emoji key
                    await messageRef.update({
                        [`reactions.${emoji}`]: firestore.FieldValue.delete(),
                    });
                } else {
                    // Update the reaction with remaining users
                    await messageRef.update({
                        [`reactions.${emoji}`]: {
                            emoji,
                            userIds: updatedUserIds,
                            count: updatedUserIds.length,
                        },
                    });
                }
            } else {
                // User wants to add a NEW reaction
                // First, remove user from ALL other reactions (one reaction per user rule)
                const updateObj: any = {};
                
                for (const [reactionEmoji, reactionData] of Object.entries(reactions)) {
                    const reaction = reactionData as MessageReaction;
                    if (reaction.userIds.includes(userId)) {
                        const updatedUserIds = reaction.userIds.filter(id => id !== userId);
                        
                        if (updatedUserIds.length === 0) {
                            // Delete this reaction completely
                            updateObj[`reactions.${reactionEmoji}`] = firestore.FieldValue.delete();
                        } else {
                            // Update with remaining users
                            updateObj[`reactions.${reactionEmoji}`] = {
                                emoji: reactionEmoji,
                                userIds: updatedUserIds,
                                count: updatedUserIds.length,
                            };
                        }
                    }
                }

                // Now add the new reaction
                const updatedUserIds = existingReaction
                    ? [...existingReaction.userIds, userId]
                    : [userId];

                updateObj[`reactions.${emoji}`] = {
                    emoji,
                    userIds: updatedUserIds,
                    count: updatedUserIds.length,
                };

                await messageRef.update(updateObj);
            }

            console.log(`✅ Reaction ${emoji} toggled for message ${messageId}`);
        } catch (error) {
            console.error("Error toggling reaction:", error);
            throw error;
        }
    },

    /**
     * Add a reaction to a message
     * If user already reacted with this emoji, does nothing
     * 
     * @param chatId - The chat ID
     * @param messageId - The message ID
     * @param userId - The user ID adding the reaction
     * @param emoji - The emoji reaction
     */
    addReaction: async (
        chatId: string,
        messageId: string,
        userId: string,
        emoji: string
    ): Promise<void> => {
        try {
            const messageRef = ReactionService.getMessageRef(chatId, messageId);
            const messageDoc = await messageRef.get();

            if (!messageDoc.exists) {
                console.error("Message not found:", messageId);
                return;
            }

            const messageData = messageDoc.data();
            const reactions = messageData?.reactions || {};
            const existingReaction: MessageReaction | undefined = reactions[emoji];

            // Check if user already reacted with this emoji
            if (existingReaction && existingReaction.userIds.includes(userId)) {
                console.log("User already reacted with this emoji");
                return;
            }

            // Add the user to the reaction
            const updatedUserIds = existingReaction
                ? [...existingReaction.userIds, userId]
                : [userId];

            await messageRef.update({
                [`reactions.${emoji}`]: {
                    emoji,
                    userIds: updatedUserIds,
                    count: updatedUserIds.length,
                },
            });

            console.log(`✅ Reaction ${emoji} added to message ${messageId}`);
        } catch (error) {
            console.error("Error adding reaction:", error);
            throw error;
        }
    },

    /**
     * Remove a reaction from a message
     * 
     * @param chatId - The chat ID
     * @param messageId - The message ID
     * @param userId - The user ID removing the reaction
     * @param emoji - The emoji reaction to remove
     */
    removeReaction: async (
        chatId: string,
        messageId: string,
        userId: string,
        emoji: string
    ): Promise<void> => {
        try {
            const messageRef = ReactionService.getMessageRef(chatId, messageId);
            const messageDoc = await messageRef.get();

            if (!messageDoc.exists) {
                console.error("Message not found:", messageId);
                return;
            }

            const messageData = messageDoc.data();
            const reactions = messageData?.reactions || {};
            const existingReaction: MessageReaction | undefined = reactions[emoji];

            if (!existingReaction || !existingReaction.userIds.includes(userId)) {
                console.log("User hasn't reacted with this emoji");
                return;
            }

            // Remove the user from the reaction
            const updatedUserIds = existingReaction.userIds.filter(id => id !== userId);

            if (updatedUserIds.length === 0) {
                // No more users with this reaction - delete the emoji key
                await messageRef.update({
                    [`reactions.${emoji}`]: firestore.FieldValue.delete(),
                });
            } else {
                // Update the reaction with remaining users
                await messageRef.update({
                    [`reactions.${emoji}`]: {
                        emoji,
                        userIds: updatedUserIds,
                        count: updatedUserIds.length,
                    },
                });
            }

            console.log(`✅ Reaction ${emoji} removed from message ${messageId}`);
        } catch (error) {
            console.error("Error removing reaction:", error);
            throw error;
        }
    },

    /**
     * Get all reactions for a message
     * 
     * @param chatId - The chat ID
     * @param messageId - The message ID
     * @returns Object with emoji reactions
     */
    getReactions: async (
        chatId: string,
        messageId: string
    ): Promise<{ [emoji: string]: MessageReaction } | null> => {
        try {
            const messageDoc = await ReactionService.getMessageRef(chatId, messageId).get();

            if (!messageDoc.exists) {
                console.error("Message not found:", messageId);
                return null;
            }

            const messageData = messageDoc.data();
            return messageData?.reactions || {};
        } catch (error) {
            console.error("Error getting reactions:", error);
            throw error;
        }
    },

    /**
     * Remove all reactions from a message
     * 
     * @param chatId - The chat ID
     * @param messageId - The message ID
     */
    clearAllReactions: async (chatId: string, messageId: string): Promise<void> => {
        try {
            await ReactionService.getMessageRef(chatId, messageId).update({
                reactions: firestore.FieldValue.delete(),
            });

            console.log(`✅ All reactions cleared from message ${messageId}`);
        } catch (error) {
            console.error("Error clearing reactions:", error);
            throw error;
        }
    },

    /**
     * Get list of users who reacted with a specific emoji
     * 
     * @param chatId - The chat ID
     * @param messageId - The message ID
     * @param emoji - The emoji reaction
     * @returns Array of user IDs
     */
    getUsersWhoReacted: async (
        chatId: string,
        messageId: string,
        emoji: string
    ): Promise<string[]> => {
        try {
            const reactions = await ReactionService.getReactions(chatId, messageId);
            const reaction = reactions?.[emoji];
            return reaction?.userIds || [];
        } catch (error) {
            console.error("Error getting users who reacted:", error);
            return [];
        }
    },

    /**
     * Check if a user has reacted to a message with a specific emoji
     * 
     * @param chatId - The chat ID
     * @param messageId - The message ID
     * @param userId - The user ID to check
     * @param emoji - The emoji reaction
     * @returns Boolean indicating if user reacted
     */
    hasUserReacted: async (
        chatId: string,
        messageId: string,
        userId: string,
        emoji: string
    ): Promise<boolean> => {
        try {
            const users = await ReactionService.getUsersWhoReacted(chatId, messageId, emoji);
            return users.includes(userId);
        } catch (error) {
            console.error("Error checking user reaction:", error);
            return false;
        }
    },
};

export default ReactionService;
