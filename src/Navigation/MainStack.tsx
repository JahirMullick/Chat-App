import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ChatFoldersScreen from "../screens/ChatFoldersScreen";
import ChatScreen from "../screens/ChatScreen";
import CreateGroupScreen from "../screens/CreateGroupScreen";
import NewChatScreen from "../screens/NewChatScreen";
import NewGroupScreen from "../screens/NewGroupScreen";
import QrProfileScreen from "../screens/QrProfileScreen";
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
            <Stack.Screen name="QrProfile" component={QrProfileScreen} />
            <Stack.Screen name="NewChat" component={NewChatScreen} />
            <Stack.Screen name="NewGroup" component={NewGroupScreen} />
            <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="ChatFolders" component={ChatFoldersScreen} />
            <Stack.Screen name="Test" component={TestScreen} />
        </Stack.Navigator>
    );
}
