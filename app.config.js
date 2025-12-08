import "dotenv/config";

export default {
    expo: {
        name: "testchat",
        slug: "testchat",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/Logo.png",
        scheme: "testchat",
        userInterfaceStyle: "automatic",
        newArchEnabled: true,
        ios: {
            supportsTablet: true,
            // googleServicesFile: "./GoogleService-Info.plist", // Uncomment when you have iOS Firebase config
            bundleIdentifier: "com.anonymous.testchat",
        },
        android: {
            googleServicesFile: "./google-services.json",
            adaptiveIcon: {
                backgroundColor: "#E6F4FE",
                foregroundImage: "./assets/images/android-icon-foreground.png",
                backgroundImage: "./assets/images/android-icon-background.png",
                monochromeImage: "./assets/images/android-icon-monochrome.png",
            },
            edgeToEdgeEnabled: true,
            predictiveBackGestureEnabled: false,
            softwareKeyboardLayoutMode: "resize",
            package: "com.anonymous.testchat",
            permissions: [
                "android.permission.POST_NOTIFICATIONS",
            ],
        },
        web: {
            output: "static",
            favicon: "./assets/images/favicon.png",
        },
        plugins: [
            [
                "expo-splash-screen",
                {
                    image: "./assets/images/splash-icon.png",
                    imageWidth: 200,
                    resizeMode: "contain",
                    backgroundColor: "#ffffff",
                    dark: {
                        backgroundColor: "#000000",
                    },
                },
            ],
            [
                "expo-notifications",
                {
                    icon: "./assets/images/notification-icon.png",
                    color: "#ffffff",
                    sounds: ["./assets/sounds/notification.wav"],
                    mode: "production",
                },
            ],
            "@react-native-firebase/app",
            "@react-native-firebase/auth",
            "@react-native-firebase/crashlytics",
            [
                "expo-build-properties",
                {
                    ios: {
                        useFrameworks: "static",
                    },
                },
            ],
            ["@react-native-google-signin/google-signin"],
        ],
        experiments: {
            reactCompiler: true,
        },
        // Extra variables jo app mein accessible honge
        extra: {
            googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID,
            eas: {
                projectId: "8a9b4461-d8c8-46db-8fee-d8b7d21ce494"
            },
        },
    },
};
