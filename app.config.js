import "dotenv/config";

export default {
    expo: {
        name: "testchat",
        slug: "testchat",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/icon.png",
        splash: {
            image: "./assets/images/transparent.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff",
            file: "./src/screens/SplashScreen.tsx",
        },
        scheme: "testchat",
        userInterfaceStyle: "automatic",
        newArchEnabled: true,
        ios: {
            supportsTablet: true,
            googleServicesFile: "./GoogleService-Info.plist", // Uncomment when you have iOS Firebase config
            bundleIdentifier: "com.anonymous.testchat",
            infoPlist: {
                NSFaceIDUsageDescription: "We use Face ID to unlock the app securely"
            }
        },
        android: {
            googleServicesFile: "./google-services.json",
            adaptiveIcon: {
                backgroundColor: "#E6F4FE",
                foregroundImage: "./assets/images/icon.png",
                // backgroundImage: "./assets/images/android-icon-background.png",
                // monochromeImage: "./assets/images/android-icon-monochrome.png",
            },
            edgeToEdgeEnabled: true,
            predictiveBackGestureEnabled: false,
            softwareKeyboardLayoutMode: "resize",
            package: "com.anonymous.testchat",
            permissions: [
                "android.permission.POST_NOTIFICATIONS",
                "USE_BIOMETRIC",
                "USE_FINGERPRINT"
            ],
        },
        web: {
            output: "static",
            favicon: "./assets/images/favicon.png",
        },
        plugins: [
            [
                "expo-notifications",
                {
                    icon: "./assets/images/notification-icon.png",
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
            "@react-native-community/datetimepicker",
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
