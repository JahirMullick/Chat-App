import { MMKV } from "react-native-mmkv";

// Lazy initialization - only create MMKV when actually needed
let _storage: MMKV | null = null;

const getStorage = (): MMKV => {
    if (!_storage) {
        _storage = new MMKV();
    }
    return _storage;
};

// Storage keys
export const STORAGE_KEYS = {
    USER_SESSION: "user_session",
    IS_LOGGED_IN: "is_logged_in",
    USER_DATA: "user_data",
    APP_STATE: "app_state",
} as const;

// Session management functions
export const SessionStorage = {
    // Set user session
    setSession: (userId: string, userData?: Record<string, unknown>) => {
        try {
            const storage = getStorage();
            storage.set(STORAGE_KEYS.IS_LOGGED_IN, true);
            storage.set(STORAGE_KEYS.USER_SESSION, userId);
            if (userData) {
                storage.set(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
            }
        } catch (error) {
            console.log("MMKV setSession error:", error);
        }
    },

    // Get user session
    getSession: (): string | undefined => {
        try {
            return getStorage().getString(STORAGE_KEYS.USER_SESSION);
        } catch (error) {
            console.log("MMKV getSession error:", error);
            return undefined;
        }
    },

    // Check if user is logged in
    isLoggedIn: (): boolean => {
        try {
            return getStorage().getBoolean(STORAGE_KEYS.IS_LOGGED_IN) ?? false;
        } catch (error) {
            console.log("MMKV isLoggedIn error:", error);
            return false;
        }
    },

    // Get user data
    getUserData: (): Record<string, unknown> | null => {
        try {
            const data = getStorage().getString(STORAGE_KEYS.USER_DATA);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.log("MMKV getUserData error:", error);
            return null;
        }
    },

    // Clear session (logout)
    clearSession: () => {
        try {
            const storage = getStorage();
            storage.delete(STORAGE_KEYS.IS_LOGGED_IN);
            storage.delete(STORAGE_KEYS.USER_SESSION);
            storage.delete(STORAGE_KEYS.USER_DATA);
        } catch (error) {
            console.log("MMKV clearSession error:", error);
        }
    },

    // Clear all storage
    clearAll: () => {
        try {
            getStorage().clearAll();
        } catch (error) {
            console.log("MMKV clearAll error:", error);
        }
    },

    // Set app state for detecting app restart
    setAppState: (state: "active" | "background" | "inactive" | "starting") => {
        try {
            getStorage().set(STORAGE_KEYS.APP_STATE, state);
        } catch (error) {
            console.log("MMKV setAppState error:", error);
        }
    },

    // Get app state
    getAppState: (): string | undefined => {
        try {
            return getStorage().getString(STORAGE_KEYS.APP_STATE);
        } catch (error) {
            console.log("MMKV getAppState error:", error);
            return undefined;
        }
    },
};

// Export getter for storage (lazy init)
export const storage = {
    get instance() {
        return getStorage();
    },
};

export default storage;
