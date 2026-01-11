import NetInfo from "@react-native-community/netinfo";
import { getAuth } from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { NavigationContainerRef } from "@react-navigation/native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./Navigation/AppNavigator";
import NoInternetScreen from "./screens/NoInternetScreen";
import { NotificationService } from "./services/notificationService";

// Hide Expo splash screen immediately to show custom splash screen
SplashScreen.hideAsync();


// Environment variable se Google Web Client ID access karo
const googleWebClientId = Constants.expoConfig?.extra?.googleWebClientId;

// Google Sign-In Configuration
GoogleSignin.configure({
    webClientId: googleWebClientId,
});

export default function App() {
    const navigationRef = useRef<NavigationContainerRef<any>>(null);
    const notificationListener = useRef<any>(undefined);
    const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined);

    // <--- NEW STATE FOR INTERNET --->
    const [isConnected, setIsConnected] = useState<boolean | null>(true);

    // <--- NEW USE EFFECT FOR NETWORK LISTENER --->
    useEffect(() => {
        // Subscribe to network state updates
        const unsubscribe = NetInfo.addEventListener((state) => {
            setIsConnected(state.isConnected);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    // <--- MANUAL REFRESH FUNCTION --->
    const handleManualRefresh = () => {
        NetInfo.fetch().then((state) => {
            setIsConnected(state.isConnected);
        });
    };

    // Existing Logic
    useEffect(() => {
        const checkInitialNotification = async () => {
            const remoteMessage = await NotificationService.getInitialNotification();
            if (remoteMessage && remoteMessage.data && remoteMessage.data.chatId) {
                setTimeout(() => {
                    navigationRef.current?.navigate("MainStack", {
                        screen: "Chat",
                        params: { chatId: String(remoteMessage.data!.chatId) },
                    });
                }, 1000);
            }
        };
        checkInitialNotification();

        const auth = getAuth();
        const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
            if (user) {
                await NotificationService.registerDeviceForNotifications(user.uid);
                const unsubscribeTokenRefresh = NotificationService.onTokenRefresh(user.uid);
                return () => {
                    unsubscribeTokenRefresh();
                };
            }
        });

        const unsubscribeForeground = NotificationService.onMessageReceived((message) => {
            console.log("📬 Foreground message:", message);
        });

        const unsubscribeBackground = NotificationService.onNotificationOpenedApp((message) => {
            if (message && message.data && message.data.chatId) {
                navigationRef.current?.navigate("MainStack", {
                    screen: "Chat",
                    params: { chatId: String(message.data.chatId) },
                });
            }
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(
            (response) => {
                console.log("👆 Notification tapped:", response);
                const data = response.notification.request.content.data;

                if (data?.chatId) {
                    navigationRef.current?.navigate("MainStack", {
                        screen: "Chat",
                        params: { chatId: String(data.chatId) },
                    });
                }
            }
        );

        return () => {
            unsubscribeAuth();
            unsubscribeForeground();
            unsubscribeBackground();
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []);

    // <--- CHECK CONNECTION BEFORE RENDERING APP --->
    if (isConnected === false) {
        return <NoInternetScreen onRefresh={handleManualRefresh} />;
    }

    return (
        <SafeAreaProvider>
            <KeyboardProvider>
                <AppNavigator ref={navigationRef} />
            </KeyboardProvider>
        </SafeAreaProvider>
    );
}