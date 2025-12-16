import { FirebaseAuthTypes, getAuth } from "@react-native-firebase/auth";
import { NavigationContainer, NavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { forwardRef, useEffect, useState } from "react";
import { SplashScreen } from "../screens";
import { TabService, testFirestoreConnection, UserService } from "../services/firestore";
import { SessionStorage } from "../utils/storage";
import AuthStack from "./AuthStack";
import MainStack from "./MainStack";
import { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = forwardRef<NavigationContainerRef<any>>((props, ref) => {
    const [showSplash, setShowSplash] = useState(true);
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
    const [profileCompleted, setProfileCompleted] = useState<boolean>(false);

    // Test Firestore connection on app start
    useEffect(() => {
        (async () => {
            const connected = await testFirestoreConnection();
            console.log("Firestore connection result:", connected);
        })();
    }, []);

    // Handle user state changes
    const onAuthStateChanged = async (user: FirebaseAuthTypes.User | null) => {
        setUser(user);

        // Store session in MMKV when user logs in (for future use if needed)
        if (user) {
            SessionStorage.setSession(user.uid, {
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
            });

            // Sync user to Firestore
            try {
                // Get existing user profile first
                const existingProfile = await UserService.getUserById(user.uid);

                // Only update basic auth fields, preserve existing photoURL from Firestore
                await UserService.createOrUpdateUser(user.uid, {
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: existingProfile?.photoURL || user.photoURL, // Use Firestore photoURL if exists
                });

                // Initialize user tabs if needed
                await TabService.initializeUserTabs(user.uid);

                // Check if profile is completed
                setProfileCompleted(existingProfile?.profileCompleted || false);
            } catch (error) {
                console.error("Error syncing user to Firestore:", error);
            }
        } else {
            // Clear session when user logs out
            SessionStorage.clearSession();
        }

        if (initializing) setInitializing(false);
    };

    useEffect(() => {
        const auth = getAuth();
        const subscriber = auth.onAuthStateChanged(onAuthStateChanged);
        return subscriber; // unsubscribe on unmount
    }, []);

    // Listen to profile completion changes for the current user
    useEffect(() => {
        if (!user) return;

        const unsubscribe = UserService.subscribeToUser(
            user.uid,
            (userProfile) => {
                if (userProfile) {
                    setProfileCompleted(userProfile.profileCompleted || false);
                }
            },
            (error) => {
                console.error("Error subscribing to user profile:", error);
            }
        );

        return () => unsubscribe();
    }, [user]);

    // Handle splash screen finish
    const handleSplashFinish = () => {
        setShowSplash(false);
    };

    // Show splash screen first
    if (showSplash) {
        return <SplashScreen onFinish={handleSplashFinish} duration={2500} />;
    }

    // Show nothing while initializing auth (splash already hidden means auth should be ready)
    if (initializing) {
        return <SplashScreen duration={0} />;
    }

    return (
        <NavigationContainer ref={ref}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {user ? (
                    profileCompleted ? (
                        <Stack.Screen name="Main" component={MainStack} />
                    ) : (
                        <Stack.Screen name="Auth" component={AuthStack} />
                    )
                ) : (
                    <Stack.Screen name="Auth" component={AuthStack} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
});

export default AppNavigator;
