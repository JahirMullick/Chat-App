import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import { registerRootComponent } from "expo";
import App from "./src/App";

// Register background handler (must be done outside of component)
const messaging = getMessaging();
setBackgroundMessageHandler(messaging, async (remoteMessage) => {
    console.log('📬 Background message received:', remoteMessage);
});

registerRootComponent(App);
