import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import { registerRootComponent } from "expo";
import { LogBox } from 'react-native';
import App from "./src/App";

// Ignore Firebase namespaced API deprecation warnings until we migrate to modular SDK v22
LogBox.ignoreLogs([
    'This method is deprecated (as well as all React Native Firebase namespaced API)',
]);

// Register background handler (must be done outside of component)
const messaging = getMessaging();
setBackgroundMessageHandler(messaging, async (remoteMessage) => {
    console.log('📬 Background message received:', remoteMessage);
});

registerRootComponent(App);
