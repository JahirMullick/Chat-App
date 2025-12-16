import { getAuth } from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { NavigationContainerRef } from "@react-navigation/native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./Navigation/AppNavigator";
import NotificationService from "./services/notificationService";

// Environment variable se Google Web Client ID access karo
const googleWebClientId = Constants.expoConfig?.extra?.googleWebClientId;

// Google Sign-In Configuration - Initialize before any sign-in request
GoogleSignin.configure({
    webClientId: googleWebClientId,
});

export default function App() {
    const navigationRef = useRef<NavigationContainerRef<any>>(null);
    const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
    const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

    useEffect(() => {
        // Request notification permissions on app startup
        const requestNotificationPermissions = async () => {
            try {
                await NotificationService.registerForPushNotificationsAsync();
                console.log('✅ Notification permissions requested');
            } catch (error) {
                console.error('❌ Error requesting notification permissions:', error);
            }
        };

        // Request permissions immediately on app launch
        requestNotificationPermissions();

        // Register for push notifications when user logs in
        const auth = getAuth();
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                const token = await NotificationService.registerForPushNotificationsAsync();
                if (token) {
                    await NotificationService.saveUserPushToken(user.uid, token);
                }
            }
        });

        // Listen for notifications while app is in foreground
        notificationListener.current = NotificationService.addNotificationReceivedListener(
            (notification) => {
                console.log("📬 Notification received:", notification);
                // You can show custom in-app notification UI here if needed
            }
        );

        // Listen for notification taps
        responseListener.current = NotificationService.addNotificationResponseListener(
            (response) => {
                console.log("👆 Notification tapped:", response);
                const data = response.notification.request.content.data;

                // Navigate to specific chat when notification is tapped
                if (data?.type === "chat_message" && data?.chatId) {
                    // Wait for navigation to be ready
                    setTimeout(() => {
                        navigationRef.current?.navigate("MainStack", {
                            screen: "Chat",
                            params: { chatId: data.chatId },
                        });
                    }, 100);
                }
            }
        );

        return () => {
            unsubscribe();
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []);

    return (
        <SafeAreaProvider>
            <KeyboardProvider> //TODO: add this to fix the keyboard issue on chat screen
                <AppNavigator ref={navigationRef} />
            </KeyboardProvider>
        </SafeAreaProvider>
    );
}
