import { FirebaseFirestoreTypes, getFirestore } from "@react-native-firebase/firestore";
import { UserProfile } from "../../types/firestore.types";

const USERS_COLLECTION = "users";

/**
 * User Service - Handles all user-related Firestore operations
 */
export const UserService = {
    /**
     * Get reference to users collection
     */
    getCollection: () => getFirestore().collection(USERS_COLLECTION),

    /**
     * Get reference to a specific user document
     */
    getDocRef: (userId: string) => getFirestore().collection(USERS_COLLECTION).doc(userId),

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

            const now = FirebaseFirestoreTypes.FieldValue.serverTimestamp();

            if (userDoc.exists()) {
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
                lastSeen: FirebaseFirestoreTypes.FieldValue.serverTimestamp(),
                updatedAt: FirebaseFirestoreTypes.FieldValue.serverTimestamp(),
            });
        } catch (error) {
            console.error("Error updating online status:", error);
            throw error;
        }
    },

    /**
     * Update user profile fields
     */
    updateProfile: async (
        userId: string,
        updates: Partial<Pick<UserProfile, "displayName" | "photoURL" | "bio" | "phoneNumber" | "pushToken" | "profileCompleted" | "gender" | "dateOfBirth">>
    ): Promise<void> => {
        try {
            // Remove undefined values from updates
            const cleanUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
                if (value !== undefined) {
                    acc[key] = value;
                }
                return acc;
            }, {} as Record<string, any>);

            await UserService.getDocRef(userId).update({
                ...cleanUpdates,
                updatedAt: FirebaseFirestoreTypes.FieldValue.serverTimestamp(),
            });
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
