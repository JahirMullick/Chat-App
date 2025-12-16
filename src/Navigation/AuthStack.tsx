import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import CompleteProfileScreen from "../screens/CompleteProfileScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import { AuthStackParamList } from "./types";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
    return (
        <Stack.Navigator
            initialRouteName="Login"
            // initialRouteName="CompleteProfile"
            screenOptions={{
                headerShown: false,
                // animation: "slide_from_right",
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
