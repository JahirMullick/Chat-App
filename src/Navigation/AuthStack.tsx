import { getAuth } from "@react-native-firebase/auth";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import CompleteProfileScreen from "../screens/CompleteProfileScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import { AuthStackParamList } from "./types";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
    // If user is authenticated, show CompleteProfile; otherwise show Login
    const auth = getAuth();
    const isAuthenticated = auth.currentUser !== null;
    const initialRoute = isAuthenticated ? "CompleteProfile" : "Login";

    console.log('🔑 AuthStack - isAuthenticated:', isAuthenticated, 'initialRoute:', initialRoute);

    return (
        <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{
                headerShown: false,
                animation: "simple_push",
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
        </Stack.Navigator>
    );
}
