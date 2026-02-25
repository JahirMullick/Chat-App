import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CallsScreen from "../screens/CallsScreen";
import ChatBackgroundScreen from "../screens/ChatBackgroundScreen";
import ChatFoldersScreen from "../screens/ChatFoldersScreen";
import ChatScreen from "../screens/ChatScreen";
import ContactsScreen from "../screens/ContactsScreen";
import CreateGroupScreen from "../screens/CreateGroupScreen";
import GroupProfileScreen from "../screens/GroupProfileScreen";
import MyStarScreen from "../screens/MyStarScreen";
import NewChatScreen from "../screens/NewChatScreen";
import NewGroupScreen from "../screens/NewGroupScreen";
import PasscodeScreen from "../screens/PasscodeScreen";
import PasscodeSettingsScreen from "../screens/PasscodeSettingsScreen";
import QrProfileScreen from "../screens/QrProfileScreen";
import SecurityScreen from "../screens/SecurityScreen";
import SettingsScreen from "../screens/SettingsScreen";
import TestScreen from "../screens/TestScreen";
import UserProfileScreen from "../screens/UserProfileScreen";
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
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
            <Stack.Screen name="GroupProfile" component={GroupProfileScreen} />
            <Stack.Screen name="Contacts" component={ContactsScreen} />
            <Stack.Screen name="Calls" component={CallsScreen} />
            <Stack.Screen name="MyStar" component={MyStarScreen} />
            <Stack.Screen name="Test" component={TestScreen} />
            <Stack.Screen name="Security" component={SecurityScreen} />
            <Stack.Screen
                name="Passcode"
                component={PasscodeScreen}
                options={{ animation: "slide_from_bottom" }}
            />
            <Stack.Screen name="PasscodeSettings" component={PasscodeSettingsScreen} />
            <Stack.Screen name="NewChat" component={NewChatScreen} />
            <Stack.Screen name="NewGroup" component={NewGroupScreen} />
            <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="ChatFolders" component={ChatFoldersScreen} />
            <Stack.Screen name="ChatBackground" component={ChatBackgroundScreen} />
            <Stack.Screen name="QrProfile" component={QrProfileScreen} />
        </Stack.Navigator>
    );
}
