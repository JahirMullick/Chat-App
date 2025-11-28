import { Stack } from "expo-router";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import Constants from "expo-constants";

// Environment variable se Google Web Client ID access karo
const googleWebClientId = Constants.expoConfig?.extra?.googleWebClientId;

// Google Sign-In Configuration - Initialize before any sign-in request
GoogleSignin.configure({
  webClientId: googleWebClientId,
});

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
