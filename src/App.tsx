import { GoogleSignin } from "@react-native-google-signin/google-signin";
import Constants from "expo-constants";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./Navigation/AppNavigator";

// Environment variable se Google Web Client ID access karo
const googleWebClientId = Constants.expoConfig?.extra?.googleWebClientId;

// Google Sign-In Configuration - Initialize before any sign-in request
GoogleSignin.configure({
    webClientId: googleWebClientId,
});

export default function App() {
    return (
        <SafeAreaProvider>
            <AppNavigator />
        </SafeAreaProvider>
    );
}
