import * as SecureStore from "expo-secure-store";
import { MMKV } from "react-native-mmkv";

// Lazy initialization - only create MMKV when actually needed
let _storage: MMKV | null = null;
let _mmkvFailed = false;

// Fallback storage using in-memory Map when MMKV is not available (e.g., Chrome debugger)
const fallbackStorage = new Map<string, string | boolean>();

const getStorage = (): MMKV | null => {
    if (_mmkvFailed) {
        return null;
    }

    if (!_storage) {
        try {
            _storage = new MMKV();
        } catch (error) {
            console.warn("⚠️ MMKV not available (Chrome debugger?), using fallback storage");
            _mmkvFailed = true;
            return null;
        }
    }
    return _storage;
};

// Storage keys
export const STORAGE_KEYS = {
    USER_SESSION: "user_session",
    IS_LOGGED_IN: "is_logged_in",
    USER_DATA: "user_data",
    APP_STATE: "app_state",
    CHAT_BACKGROUND: "chat_background",
    // Security Keys
    PASSCODE: "passcode",
    ENABLE_FINGERPRINT: "enable_fingerprint",
    AUTO_LOCK: "auto_lock",
    SHOW_IN_TASK_SWITCHER: "show_in_task_switcher",
} as const;

// Session management functions
export const SessionStorage = {
    // Set user session
    setSession: (userId: string, userData?: Record<string, unknown>) => {
        try {
            const storage = getStorage();
            if (storage) {
                storage.set(STORAGE_KEYS.IS_LOGGED_IN, true);
                storage.set(STORAGE_KEYS.USER_SESSION, userId);
                if (userData) {
                    storage.set(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
                }
            } else {
                fallbackStorage.set(STORAGE_KEYS.IS_LOGGED_IN, true);
                fallbackStorage.set(STORAGE_KEYS.USER_SESSION, userId);
                if (userData) {
                    fallbackStorage.set(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
                }
            }
        } catch (error) {
            console.log("MMKV setSession error:", error);
        }
    },

    // Get user session
    getSession: (): string | undefined => {
        try {
            const storage = getStorage();
            return storage ? storage.getString(STORAGE_KEYS.USER_SESSION) :
                fallbackStorage.get(STORAGE_KEYS.USER_SESSION) as string | undefined;
        } catch (error) {
            console.log("MMKV getSession error:", error);
            return undefined;
        }
    },

    // Check if user is logged in
    isLoggedIn: (): boolean => {
        try {
            const storage = getStorage();
            return storage ? (storage.getBoolean(STORAGE_KEYS.IS_LOGGED_IN) ?? false) :
                (fallbackStorage.get(STORAGE_KEYS.IS_LOGGED_IN) as boolean ?? false);
        } catch (error) {
            console.log("MMKV isLoggedIn error:", error);
            return false;
        }
    },

    // Get user data
    getUserData: (): Record<string, unknown> | null => {
        try {
            const storage = getStorage();
            const data = storage ? storage.getString(STORAGE_KEYS.USER_DATA) :
                fallbackStorage.get(STORAGE_KEYS.USER_DATA) as string | undefined;
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
            if (storage) {
                storage.delete(STORAGE_KEYS.IS_LOGGED_IN);
                storage.delete(STORAGE_KEYS.USER_SESSION);
                storage.delete(STORAGE_KEYS.USER_DATA);
            } else {
                fallbackStorage.delete(STORAGE_KEYS.IS_LOGGED_IN);
                fallbackStorage.delete(STORAGE_KEYS.USER_SESSION);
                fallbackStorage.delete(STORAGE_KEYS.USER_DATA);
            }
        } catch (error) {
            console.log("MMKV clearSession error:", error);
        }
    },

    // Clear all storage
    clearAll: () => {
        try {
            const storage = getStorage();
            if (storage) {
                storage.clearAll();
            } else {
                fallbackStorage.clear();
            }
        } catch (error) {
            console.log("MMKV clearAll error:", error);
        }
    },

    // Set app state for detecting app restart
    setAppState: (state: "active" | "background" | "inactive" | "starting") => {
        try {
            const storage = getStorage();
            if (storage) {
                storage.set(STORAGE_KEYS.APP_STATE, state);
            } else {
                fallbackStorage.set(STORAGE_KEYS.APP_STATE, state);
            }
        } catch (error) {
            console.log("MMKV setAppState error:", error);
        }
    },

    // Get app state
    getAppState: (): string | undefined => {
        try {
            const storage = getStorage();
            return storage ? storage.getString(STORAGE_KEYS.APP_STATE) :
                fallbackStorage.get(STORAGE_KEYS.APP_STATE) as string | undefined;
        } catch (error) {
            console.log("MMKV getAppState error:", error);
            return undefined;
        }
    },
};

// Background management functions
export const BackgroundStorage = {
    // Set chat background
    setBackground: (backgroundId: string) => {
        try {
            console.log("💾 Saving background ID:", backgroundId);
            const storage = getStorage();
            if (storage) {
                storage.set(STORAGE_KEYS.CHAT_BACKGROUND, backgroundId);
            } else {
                // Fallback to in-memory storage
                fallbackStorage.set(STORAGE_KEYS.CHAT_BACKGROUND, backgroundId);
            }
        } catch (error) {
            console.log("MMKV setBackground error:", error);
        }
    },

    // Get chat background
    getBackground: (): string | undefined => {
        try {
            const storage = getStorage();
            if (storage) {
                const bgId = storage.getString(STORAGE_KEYS.CHAT_BACKGROUND);
                console.log("💾 Retrieved background ID:", bgId);
                return bgId;
            } else {
                // Fallback to in-memory storage
                const bgId = fallbackStorage.get(STORAGE_KEYS.CHAT_BACKGROUND) as string | undefined;
                console.log("💾 Retrieved background ID (fallback):", bgId);
                return bgId;
            }
        } catch (error) {
            console.log("MMKV getBackground error:", error);
            return undefined;
        }
    },

    // Clear background (reset to default)
    clearBackground: () => {
        try {
            const storage = getStorage();
            if (storage) {
                storage.delete(STORAGE_KEYS.CHAT_BACKGROUND);
            } else {
                fallbackStorage.delete(STORAGE_KEYS.CHAT_BACKGROUND);
            }
        } catch (error) {
            console.log("MMKV clearBackground error:", error);
        }
    },
};

// Security storage functions
export const SecurityStorage = {
    setPasscode: async (passcode: string) => {
        try {
            await SecureStore.setItemAsync("app_pin", passcode);
        } catch (error) {
            console.log("SecureStore setPasscode error:", error);
        }
    },
    getPasscode: async (): Promise<string | null> => {
        try {
            return await SecureStore.getItemAsync("app_pin");
        } catch (error) {
            console.log("SecureStore getPasscode error:", error);
            return null;
        }
    },
    clearPasscode: async () => {
        try {
            await SecureStore.deleteItemAsync("app_pin");
        } catch (error) {
            console.log("SecureStore clearPasscode error:", error);
        }
    },
    setEnableFingerprint: (enabled: boolean) => {
        try {
            const storage = getStorage();
            if (storage) storage.set(STORAGE_KEYS.ENABLE_FINGERPRINT, enabled);
        } catch (error) {
            console.log("MMKV setEnableFingerprint error:", error);
        }
    },
    getEnableFingerprint: (): boolean => {
        try {
            const storage = getStorage();
            if (storage) return storage.getBoolean(STORAGE_KEYS.ENABLE_FINGERPRINT) ?? false;
        } catch (error) {
            console.log("MMKV getEnableFingerprint error:", error);
        }
        return false;
    },
    setAutoLock: (value: string) => {
        try {
            const storage = getStorage();
            if (storage) storage.set(STORAGE_KEYS.AUTO_LOCK, value);
        } catch (error) {
            console.log("MMKV setAutoLock error:", error);
        }
    },
    getAutoLock: (): string => {
        try {
            const storage = getStorage();
            if (storage) return storage.getString(STORAGE_KEYS.AUTO_LOCK) ?? "in 1 minute";
        } catch (error) {
            console.log("MMKV getAutoLock error:", error);
        }
        return "in 1 minute";
    },
    setShowInTaskSwitcher: (enabled: boolean) => {
        try {
            const storage = getStorage();
            if (storage) storage.set(STORAGE_KEYS.SHOW_IN_TASK_SWITCHER, enabled);
        } catch (error) {
            console.log("MMKV setShowInTaskSwitcher error:", error);
        }
    },
    getShowInTaskSwitcher: (): boolean => {
        try {
            const storage = getStorage();
            if (storage) return storage.getBoolean(STORAGE_KEYS.SHOW_IN_TASK_SWITCHER) ?? true;
        } catch (error) {
            console.log("MMKV getShowInTaskSwitcher error:", error);
        }
        return true;
    }
};

// Export getter for storage (lazy init)
export const storage = {
    get instance() {
        return getStorage();
    },
};

export default storage;
