import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import ChatFoldersScreen from "../screens/ChatFoldersScreen";
import ChatScreen from "../screens/ChatScreen";
import NewChatScreen from "../screens/NewChatScreen";
import SettingsScreen from "../screens/SettingsScreen";
import TestScreen from "../screens/TestScreen";
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
            <Stack.Screen name="NewChat" component={NewChatScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="ChatFolders" component={ChatFoldersScreen} />
            <Stack.Screen name="Test" component={TestScreen} />
        </Stack.Navigator>
    );
}
