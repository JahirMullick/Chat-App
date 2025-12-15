import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useCallback, useMemo } from "react";
import {
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "../constants/colors";
import { useCurrentUserId, useUserProfile } from "../Hooks/useFirestore";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function QrProfileScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const currentUserId = useCurrentUserId();

    // Get userId from route params, fallback to current user
    const params = route.params as { userId?: string } | undefined;
    const targetUserId = params?.userId || currentUserId;

    const { profile, loading } = useUserProfile(targetUserId || undefined);

    // 🔑 DYNAMIC USER DATA
    const userData = useMemo(() => ({
        id: targetUserId || "unknown",
        username: profile?.displayName?.replace(/\s/g, "").toUpperCase() || "USERNAME",
        displayName: profile?.displayName || "User",
        avatar: profile?.photoURL,
        profileUrl: `https://myapp.com/u/${targetUserId || "unknown"}`,
    }), [targetUserId, profile]);

    const handleBackPress = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const handleShare = useCallback(() => {
        Alert.alert("Share", "QR Code sharing feature coming soon!");
    }, []);

    const themes = ["🏠", "🐥", "⛄", "💎", "🤓"];

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
                    <View style={styles.qrCard}>
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

                        {/* ✅ REAL QR GENERATION */}
                        <View style={styles.qrWrapper}>
                            <View style={styles.qrCodeContainer}>
                                <QRCode
                                    value={userData.profileUrl}
                                    size={220}
                                    color={Colors.primary}
                                    backgroundColor={Colors.white}
                                    quietZone={10}
                                />
                            </View>
                        </View>

                        {/* Username */}
                        <Text style={styles.username}>@{userData.username}</Text>
                        <Text style={styles.userIdText}>{userData.id}</Text>
                    </View>
                </View>

                {/* QR Info Section */}
                <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>Share Your Profile</Text>
                    <Text style={styles.infoDescription}>
                        Let others scan this QR code to quickly add you as a contact
                    </Text>
                </View>

                {/* QR Themes Section */}
                <View style={styles.themesSection}>
                    <Text style={styles.themesTitle}>QR Code Styles</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.themesContent}
                    >
                        {themes.map((icon, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.qrStyleCard}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.qrIcon}>{icon}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionSection}>
                    <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                        <MaterialCommunityIcons name="share-variant" size={20} color={Colors.white} />
                        <Text style={styles.shareButtonText}>Share QR Code</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.downloadButton}>
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
        backgroundColor: Colors.white,
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
    qrCodeContainer: {
        backgroundColor: Colors.white,
        padding: 20,
        borderRadius: 16,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
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
    themesSection: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    themesTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.textPrimary,
        marginBottom: 12,
    },
    themesContent: {
        paddingRight: 16,
    },
    qrStyleCard: {
        width: 80,
        height: 80,
        borderRadius: 16,
        backgroundColor: Colors.gray50,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
        borderWidth: 2,
        borderColor: Colors.borderLight,
    },
    qrIcon: {
        fontSize: 32,
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
