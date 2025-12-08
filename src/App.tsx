import auth from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { NavigationContainerRef } from "@react-navigation/native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import React, { useEffect, useRef } from "react";
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
    const notificationListener = useRef<any>();
    const responseListener = useRef<any>();

    useEffect(() => {
        // Register for push notifications when user logs in
        const unsubscribe = auth().onAuthStateChanged(async (user) => {
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
                Notifications.removeNotificationSubscription(notificationListener.current);
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
            }
        };
    }, []);

    return (
        <SafeAreaProvider>
            <AppNavigator ref={navigationRef} />
        </SafeAreaProvider>
    );
}
