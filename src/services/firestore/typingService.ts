import firestore from "@react-native-firebase/firestore";
import { TypingStatus } from "../../types/firestore.types";

const CHATS_COLLECTION = "chats";
const TYPING_SUBCOLLECTION = "typing";

/**
 * Typing Indicator Service
 * Manages real-time typing status for chat participants
 */
export const TypingService = {
    /**
     * Get reference to typing subcollection for a chat
     */
    getTypingCollection: (chatId: string) =>
        firestore()
            .collection(CHATS_COLLECTION)
            .doc(chatId)
            .collection(TYPING_SUBCOLLECTION),

    /**
     * Get reference to a specific user's typing status
     */
    getTypingDocRef: (chatId: string, userId: string) =>
        TypingService.getTypingCollection(chatId).doc(userId),

    /**
     * Set typing status for a user in a chat
     * @param chatId - The chat ID
     * @param userId - The user ID who is typing
     * @param isTyping - Whether the user is typing
     */
    setTypingStatus: async (
        chatId: string,
        userId: string,
        isTyping: boolean
    ): Promise<void> => {
        try {
            const typingRef = TypingService.getTypingDocRef(chatId, userId);

            if (isTyping) {
                // Set typing status with current timestamp
                await typingRef.set({
                    userId,
                    isTyping: true,
                    timestamp: firestore.FieldValue.serverTimestamp(),
                });
            } else {
                // Delete the typing status document when user stops typing
                await typingRef.delete();
            }
        } catch (error) {
            console.error("Error setting typing status:", error);
            // Don't throw - typing indicators are non-critical
        }
    },

    /**
     * Subscribe to typing status changes in a chat
     * Auto-filters out expired typing indicators (>5 seconds old)
     * @param chatId - The chat ID
     * @param currentUserId - Current user's ID (to exclude from results)
     * @param onUpdate - Callback with array of users currently typing
     * @param onError - Error callback
     */
    subscribeToTypingStatus: (
        chatId: string,
        currentUserId: string,
        onUpdate: (typingUsers: TypingStatus[]) => void,
        onError?: (error: Error) => void
    ) => {
        return TypingService.getTypingCollection(chatId).onSnapshot(
            (snapshot) => {
                const now = new Date();
                const fiveSecondsAgo = new Date(now.getTime() - 5000);

                const typingUsers = snapshot.docs
                    .map((doc) => doc.data() as TypingStatus)
                    .filter((status) => {
                        // Filter out current user
                        if (status.userId === currentUserId) return false;

                        // Filter out expired typing indicators
                        if (status.timestamp) {
                            const typingTime = status.timestamp.toDate();
                            if (typingTime < fiveSecondsAgo) {
                                // Clean up expired document in background
                                TypingService.getTypingDocRef(chatId, status.userId)
                                    .delete()
                                    .catch(() => {
                                        /* ignore cleanup errors */
                                    });
                                return false;
                            }
                        }

                        return status.isTyping;
                    });

                onUpdate(typingUsers);
            },
            (error) => {
                console.error("Error in typing status subscription:", error);
                onError?.(error);
            }
        );
    },

    /**
     * Clear typing status for a user (useful on unmount)
     * @param chatId - The chat ID
     * @param userId - The user ID
     */
    clearTypingStatus: async (chatId: string, userId: string): Promise<void> => {
        try {
            await TypingService.getTypingDocRef(chatId, userId).delete();
        } catch (error) {
            console.error("Error clearing typing status:", error);
            // Don't throw - typing indicators are non-critical
        }
    },

    /**
     * Clear all expired typing indicators for a chat
     * Can be called periodically for cleanup
     * @param chatId - The chat ID
     */
    clearExpiredTypingStatus: async (chatId: string): Promise<void> => {
        try {
            const snapshot = await TypingService.getTypingCollection(chatId).get();
            const now = new Date();
            const fiveSecondsAgo = new Date(now.getTime() - 5000);

            const batch = firestore().batch();
            let deleteCount = 0;

            snapshot.docs.forEach((doc) => {
                const status = doc.data() as TypingStatus;
                if (status.timestamp) {
                    const typingTime = status.timestamp.toDate();
                    if (typingTime < fiveSecondsAgo) {
                        batch.delete(doc.ref);
                        deleteCount++;
                    }
                }
            });

            if (deleteCount > 0) {
                await batch.commit();
                console.log(`Cleared ${deleteCount} expired typing indicators`);
            }
        } catch (error) {
            console.error("Error clearing expired typing status:", error);
        }
    },
};

export default TypingService;
