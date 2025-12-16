import { getFirestore } from "@react-native-firebase/firestore";
import { ChatCategory, Tab } from "../../types/firestore.types";

const TABS_COLLECTION = "tabs";
const USER_TABS_COLLECTION = "userTabs";

/**
 * Default tabs for new users
 */
const DEFAULT_TABS: Omit<Tab, "id">[] = [
    { label: "All", count: 0, isActive: true, order: 0 },
    { label: "Groups", count: 0, isActive: false, order: 1, category: "groups" },
    { label: "Channels", count: 0, isActive: false, order: 2, category: "channels" },
    { label: "Bots", count: 0, isActive: false, order: 3, category: "bots" },
];

/**
 * Tab Service - Handles tab-related Firestore operations
 */
export const TabService = {
    /**
     * Get reference to global tabs collection
     */
    getCollection: () => getFirestore().collection(TABS_COLLECTION),

    /**
     * Get reference to user's tabs collection
     */
    getUserTabsCollection: (userId: string) =>
        getFirestore().collection(USER_TABS_COLLECTION).doc(userId).collection("tabs"),

    /**
     * Initialize default tabs for a user
     */
    initializeUserTabs: async (userId: string): Promise<void> => {
        try {
            const userTabsRef = TabService.getUserTabsCollection(userId);
            const snapshot = await userTabsRef.get();

            // If user already has tabs, don't reinitialize
            if (!snapshot.empty) {
                console.log("User tabs already exist");
                return;
            }

            const batch = getFirestore().batch();
            
            DEFAULT_TABS.forEach((tab) => {
                const tabRef = userTabsRef.doc();
                batch.set(tabRef, tab);
            });

            await batch.commit();
            console.log("Default tabs initialized for user:", userId);
        } catch (error) {
            console.error("Error initializing user tabs:", error);
            throw error;
        }
    },

    /**
     * Get user's tabs
     */
    getUserTabs: async (userId: string): Promise<Tab[]> => {
        try {
            const snapshot = await TabService.getUserTabsCollection(userId)
                .orderBy("order", "asc")
                .get();

            if (snapshot.empty) {
                // Initialize default tabs if none exist
                await TabService.initializeUserTabs(userId);
                return TabService.getUserTabs(userId);
            }

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            } as Tab));
        } catch (error) {
            console.error("Error getting user tabs:", error);
            throw error;
        }
    },

    /**
     * Subscribe to user's tabs (real-time)
     */
    subscribeToUserTabs: (
        userId: string,
        onUpdate: (tabs: Tab[]) => void,
        onError?: (error: Error) => void
    ) => {
        return TabService.getUserTabsCollection(userId)
            .orderBy("order", "asc")
            .onSnapshot(
                async (snapshot) => {
                    if (snapshot.empty) {
                        // Initialize default tabs
                        await TabService.initializeUserTabs(userId);
                        return;
                    }

                    const tabs = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    } as Tab));
                    onUpdate(tabs);
                },
                (error) => {
                    console.error("Error in tabs subscription:", error);
                    onError?.(error);
                }
            );
    },

    /**
     * Create a new tab for user
     */
    createTab: async (
        userId: string,
        label: string,
        category?: ChatCategory
    ): Promise<string> => {
        try {
            // Get current max order
            const existingTabs = await TabService.getUserTabs(userId);
            const maxOrder = existingTabs.reduce((max, tab) => 
                Math.max(max, tab.order), 0
            );

            const tabRef = await TabService.getUserTabsCollection(userId).add({
                label,
                count: 0,
                isActive: false,
                order: maxOrder + 1,
                ...(category && { category }),
            });

            console.log("Tab created:", tabRef.id);
            return tabRef.id;
        } catch (error) {
            console.error("Error creating tab:", error);
            throw error;
        }
    },

    /**
     * Update tab
     */
    updateTab: async (
        userId: string,
        tabId: string,
        updates: Partial<Pick<Tab, "label" | "count" | "isActive" | "order" | "category">>
    ): Promise<void> => {
        try {
            await TabService.getUserTabsCollection(userId).doc(tabId).update(updates);
        } catch (error) {
            console.error("Error updating tab:", error);
            throw error;
        }
    },

    /**
     * Set active tab (deactivates others)
     */
    setActiveTab: async (userId: string, tabId: string): Promise<void> => {
        try {
            const tabs = await TabService.getUserTabs(userId);
            const batch = getFirestore().batch();

            tabs.forEach(tab => {
                const tabRef = TabService.getUserTabsCollection(userId).doc(tab.id);
                batch.update(tabRef, { isActive: tab.id === tabId });
            });

            await batch.commit();
        } catch (error) {
            console.error("Error setting active tab:", error);
            throw error;
        }
    },

    /**
     * Delete tab
     */
    deleteTab: async (userId: string, tabId: string): Promise<void> => {
        try {
            await TabService.getUserTabsCollection(userId).doc(tabId).delete();
            console.log("Tab deleted:", tabId);
        } catch (error) {
            console.error("Error deleting tab:", error);
            throw error;
        }
    },

    /**
     * Reorder tabs
     */
    reorderTabs: async (userId: string, tabOrders: { tabId: string; order: number }[]): Promise<void> => {
        try {
            const batch = getFirestore().batch();

            tabOrders.forEach(({ tabId, order }) => {
                const tabRef = TabService.getUserTabsCollection(userId).doc(tabId);
                batch.update(tabRef, { order });
            });

            await batch.commit();
            console.log("Tabs reordered");
        } catch (error) {
            console.error("Error reordering tabs:", error);
            throw error;
        }
    },

    /**
     * Update tab counts based on chats
     * This should be called when chat list changes
     */
    updateTabCounts: async (
        userId: string,
        categoryCounts: { [category: string]: number }
    ): Promise<void> => {
        try {
            const tabs = await TabService.getUserTabs(userId);
            const batch = getFirestore().batch();

            let totalCount = 0;
            Object.values(categoryCounts).forEach(count => {
                totalCount += count;
            });

            tabs.forEach(tab => {
                const tabRef = TabService.getUserTabsCollection(userId).doc(tab.id);
                let count = 0;

                if (tab.label === "All") {
                    count = totalCount;
                } else if (tab.category && categoryCounts[tab.category] !== undefined) {
                    count = categoryCounts[tab.category];
                } else if (tab.chatIds && tab.chatIds.length > 0) {
                    // For custom folders, count the number of chatIds
                    count = tab.chatIds.length;
                }

                batch.update(tabRef, { count });
            });

            await batch.commit();
        } catch (error) {
            console.error("Error updating tab counts:", error);
            throw error;
        }
    },

    /**
     * Add chats to a tab/folder
     */
    addChatsToTab: async (
        userId: string,
        tabId: string,
        chatIds: string[]
    ): Promise<void> => {
        try {
            const tabRef = TabService.getUserTabsCollection(userId).doc(tabId);
            const tabDoc = await tabRef.get();
            
            if (!tabDoc.exists) {
                throw new Error("Tab not found");
            }

            const currentChatIds = (tabDoc.data()?.chatIds as string[]) || [];
            const uniqueChatIds = Array.from(new Set([...currentChatIds, ...chatIds]));

            await tabRef.update({
                chatIds: uniqueChatIds,
                count: uniqueChatIds.length,
            });

            console.log("Chats added to tab:", tabId, chatIds);
        } catch (error) {
            console.error("Error adding chats to tab:", error);
            throw error;
        }
    },

    /**
     * Remove chats from a tab/folder
     */
    removeChatsFromTab: async (
        userId: string,
        tabId: string,
        chatIds: string[]
    ): Promise<void> => {
        try {
            const tabRef = TabService.getUserTabsCollection(userId).doc(tabId);
            const tabDoc = await tabRef.get();
            
            if (!tabDoc.exists) {
                throw new Error("Tab not found");
            }

            const currentChatIds = (tabDoc.data()?.chatIds as string[]) || [];
            const updatedChatIds = currentChatIds.filter(id => !chatIds.includes(id));

            await tabRef.update({
                chatIds: updatedChatIds,
                count: updatedChatIds.length,
            });

            console.log("Chats removed from tab:", tabId, chatIds);
        } catch (error) {
            console.error("Error removing chats from tab:", error);
            throw error;
        }
    },

    /**
     * Set chats for a tab/folder (replaces existing)
     */
    setChatsForTab: async (
        userId: string,
        tabId: string,
        chatIds: string[]
    ): Promise<void> => {
        try {
            const tabRef = TabService.getUserTabsCollection(userId).doc(tabId);
            const uniqueChatIds = Array.from(new Set(chatIds));

            await tabRef.update({
                chatIds: uniqueChatIds,
                count: uniqueChatIds.length,
            });

            console.log("Chats set for tab:", tabId, uniqueChatIds);
        } catch (error) {
            console.error("Error setting chats for tab:", error);
            throw error;
        }
    },
};

export default TabService;
