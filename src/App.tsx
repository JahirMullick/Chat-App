// import NetInfo from "@react-native-community/netinfo";
// import { getAuth } from "@react-native-firebase/auth";
// import { GoogleSignin } from "@react-native-google-signin/google-signin";
// import { NavigationContainerRef } from "@react-navigation/native";
// import Constants from "expo-constants";
// import * as Notifications from "expo-notifications";
// import * as SplashScreen from "expo-splash-screen";
// import React, { useEffect, useRef, useState } from "react";
// import { KeyboardProvider } from "react-native-keyboard-controller";
// import { SafeAreaProvider } from "react-native-safe-area-context";
// import AppNavigator from "./Navigation/AppNavigator";
// import NoInternetScreen from "./screens/NoInternetScreen";
// import { NotificationService } from "./services/notificationService";

// // Hide Expo splash screen immediately to show custom splash screen
// SplashScreen.hideAsync();


// // Environment variable se Google Web Client ID access karo
// const googleWebClientId = Constants.expoConfig?.extra?.googleWebClientId;

// // Google Sign-In Configuration
// GoogleSignin.configure({
//     webClientId: googleWebClientId,
// });

// export default function App() {
//     const navigationRef = useRef<NavigationContainerRef<any>>(null);
//     const notificationListener = useRef<any>(undefined);
//     const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined);

//     // <--- NEW STATE FOR INTERNET --->
//     const [isConnected, setIsConnected] = useState<boolean | null>(true);

//     // <--- NEW USE EFFECT FOR NETWORK LISTENER --->
//     useEffect(() => {
//         // Subscribe to network state updates
//         const unsubscribe = NetInfo.addEventListener((state) => {
//             setIsConnected(state.isConnected);
//         });

//         return () => {
//             unsubscribe();
//         };
//     }, []);

//     // <--- MANUAL REFRESH FUNCTION --->
//     const handleManualRefresh = () => {
//         NetInfo.fetch().then((state) => {
//             setIsConnected(state.isConnected);
//         });
//     };

//     // Existing Logic
//     useEffect(() => {
//         const checkInitialNotification = async () => {
//             const remoteMessage = await NotificationService.getInitialNotification();
//             if (remoteMessage && remoteMessage.data && remoteMessage.data.chatId) {
//                 setTimeout(() => {
//                     navigationRef.current?.navigate("MainStack", {
//                         screen: "Chat",
//                         params: { chatId: String(remoteMessage.data!.chatId) },
//                     });
//                 }, 1000);
//             }
//         };
//         checkInitialNotification();

//         const auth = getAuth();
//         const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
//             if (user) {
//                 await NotificationService.registerDeviceForNotifications(user.uid);
//                 const unsubscribeTokenRefresh = NotificationService.onTokenRefresh(user.uid);
//                 return () => {
//                     unsubscribeTokenRefresh();
//                 };
//             }
//         });

//         const unsubscribeForeground = NotificationService.onMessageReceived((message) => {
//             console.log("📬 Foreground message:", message);
//         });

//         const unsubscribeBackground = NotificationService.onNotificationOpenedApp((message) => {
//             if (message && message.data && message.data.chatId) {
//                 navigationRef.current?.navigate("MainStack", {
//                     screen: "Chat",
//                     params: { chatId: String(message.data.chatId) },
//                 });
//             }
//         });

//         responseListener.current = Notifications.addNotificationResponseReceivedListener(
//             (response) => {
//                 console.log("👆 Notification tapped:", response);
//                 const data = response.notification.request.content.data;

//                 if (data?.chatId) {
//                     navigationRef.current?.navigate("MainStack", {
//                         screen: "Chat",
//                         params: { chatId: String(data.chatId) },
//                     });
//                 }
//             }
//         );

//         return () => {
//             unsubscribeAuth();
//             unsubscribeForeground();
//             unsubscribeBackground();
//             if (responseListener.current) {
//                 responseListener.current.remove();
//             }
//         };
//     }, []);

//     // <--- CHECK CONNECTION BEFORE RENDERING APP --->
//     if (isConnected === false) {
//         return <NoInternetScreen onRefresh={handleManualRefresh} />;
//     }

//     return (
//         <SafeAreaProvider>
//             <KeyboardProvider>
//                 <AppNavigator ref={navigationRef} />
//             </KeyboardProvider>
//         </SafeAreaProvider>
//     );
// }


// V2 (Implement Lock Screen):
// App.tsx

import NetInfo from "@react-native-community/netinfo";
import { getAuth } from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { NavigationContainerRef } from "@react-navigation/native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import LockScreen from "./components/LockScreen";
import AppNavigator from "./Navigation/AppNavigator";
import NoInternetScreen from "./screens/NoInternetScreen";
import { NotificationService } from "./services/notificationService";

// SplashScreen.hideAsync(); // Commented out: using only custom splash screen

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
    const appState = useRef<AppStateStatus>(AppState.currentState);

    // State for Internet
    const [isConnected, setIsConnected] = useState<boolean | null>(true);

    // <--- NEW STATE FOR LOCK SCREEN --->
    const [isLocked, setIsLocked] = useState<boolean>(true);
    const [lockEnabled, setLockEnabled] = useState<boolean>(true);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    // Network listener
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            setIsConnected(state.isConnected);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    // Manual refresh function
    const handleManualRefresh = (): void => {
        NetInfo.fetch().then((state) => {
            setIsConnected(state.isConnected);
        });
    };

    // <--- LOAD LOCK PREFERENCE --->
    useEffect(() => {
        const loadLockPreference = async (): Promise<void> => {
            try {
                const preference: string | null = await SecureStore.getItemAsync('lock_enabled');
                if (preference !== null) {
                    setLockEnabled(preference === 'true');
                }
            } catch (error) {
                console.error('Error loading lock preference:', error);
            }
        };

        loadLockPreference();
    }, []);

    // <--- APP STATE LISTENER FOR AUTO-LOCK --->
    useEffect(() => {
        const subscription = AppState.addEventListener(
            'change',
            (nextAppState: AppStateStatus) => {
                // Lock app when going to background
                if (
                    appState.current === 'active' &&
                    nextAppState.match(/inactive|background/)
                ) {
                    if (lockEnabled && isAuthenticated) {
                        setIsLocked(true);
                    }
                }
                appState.current = nextAppState;
            }
        );

        return () => {
            subscription?.remove();
        };
    }, [lockEnabled, isAuthenticated]);

    // <--- HANDLE UNLOCK --->
    const handleUnlock = useCallback((): void => {
        setIsLocked(false);
    }, []);

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
                // <--- SET AUTHENTICATED STATE --->
                setIsAuthenticated(true);

                await NotificationService.registerDeviceForNotifications(user.uid);
                const unsubscribeTokenRefresh = NotificationService.onTokenRefresh(user.uid);
                return () => {
                    unsubscribeTokenRefresh();
                };
            } else {
                // <--- USER LOGGED OUT --->
                setIsAuthenticated(false);
                setIsLocked(false); // Don't show lock screen when not logged in
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

    // <--- CHECK CONNECTION FIRST --->
    if (isConnected === false) {
        return <NoInternetScreen onRefresh={handleManualRefresh} />;
    }

    // <--- SHOW LOCK SCREEN IF LOCKED AND USER IS AUTHENTICATED --->
    if (isLocked && lockEnabled && isAuthenticated) {
        return <LockScreen onUnlock={handleUnlock} />;
    }

    return (
        <SafeAreaProvider>
            <KeyboardProvider>
                <AppNavigator ref={navigationRef} />
            </KeyboardProvider>
        </SafeAreaProvider>
    );
}
