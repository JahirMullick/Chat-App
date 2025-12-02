import { createDrawerNavigator } from "@react-navigation/drawer";
import React from "react";
import CustomDrawerContent from "../components/CustomDrawerContent";
import HomeScreen from "../screens/HomeScreen";

export type DrawerParamList = {
    HomeDrawer: undefined;
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
        </Drawer.Navigator>
    );
}
