import { createDrawerNavigator } from "@react-navigation/drawer";
import React from "react";
import CustomDrawerContent from "../components/CustomDrawerContent";
import HomeScreen from "../screens/HomeScreen";

export type DrawerParamList = {
    HomeDrawer: undefined;
    TestScreen: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

export default function DrawerNavigator() {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
                drawerType: "front",
                drawerStyle: {
                    width: "80%",
                },
                overlayColor: "rgba(0,0,0,0.5)",
            }}
        >
            <Drawer.Screen name="HomeDrawer" component={HomeScreen} />
            {/* This is a dummy screen for navigation, actual navigation to TestScreen is handled in MainStack */}
        </Drawer.Navigator>
    );
}
