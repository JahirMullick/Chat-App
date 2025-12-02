import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import ChatScreen from "../screens/ChatScreen";
import DrawerNavigator from "./DrawerNavigator";
import { MainStackParamList } from "./types";

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainStack() {
    return (
        <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
            }}
        >
            <Stack.Screen name="Home" component={DrawerNavigator} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            {/* <Stack.Screen name="Profile" component={ProfileScreen} /> */}
            {/* <Stack.Screen name="Settings" component={SettingsScreen} /> */}
        </Stack.Navigator>
    );
}
