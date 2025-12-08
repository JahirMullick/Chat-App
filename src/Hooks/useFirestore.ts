import auth from "@react-native-firebase/auth";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import {
    Chat,
    ChatService,
    Message,
    MessageService,
    StoryGroup,
    StoryService,
    Tab,
    TabService,
    UserChat,
    UserProfile,
    UserService,
} from "../services/firestore";

/**
 * Hook to get current user ID
 */
export const useCurrentUserId = (): string | null => {
    const [userId, setUserId] = useState<string | null>(auth().currentUser?.uid || null);

    useEffect(() => {
        const unsubscribe = auth().onAuthStateChanged(user => {
            setUserId(user?.uid || null);
        });
        return unsubscribe;
    }, []);

    return userId;
};

/**
 * Hook to get and subscribe to current user's profile
 */
export const useUserProfile = (userId?: string) => {
    const currentUserId = useCurrentUserId();
    const targetUserId = userId || currentUserId;
    
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!targetUserId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = UserService.subscribeToUser(
            targetUserId,
            (user) => {
                setProfile(user);
                setLoading(false);
            },
            (err) => {
                setError(err);
                setLoading(false);
            }
        );

        return unsubscribe;
    }, [targetUserId]);

    const updateProfile = useCallback(
        async (updates: Partial<Pick<UserProfile, "displayName" | "photoURL" | "bio" | "phoneNumber">>) => {
            if (!targetUserId) return;
            try {
                await UserService.updateProfile(targetUserId, updates);
            } catch (err) {
                setError(err as Error);
            }
        },
        [targetUserId]
    );

    return { profile, loading, error, updateProfile };
};

/**
 * Hook to get and subscribe to user's chats
 */
export const useChats = () => {
    const userId = useCurrentUserId();
    const [chats, setChats] = useState<{ chat: Chat; userChat: UserChat }[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        if (!refreshing) {
            setLoading(true);
        }
        const unsubscribe = ChatService.subscribeToUserChats(
            userId,
            (userChats) => {
                setChats(userChats);
                setLoading(false);
                setRefreshing(false);
            },
            (err) => {
                setError(err);
                setLoading(false);
                setRefreshing(false);
            }
        );

        return unsubscribe;
    }, [userId, refreshKey]);

    const refresh = useCallback(() => {
        setRefreshing(true);
        setRefreshKey(prev => prev + 1);
    }, []);

    const createIndividualChat = useCallback(
        async (otherUserId: string) => {
            if (!userId) return null;
            try {
                return await ChatService.createIndividualChat(userId, otherUserId);
            } catch (err) {
                setError(err as Error);
                return null;
            }
        },
        [userId]
    );

    const createGroupChat = useCallback(
        async (memberIds: string[], groupName: string, options?: Parameters<typeof ChatService.createGroupChat>[3]) => {
            if (!userId) return null;
            try {
                return await ChatService.createGroupChat(userId, memberIds, groupName, options);
            } catch (err) {
                setError(err as Error);
                return null;
            }
        },
        [userId]
    );

    return { chats, loading, refreshing, error, refresh, createIndividualChat, createGroupChat };
};

/**
 * Hook to get and subscribe to messages in a chat
 */
export const useMessages = (chatId: string | null) => {
    const userId = useCurrentUserId();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!chatId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = MessageService.subscribeToMessages(
            chatId,
            (msgs) => {
                // Filter out messages deleted by current user
                const visibleMessages = msgs.filter(
                    msg => !msg.deletedFor?.includes(userId || "")
                );
                setMessages(visibleMessages);
                setLoading(false);
            },
            (err) => {
                setError(err);
                setLoading(false);
            }
        );

        return unsubscribe;
    }, [chatId]);

    // Mark messages as read when viewing
    useEffect(() => {
        if (chatId && userId && messages.length > 0) {
            MessageService.markAllMessagesAsRead(chatId, userId).catch(console.error);
        }
    }, [chatId, userId, messages.length]);

    const sendMessage = useCallback(
        async (text: string, options?: Parameters<typeof MessageService.sendMessage>[4]) => {
            if (!chatId || !userId) return null;
            try {
                const userProfile = await UserService.getUserById(userId);
                return await MessageService.sendMessage(
                    chatId,
                    userId,
                    userProfile?.displayName || "Unknown",
                    text,
                    options
                );
            } catch (err) {
                setError(err as Error);
                return null;
            }
        },
        [chatId, userId]
    );

    const editMessage = useCallback(
        async (messageId: string, newText: string) => {
            if (!chatId) return;
            try {
                await MessageService.editMessage(chatId, messageId, newText);
            } catch (err) {
                setError(err as Error);
            }
        },
        [chatId]
    );

    const deleteMessage = useCallback(
        async (messageId: string) => {
            if (!chatId) return;
            try {
                await MessageService.deleteMessage(chatId, messageId);
            } catch (err) {
                setError(err as Error);
            }
        },
        [chatId]
    );

    const deleteMessageForMe = useCallback(
        async (messageId: string) => {
            if (!chatId || !userId) return;
            try {
                await MessageService.deleteMessageForMe(chatId, messageId, userId);
            } catch (err) {
                setError(err as Error);
            }
        },
        [chatId, userId]
    );

    return { messages, loading, error, sendMessage, editMessage, deleteMessage, deleteMessageForMe };
};

/**
 * Hook to get and subscribe to stories
 */
export const useStories = () => {
    const userId = useCurrentUserId();
    const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = StoryService.subscribeToStories(
            userId,
            (groups) => {
                setStoryGroups(groups);
                setLoading(false);
            },
            (err) => {
                setError(err);
                setLoading(false);
            }
        );

        return unsubscribe;
    }, [userId]);

    const createStory = useCallback(
        async (mediaUrl: string, mediaType: "image" | "video", caption?: string) => {
            if (!userId) return null;
            try {
                return await StoryService.createStory(userId, mediaUrl, mediaType, caption);
            } catch (err) {
                setError(err as Error);
                return null;
            }
        },
        [userId]
    );

    const markAsViewed = useCallback(
        async (storyId: string) => {
            if (!userId) return;
            try {
                await StoryService.markStoryAsViewed(storyId, userId);
            } catch (err) {
                setError(err as Error);
            }
        },
        [userId]
    );

    const deleteStory = useCallback(
        async (storyId: string) => {
            try {
                await StoryService.deleteStory(storyId);
            } catch (err) {
                setError(err as Error);
            }
        },
        []
    );

    return { storyGroups, loading, error, createStory, markAsViewed, deleteStory };
};

/**
 * Hook to get and subscribe to user's tabs
 */
export const useTabs = () => {
    const userId = useCurrentUserId();
    const [tabs, setTabs] = useState<Tab[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = TabService.subscribeToUserTabs(
            userId,
            (userTabs) => {
                setTabs(userTabs);
                setLoading(false);
            },
            (err) => {
                setError(err);
                setLoading(false);
            }
        );

        return unsubscribe;
    }, [userId]);

    const setActiveTab = useCallback(
        async (tabId: string) => {
            if (!userId) return;
            try {
                await TabService.setActiveTab(userId, tabId);
            } catch (err) {
                setError(err as Error);
            }
        },
        [userId]
    );

    const createTab = useCallback(
        async (label: string, category?: Parameters<typeof TabService.createTab>[2]) => {
            if (!userId) return null;
            try {
                return await TabService.createTab(userId, label, category);
            } catch (err) {
                setError(err as Error);
                return null;
            }
        },
        [userId]
    );

    const deleteTab = useCallback(
        async (tabId: string) => {
            if (!userId) return;
            try {
                await TabService.deleteTab(userId, tabId);
            } catch (err) {
                setError(err as Error);
            }
        },
        [userId]
    );

    return { tabs, loading, error, setActiveTab, createTab, deleteTab };
};

/**
 * Hook to manage online status based on AppState
 */
export const useOnlineStatus = () => {
    const userId = useCurrentUserId();
    const appState = useRef(AppState.currentState);

    useEffect(() => {
        if (!userId) return;

        // Set online when hook mounts
        UserService.setOnlineStatus(userId, true).catch(console.error);

        // Listen to app state changes
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                // App came to foreground - set online
                console.log('App is active - setting user online');
                UserService.setOnlineStatus(userId, true).catch(console.error);
            } else if (
                appState.current === 'active' &&
                nextAppState.match(/inactive|background/)
            ) {
                // App went to background - set offline
                console.log('App is in background - setting user offline');
                UserService.setOnlineStatus(userId, false).catch(console.error);
            }

            appState.current = nextAppState;
        });

        // Set offline when hook unmounts (user logs out)
        return () => {
            subscription.remove();
            UserService.setOnlineStatus(userId, false).catch(console.error);
        };
    }, [userId]);
};
