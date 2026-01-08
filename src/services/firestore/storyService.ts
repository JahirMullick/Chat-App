import firestore from "@react-native-firebase/firestore";
import { Story, StoryGroup } from "../../types/firestore.types";
import { UserService } from "./userService";

const STORIES_COLLECTION = "stories";

// Story expiration time (24 hours in milliseconds)
const STORY_EXPIRATION_MS = 24 * 60 * 60 * 1000;

/**
 * Story Service - Handles all story-related Firestore operations
 */
export const StoryService = {
    /**
     * Get reference to stories collection
     */
    getCollection: () => firestore().collection(STORIES_COLLECTION),

    /**
     * Get reference to a specific story document
     */
    getDocRef: (storyId: string) => firestore().collection(STORIES_COLLECTION).doc(storyId),

    /**
     * Create a new story
     */
    createStory: async (
        userId: string,
        mediaUrl: string,
        mediaType: "image" | "video",
        caption?: string
    ): Promise<string> => {
        try {
            const user = await UserService.getUserById(userId);
            if (!user) {
                throw new Error("User not found");
            }

            const now = firestore.Timestamp.now();
            const expiresAt = firestore.Timestamp.fromMillis(now.toMillis() + STORY_EXPIRATION_MS);

            const storyData = {
                userId,
                userName: user.displayName || "Unknown",
                userPhotoURL: user.photoURL,
                mediaUrl,
                mediaType,
                caption: caption || "",
                createdAt: now,
                expiresAt,
                viewers: [],
            };

            const storyRef = await StoryService.getCollection().add(storyData);
            console.log("Story created:", storyRef.id);
            return storyRef.id;
        } catch (error) {
            console.error("Error creating story:", error);
            throw error;
        }
    },

    /**
     * Get a story by ID
     */
    getStoryById: async (storyId: string): Promise<Story | null> => {
        try {
            const doc = await StoryService.getDocRef(storyId).get();
            if (doc.exists()) {
                return { id: doc.id, ...doc.data() } as Story;
            }
            return null;
        } catch (error) {
            console.error("Error getting story:", error);
            throw error;
        }
    },

    /**
     * Get all active stories (not expired)
     */
    getActiveStories: async (): Promise<Story[]> => {
        try {
            const now = firestore.Timestamp.now();
            
            const snapshot = await StoryService.getCollection()
                .where("expiresAt", ">", now)
                .orderBy("expiresAt", "asc")
                .orderBy("createdAt", "desc")
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            } as Story));
        } catch (error) {
            console.error("Error getting active stories:", error);
            throw error;
        }
    },

    /**
     * Get stories grouped by user
     */
    getStoriesGroupedByUser: async (currentUserId: string): Promise<StoryGroup[]> => {
        try {
            const stories = await StoryService.getActiveStories();
            
            // Group stories by userId
            const groupedMap = new Map<string, Story[]>();
            
            stories.forEach(story => {
                const existing = groupedMap.get(story.userId) || [];
                existing.push(story);
                groupedMap.set(story.userId, existing);
            });

            // Convert to StoryGroup array
            const storyGroups: StoryGroup[] = [];
            
            groupedMap.forEach((userStories, oderId) => {
                const firstStory = userStories[0];
                const hasUnseenStory = userStories.some(
                    story => !story.viewers.includes(currentUserId)
                );
                
                // Find the latest story time
                const latestStoryTime = userStories.reduce((latest, story) => {
                    return story.createdAt.toMillis() > latest.toMillis() 
                        ? story.createdAt 
                        : latest;
                }, userStories[0].createdAt);

                storyGroups.push({
                    userId: firstStory.userId,
                    userName: firstStory.userName,
                    userPhotoURL: firstStory.userPhotoURL,
                    stories: userStories.sort((a, b) => 
                        a.createdAt.toMillis() - b.createdAt.toMillis()
                    ),
                    hasUnseenStory,
                    latestStoryTime,
                });
            });

            // Sort: current user first, then by hasUnseenStory, then by latestStoryTime
            storyGroups.sort((a, b) => {
                // Current user's stories first
                if (a.userId === currentUserId) return -1;
                if (b.userId === currentUserId) return 1;
                
                // Then unseen stories
                if (a.hasUnseenStory && !b.hasUnseenStory) return -1;
                if (!a.hasUnseenStory && b.hasUnseenStory) return 1;
                
                // Then by latest story time
                return b.latestStoryTime.toMillis() - a.latestStoryTime.toMillis();
            });

            return storyGroups;
        } catch (error) {
            console.error("Error getting grouped stories:", error);
            throw error;
        }
    },

    /**
     * Get current user's stories
     */
    getMyStories: async (userId: string): Promise<Story[]> => {
        try {
            const now = firestore.Timestamp.now();
            
            const snapshot = await StoryService.getCollection()
                .where("userId", "==", userId)
                .where("expiresAt", ">", now)
                .orderBy("expiresAt", "asc")
                .orderBy("createdAt", "desc")
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            } as Story));
        } catch (error) {
            console.error("Error getting my stories:", error);
            throw error;
        }
    },

    /**
     * Get stories by user ID
     */
    getStoriesByUser: async (userId: string): Promise<Story[]> => {
        try {
            const now = firestore.Timestamp.now();
            
            const snapshot = await StoryService.getCollection()
                .where("userId", "==", userId)
                .where("expiresAt", ">", now)
                .orderBy("expiresAt", "asc")
                .orderBy("createdAt", "asc")
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            } as Story));
        } catch (error) {
            console.error("Error getting stories by user:", error);
            throw error;
        }
    },

    /**
     * Mark story as viewed
     */
    markStoryAsViewed: async (storyId: string, viewerId: string): Promise<void> => {
        try {
            await StoryService.getDocRef(storyId).update({
                viewers: firestore.FieldValue.arrayUnion(viewerId),
            });
        } catch (error) {
            console.error("Error marking story as viewed:", error);
            throw error;
        }
    },

    /**
     * Get story viewers
     */
    getStoryViewers: async (storyId: string): Promise<string[]> => {
        try {
            const story = await StoryService.getStoryById(storyId);
            return story?.viewers || [];
        } catch (error) {
            console.error("Error getting story viewers:", error);
            throw error;
        }
    },

    /**
     * Delete a story
     */
    deleteStory: async (storyId: string): Promise<void> => {
        try {
            await StoryService.getDocRef(storyId).delete();
            console.log("Story deleted:", storyId);
        } catch (error) {
            console.error("Error deleting story:", error);
            throw error;
        }
    },

    /**
     * Delete all expired stories (cleanup function)
     * This should be run periodically, ideally via Cloud Functions
     */
    deleteExpiredStories: async (): Promise<number> => {
        try {
            const now = firestore.Timestamp.now();
            
            const snapshot = await StoryService.getCollection()
                .where("expiresAt", "<=", now)
                .get();

            if (snapshot.empty) return 0;

            const batch = firestore().batch();
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });

            await batch.commit();
            console.log(`Deleted ${snapshot.size} expired stories`);
            return snapshot.size;
        } catch (error) {
            console.error("Error deleting expired stories:", error);
            throw error;
        }
    },

    /**
     * Subscribe to stories (real-time)
     */
    subscribeToStories: (
        currentUserId: string,
        onUpdate: (storyGroups: StoryGroup[]) => void,
        onError?: (error: Error) => void
    ) => {
        const now = firestore.Timestamp.now();
        
        return StoryService.getCollection()
            .where("expiresAt", ">", now)
            .orderBy("expiresAt", "asc")
            .orderBy("createdAt", "desc")
            .onSnapshot(
                async (snapshot) => {
                    try {
                        const stories = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data(),
                        } as Story));

                        // Group stories by userId
                        const groupedMap = new Map<string, Story[]>();
                        
                        stories.forEach(story => {
                            const existing = groupedMap.get(story.userId) || [];
                            existing.push(story);
                            groupedMap.set(story.userId, existing);
                        });

                        // Convert to StoryGroup array
                        const storyGroups: StoryGroup[] = [];
                        
                        groupedMap.forEach((userStories, userId) => {
                            const firstStory = userStories[0];
                            const hasUnseenStory = userStories.some(
                                story => !story.viewers.includes(currentUserId)
                            );
                            
                            const latestStoryTime = userStories.reduce((latest, story) => {
                                return story.createdAt.toMillis() > latest.toMillis() 
                                    ? story.createdAt 
                                    : latest;
                            }, userStories[0].createdAt);

                            storyGroups.push({
                                userId: firstStory.userId,
                                userName: firstStory.userName,
                                userPhotoURL: firstStory.userPhotoURL,
                                stories: userStories.sort((a, b) => 
                                    a.createdAt.toMillis() - b.createdAt.toMillis()
                                ),
                                hasUnseenStory,
                                latestStoryTime,
                            });
                        });

                        // Sort
                        storyGroups.sort((a, b) => {
                            if (a.userId === currentUserId) return -1;
                            if (b.userId === currentUserId) return 1;
                            if (a.hasUnseenStory && !b.hasUnseenStory) return -1;
                            if (!a.hasUnseenStory && b.hasUnseenStory) return 1;
                            return b.latestStoryTime.toMillis() - a.latestStoryTime.toMillis();
                        });

                        onUpdate(storyGroups);
                    } catch (error) {
                        console.error("Error processing stories:", error);
                        onError?.(error as Error);
                    }
                },
                (error) => {
                    console.error("Error in stories subscription:", error);
                    onError?.(error);
                }
            );
    },
};

export default StoryService;
