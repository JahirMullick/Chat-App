import firestore from "@react-native-firebase/firestore";
import { UserProfile } from "../../types/firestore.types";

const USERS_COLLECTION = "users";
const CHATS_COLLECTION = "chats";

/**
 * User Service - Handles all user-related Firestore operations
 */
export const UserService = {
    /**
     * Get reference to users collection
     */
    getCollection: () => firestore().collection(USERS_COLLECTION),

    /**
     * Get reference to a specific user document
     */
    getDocRef: (userId: string) => firestore().collection(USERS_COLLECTION).doc(userId),

    /**
     * Create or update user profile in Firestore
     * Called when user logs in
     */
    createOrUpdateUser: async (
        uid: string,
        userData: {
            email: string | null;
            displayName: string | null;
            photoURL: string | null;
        }
    ): Promise<void> => {
        try {
            const userRef = UserService.getDocRef(uid);
            const userDoc = await userRef.get();

            const now = firestore.FieldValue.serverTimestamp();

            if (userDoc.exists()) {
                // Get previous data to check if displayName or photoURL changed
                const prevData = userDoc.data() as UserProfile;
                const nameChanged = prevData.displayName !== userData.displayName;
                const photoChanged = prevData.photoURL !== userData.photoURL;

                // Update existing user
                await userRef.update({
                    email: userData.email,
                    displayName: userData.displayName,
                    photoURL: userData.photoURL,
                    isOnline: true,
                    lastSeen: now,
                    updatedAt: now,
                });
                console.log("User profile updated:", uid);

                // If displayName or photoURL changed, sync across all chats
                if (nameChanged || photoChanged) {
                    const syncUpdates: { displayName?: string | null; photoURL?: string | null } = {};
                    if (nameChanged) syncUpdates.displayName = userData.displayName;
                    if (photoChanged) syncUpdates.photoURL = userData.photoURL;

                    UserService.syncParticipantDetailsAcrossChats(uid, syncUpdates).catch((err: Error) => {
                        console.error("Failed to sync participant details on login:", err);
                    });
                }
            } else {
                // Create new user
                await userRef.set({
                    uid,
                    email: userData.email,
                    displayName: userData.displayName,
                    photoURL: userData.photoURL,
                    isOnline: true,
                    lastSeen: now,
                    createdAt: now,
                    updatedAt: now,
                });
                console.log("New user profile created:", uid);
            }
        } catch (error) {
            console.error("Error creating/updating user:", error);
            throw error;
        }
    },

    /**
     * Get user profile by ID
     */
    getUserById: async (userId: string): Promise<UserProfile | null> => {
        try {
            const userDoc = await UserService.getDocRef(userId).get();
            if (userDoc.exists()) {
                return { uid: userDoc.id, ...userDoc.data() } as UserProfile;
            }
            return null;
        } catch (error) {
            console.error("Error getting user:", error);
            throw error;
        }
    },

    /**
     * Get multiple users by IDs
     */
    getUsersByIds: async (userIds: string[]): Promise<UserProfile[]> => {
        try {
            if (userIds.length === 0) return [];

            // Firestore 'in' query supports max 10 items
            const chunks: string[][] = [];
            for (let i = 0; i < userIds.length; i += 10) {
                chunks.push(userIds.slice(i, i + 10));
            }

            const users: UserProfile[] = [];
            for (const chunk of chunks) {
                const snapshot = await UserService.getCollection()
                    .where("uid", "in", chunk)
                    .get();

                snapshot.docs.forEach(doc => {
                    users.push({ uid: doc.id, ...doc.data() } as UserProfile);
                });
            }

            return users;
        } catch (error) {
            console.error("Error getting users:", error);
            throw error;
        }
    },

    /**
     * Update user online status
     */
    setOnlineStatus: async (userId: string, isOnline: boolean): Promise<void> => {
        try {
            await UserService.getDocRef(userId).update({
                isOnline,
                lastSeen: firestore.FieldValue.serverTimestamp(),
                updatedAt: firestore.FieldValue.serverTimestamp(),
            });
        } catch (error) {
            console.error("Error updating online status:", error);
            throw error;
        }
    },

    /**
     * Check if a phone number is already in use by another user
     */
    checkPhoneNumberExists: async (phoneNumber: string, excludeUserId?: string): Promise<boolean> => {
        try {
            let query = UserService.getCollection().where("phoneNumber", "==", phoneNumber);
            const snapshot = await query.get();

            if (snapshot.empty) {
                return false;
            }

            // If excludeUserId is provided, check if the found user is NOT the current user
            if (excludeUserId) {
                return snapshot.docs.some(doc => doc.id !== excludeUserId);
            }

            return true;
        } catch (error) {
            console.error("Error checking phone number:", error);
            throw error;
        }
    },

    /**
     * Update user profile fields
     */
    updateProfile: async (
        userId: string,
        updates: Partial<Pick<UserProfile, "displayName" | "photoURL" | "bio" | "phoneNumber" | "pushToken" | "fcmToken" | "devicePlatform" | "lastTokenUpdate" | "profileCompleted" | "gender" | "dateOfBirth">>
    ): Promise<void> => {
        try {
            // Remove undefined values from updates
            const cleanUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
                if (value !== undefined) {
                    acc[key] = value;
                }
                return acc;
            }, {} as Record<string, any>);

            // Use set with merge instead of update to avoid not-found errors
            await UserService.getDocRef(userId).set({
                ...cleanUpdates,
                updatedAt: firestore.FieldValue.serverTimestamp(),
            }, { merge: true });

            // If displayName or photoURL changed, sync across all chats
            const shouldSyncChats = 'displayName' in cleanUpdates || 'photoURL' in cleanUpdates;
            if (shouldSyncChats) {
                const syncUpdates: { displayName?: string | null; photoURL?: string | null } = {};
                if ('displayName' in cleanUpdates) {
                    syncUpdates.displayName = cleanUpdates.displayName;
                }
                if ('photoURL' in cleanUpdates) {
                    syncUpdates.photoURL = cleanUpdates.photoURL;
                }

                // Sync participant details in all chats (run in background)
                UserService.syncParticipantDetailsAcrossChats(userId, syncUpdates).catch((err: Error) => {
                    console.error("Failed to sync participant details across chats:", err);
                });
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            throw error;
        }
    },

    /**
     * Subscribe to user profile changes (real-time)
     */
    subscribeToUser: (
        userId: string,
        onUpdate: (user: UserProfile | null) => void,
        onError?: (error: Error) => void
    ) => {
        return UserService.getDocRef(userId).onSnapshot(
            (snapshot) => {
                if (snapshot.exists()) {
                    onUpdate({ uid: snapshot.id, ...snapshot.data() } as UserProfile);
                } else {
                    onUpdate(null);
                }
            },
            (error) => {
                console.error("Error in user subscription:", error);
                onError?.(error);
            }
        );
    },

    /**
     * Subscribe to all users (real-time)
     */
    subscribeToAllUsers: (
        onUpdate: (users: UserProfile[]) => void,
        onError?: (error: Error) => void
    ) => {
        return UserService.getCollection()
            .orderBy("displayName", "asc")
            .onSnapshot(
                (snapshot) => {
                    const users = snapshot.docs.map(doc => ({
                        uid: doc.id,
                        ...doc.data(),
                    } as UserProfile));
                    onUpdate(users);
                },
                (error) => {
                    console.error("Error in all users subscription:", error);
                    onError?.(error);
                }
            );
    },

    /**
     * Search users by display name
     */
    searchUsers: async (searchTerm: string, limit: number = 20): Promise<UserProfile[]> => {
        try {
            // Simple prefix search (case-sensitive)
            const snapshot = await UserService.getCollection()
                .where("displayName", ">=", searchTerm)
                .where("displayName", "<=", searchTerm + "\uf8ff")
                .limit(limit)
                .get();

            return snapshot.docs.map(doc => ({
                uid: doc.id,
                ...doc.data(),
            } as UserProfile));
        } catch (error) {
            console.error("Error searching users:", error);
            throw error;
        }
    },

    /**
     * Search users by email (exact match or prefix)
     */
    searchUsersByEmail: async (email: string, currentUserId?: string, limit: number = 20): Promise<UserProfile[]> => {
        try {
            const normalizedEmail = email.toLowerCase().trim();

            // Search for users whose email starts with the search term
            const snapshot = await UserService.getCollection()
                .where("email", ">=", normalizedEmail)
                .where("email", "<=", normalizedEmail + "\uf8ff")
                .limit(limit)
                .get();

            const users = snapshot.docs.map(doc => ({
                uid: doc.id,
                ...doc.data(),
            } as UserProfile));

            // Filter out current user if provided
            if (currentUserId) {
                return users.filter(user => user.uid !== currentUserId);
            }

            return users;
        } catch (error) {
            console.error("Error searching users by email:", error);
            throw error;
        }
    },

    /**
     * Sync participant details across all chats when user updates their profile
     * This ensures that name/photo changes are reflected in all chats
     * @internal Used internally by updateProfile and createOrUpdateUser
     */
    syncParticipantDetailsAcrossChats: async (
        userId: string,
        updates: { displayName?: string | null; photoURL?: string | null }
    ): Promise<void> => {
        try {
            console.log(`🔄 Syncing participant details for user ${userId}:`, updates);

            // Get all chats where this user is a participant
            const chatsSnapshot = await firestore()
                .collection(CHATS_COLLECTION)
                .where("participants", "array-contains", userId)
                .get();

            if (chatsSnapshot.empty) {
                console.log("No chats found for user:", userId);
                return;
            }

            console.log(`Found ${chatsSnapshot.docs.length} chats to update`);

            // Batch update all chats
            const batch = firestore().batch();
            let updateCount = 0;

            for (const doc of chatsSnapshot.docs) {
                const chatRef = firestore().collection(CHATS_COLLECTION).doc(doc.id);
                const updateData: any = {};

                // Update only the fields that changed
                if (updates.displayName !== undefined) {
                    updateData[`participantDetails.${userId}.displayName`] = updates.displayName;
                }
                if (updates.photoURL !== undefined) {
                    updateData[`participantDetails.${userId}.photoURL`] = updates.photoURL;
                }

                if (Object.keys(updateData).length > 0) {
                    batch.update(chatRef, {
                        ...updateData,
                        updatedAt: firestore.FieldValue.serverTimestamp(),
                    });
                    updateCount++;
                }
            }

            if (updateCount > 0) {
                await batch.commit();
                console.log(`✅ Successfully synced participant details across ${updateCount} chats`);
            } else {
                console.log("No updates needed");
            }
        } catch (error) {
            console.error("❌ Error syncing participant details:", error);
            throw error;
        }
    },

    /**
     * Delete user profile
     */
    deleteUser: async (userId: string): Promise<void> => {
        try {
            await UserService.getDocRef(userId).delete();
            console.log("User deleted:", userId);
        } catch (error) {
            console.error("Error deleting user:", error);
            throw error;
        }
    },
};

export default UserService;
