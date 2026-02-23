import { NativeStackScreenProps } from "@react-navigation/native-stack";

// Auth Stack Types
export type AuthStackParamList = {
    Login: undefined;
    Signup: undefined;
    ForgotPassword: undefined;
    CompleteProfile: undefined;
};

// Main Stack Types
export type MainStackParamList = {
    Home: undefined;
    Chat: {
        chatId?: string;
        recipientId?: string; // For new chats that haven't been created yet
        name: string;
        avatar?: string;
        avatarColor?: string;
        isOnline?: boolean;
    };
    UserProfile: {
        recipientId: string;
        chatId?: string;
        name: string;
        avatar?: string;
        avatarColor?: string;
        phoneNumber?: string;
        username?: string;
    };
    Contacts: undefined;
    Calls: undefined;
    QrProfile: {
        userId?: string;
    };
    NewChat: undefined;
    NewGroup: undefined;
    CreateGroup: {
        selectedUsers: string[];
    };
    Test: undefined;
    Profile: undefined;
    Settings: undefined;
    ChatFolders: undefined;
    ChatBackground: undefined;
    Security: undefined;
    Passcode: { mode: "create" | "verify" | "change" | "disable"; onSuccess?: () => void; customTitle?: string; customSubtitle?: string; };
    PasscodeSettings: undefined;
    MyStar: undefined;
};

// Root Stack Types (combines Auth and Main)
export type RootStackParamList = {
    Auth: undefined;
    Main: undefined;
};

// Screen Props Types
export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
    NativeStackScreenProps<AuthStackParamList, T>;

export type MainStackScreenProps<T extends keyof MainStackParamList> =
    NativeStackScreenProps<MainStackParamList, T>;

export type RootStackScreenProps<T extends keyof RootStackParamList> =
    NativeStackScreenProps<RootStackParamList, T>;

// Declare global types for useNavigation hook
declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList { }
    }
}
