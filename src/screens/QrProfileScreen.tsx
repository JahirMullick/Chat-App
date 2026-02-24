import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { useCallback, useMemo, useRef, useState } from "react";
import {
    Alert,
    Dimensions,
    Image,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    ToastAndroid,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ViewShot from "react-native-view-shot";
import StyledQRCode, { QRThemeSelector } from "../components/StyledQRCode";
import Colors from "../constants/colors";
import { useCurrentUserId, useUserProfile } from "../Hooks/useFirestore";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function QrProfileScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const currentUserId = useCurrentUserId();
    const [selectedThemeIndex, setSelectedThemeIndex] = useState(0);
    const viewShotRef = useRef<ViewShot>(null);

    // Get userId from route params, fallback to current user
    const params = route.params as { userId?: string } | undefined;
    const targetUserId = params?.userId || currentUserId;

    const { profile, loading } = useUserProfile(targetUserId || undefined);

    // 🔑 DYNAMIC USER DATA - Store only user ID for QR code
    const userData = useMemo(() => {
        const userInfo = {
            type: "user_profile",
            userId: targetUserId || "unknown",
        };
        return {
            userId: targetUserId || "unknown",
            username: profile?.displayName?.replace(/\s/g, "").toUpperCase() || "USERNAME",
            displayName: profile?.displayName || "User",
            avatar: profile?.photoURL || null,
            qrData: JSON.stringify(userInfo), // Only userId for QR scanning
        };
    }, [targetUserId, profile]);

    const handleBackPress = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const handleShare = async () => {
        try {
            if (viewShotRef.current && viewShotRef.current.capture) {
                const uri = await viewShotRef.current.capture();
                const isAvailable = await Sharing.isAvailableAsync();
                if (isAvailable) {
                    await Sharing.shareAsync(uri);
                } else {
                    if (Platform.OS === 'android') {
                        ToastAndroid.show("Sharing isn't available", ToastAndroid.SHORT);
                    } else {
                        Alert.alert("Sharing isn't available on your platform");
                    }
                }
            }
        } catch (error) {
            console.error("Error sharing QR code:", error);
            if (Platform.OS === 'android') {
                ToastAndroid.show("Could not share QR code", ToastAndroid.SHORT);
            } else {
                Alert.alert("Error", "Could not share the QR code.");
            }
        }
    };

    const handleDownload = async () => {
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                if (Platform.OS === 'android') {
                    ToastAndroid.show("Permission required to save", ToastAndroid.SHORT);
                } else {
                    Alert.alert("Permission Required", "We need permission to save the QR code to your gallery.");
                }
                return;
            }

            if (viewShotRef.current && viewShotRef.current.capture) {
                const uri = await viewShotRef.current.capture();
                await MediaLibrary.saveToLibraryAsync(uri);
                if (Platform.OS === 'android') {
                    ToastAndroid.show("Saved to gallery!", ToastAndroid.SHORT);
                } else {
                    Alert.alert("Success", "QR Code has been saved to your gallery!");
                }
            }
        } catch (error) {
            console.error("Error saving QR code:", error);
            if (Platform.OS === 'android') {
                ToastAndroid.show("Could not save QR code", ToastAndroid.SHORT);
            } else {
                Alert.alert("Error", "Could not save the QR code.");
            }
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>QR Code</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={[styles.scrollView, { marginBottom: insets.bottom }]} showsVerticalScrollIndicator={false}>

                {/* Main QR Card */}
                <View style={styles.centerContainer}>
                    <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1.0 }} style={styles.qrCard}>
                        {/* Avatar */}
                        {userData.avatar ? (
                            <Image
                                source={{ uri: userData.avatar }}
                                style={styles.avatar}
                            />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <Text style={styles.avatarText}>
                                    {userData.displayName.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        )}

                        {/* ✅ QR Code with Themes */}
                        <View style={styles.qrWrapper}>
                            <StyledQRCode
                                data={userData.qrData}
                                selectedThemeIndex={selectedThemeIndex}
                                onThemeChange={setSelectedThemeIndex}
                                showThemeSelector={false}
                            />
                        </View>

                        {/* Username */}
                        <Text style={styles.username}>@{userData.username}</Text>
                        {/* <Text style={styles.userIdText}>{userData.userId}</Text> */}
                    </ViewShot>
                </View>

                {/* QR Info Section */}
                <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>Share Your Profile</Text>
                    <Text style={styles.infoDescription}>
                        Let others scan this QR code to quickly add you as a contact
                    </Text>
                </View>

                {/* QR Theme Selector (outside ViewShot so it won't appear in screenshots) */}
                <QRThemeSelector
                    selectedThemeIndex={selectedThemeIndex}
                    onThemeChange={setSelectedThemeIndex}
                />

                {/* Action Buttons */}
                <View style={styles.actionSection}>
                    <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                        <MaterialCommunityIcons name="share-variant" size={20} color={Colors.white} />
                        <Text style={styles.shareButtonText}>Share QR Code</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
                        <MaterialCommunityIcons name="download" size={20} color={Colors.primary} />
                        <Text style={styles.downloadButtonText}>Download</Text>
                    </TouchableOpacity>
                </View>

                {/* Bottom Spacing */}
                <View style={styles.spacer} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.primary,
        paddingHorizontal: 4,
        paddingBottom: 10,
    },
    backButton: {
        padding: 10,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: "600",
        color: Colors.white,
        flex: 1,
        textAlign: "center",
        marginRight: 40,
    },
    headerSpacer: {
        width: 0,
    },
    centerContainer: {
        alignItems: "center",
        paddingVertical: 32,
    },
    qrCard: {
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 24,
        alignItems: "center",
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        marginHorizontal: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 20,
        borderWidth: 3,
        borderColor: Colors.primary,
    },
    avatarPlaceholder: {
        backgroundColor: Colors.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        color: Colors.white,
        fontSize: 32,
        fontWeight: "600",
    },
    qrWrapper: {
        marginVertical: 20,
    },
    username: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.textPrimary,
        marginTop: 16,
    },
    userIdText: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    infoSection: {
        paddingHorizontal: 24,
        paddingVertical: 20,
        backgroundColor: Colors.backgroundAccent,
        marginHorizontal: 16,
        marginVertical: 16,
        borderRadius: 12,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.primary,
        marginBottom: 6,
    },
    infoDescription: {
        fontSize: 13,
        color: Colors.textSecondary,
        lineHeight: 18,
    },
    actionSection: {
        paddingHorizontal: 16,
        gap: 12,
    },
    shareButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.primary,
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    shareButtonText: {
        color: Colors.white,
        fontSize: 15,
        fontWeight: "600",
    },
    downloadButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.white,
        borderWidth: 2,
        borderColor: Colors.primary,
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
        marginBottom: 24,
    },
    downloadButtonText: {
        color: Colors.primary,
        fontSize: 15,
        fontWeight: "600",
    },
    spacer: {
        height: 20,
    },
});
