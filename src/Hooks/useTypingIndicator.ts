import { useCallback, useEffect, useRef, useState } from "react";
import { TypingService } from "../services/firestore";
import { TypingStatus } from "../types/firestore.types";

/**
 * Hook to manage typing status in a chat
 * @param chatId - The chat ID
 * @param currentUserId - Current user's ID
 * @returns Object with typing status and control functions
 */
export const useTypingIndicator = (chatId: string, currentUserId: string) => {
    const [typingUsers, setTypingUsers] = useState<TypingStatus[]>([]);
    const [isCurrentUserTyping, setIsCurrentUserTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Subscribe to typing status updates
    useEffect(() => {
        if (!chatId || !currentUserId) return;

        const unsubscribe = TypingService.subscribeToTypingStatus(
            chatId,
            currentUserId,
            (users) => setTypingUsers(users),
            (error) => console.error("Typing subscription error:", error)
        );

        return () => {
            unsubscribe();
        };
    }, [chatId, currentUserId]);

    // Clear typing status on unmount or when chat changes
    useEffect(() => {
        return () => {
            if (chatId && currentUserId && isCurrentUserTyping) {
                TypingService.clearTypingStatus(chatId, currentUserId);
            }
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [chatId, currentUserId, isCurrentUserTyping]);

    /**
     * Set typing status for current user
     * Automatically clears after 5 seconds of inactivity
     */
    const setTyping = useCallback(
        (isTyping: boolean) => {
            if (!chatId || !currentUserId) return;

            // Clear existing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = null;
            }

            if (isTyping) {
                // Set typing status
                TypingService.setTypingStatus(chatId, currentUserId, true);
                setIsCurrentUserTyping(true);

                // Auto-clear after 5 seconds
                typingTimeoutRef.current = setTimeout(() => {
                    TypingService.setTypingStatus(chatId, currentUserId, false);
                    setIsCurrentUserTyping(false);
                }, 5000);
            } else {
                // Clear typing status immediately
                TypingService.setTypingStatus(chatId, currentUserId, false);
                setIsCurrentUserTyping(false);
            }
        },
        [chatId, currentUserId]
    );

    /**
     * Get formatted typing text for display
     * Examples: "John is typing...", "John and Jane are typing...", "John, Jane and 2 others are typing..."
     */
    const getTypingText = useCallback((): string | null => {
        if (typingUsers.length === 0) return null;

        if (typingUsers.length === 1) {
            return `${typingUsers[0].userId} is typing...`;
        }

        if (typingUsers.length === 2) {
            return `${typingUsers[0].userId} and ${typingUsers[1].userId} are typing...`;
        }

        const othersCount = typingUsers.length - 2;
        return `${typingUsers[0].userId}, ${typingUsers[1].userId} and ${othersCount} other${
            othersCount > 1 ? "s" : ""
        } are typing...`;
    }, [typingUsers]);

    return {
        typingUsers,
        isCurrentUserTyping,
        setTyping,
        getTypingText,
        hasTypingUsers: typingUsers.length > 0,
    };
};

/**
 * Hook for simple typing detection on text input
 * Automatically manages typing status based on text changes
 * @param chatId - The chat ID
 * @param currentUserId - Current user's ID
 * @param text - Current text input value
 */
export const useAutoTypingIndicator = (
    chatId: string,
    currentUserId: string,
    text: string
) => {
    const { setTyping, ...rest } = useTypingIndicator(chatId, currentUserId);
    const lastTextRef = useRef(text);

    useEffect(() => {
        // Only trigger typing if text actually changed (not just re-render)
        if (text !== lastTextRef.current) {
            lastTextRef.current = text;

            if (text.trim().length > 0) {
                setTyping(true);
            } else {
                setTyping(false);
            }
        }
    }, [text, setTyping]);

    return { setTyping, ...rest };
};
