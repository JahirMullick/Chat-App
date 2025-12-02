import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { AuthStackParamList } from "../Navigation/types";

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, "ForgotPassword">;

export default function ForgotPasswordScreen() {
    const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert("Error", "Please enter your email address");
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Error", "Please enter a valid email address");
            return;
        }

        setIsLoading(true);

        // Simulate password reset - replace with your actual logic
        setTimeout(() => {
            setIsLoading(false);
            setIsEmailSent(true);
        }, 1500);
    };

    const handleBackToLogin = () => {
        navigation.goBack();
    };

    if (isEmailSent) {
        return (
            <View style={styles.container}>
                <View style={styles.content}>
                    {/* Success Icon */}
                    <View style={styles.successIconContainer}>
                        <Ionicons name="mail-outline" size={60} color="#007AFF" />
                    </View>

                    {/* Success Message */}
                    <Text style={styles.successTitle}>Check Your Email</Text>
                    <Text style={styles.successMessage}>
                        We've sent a password reset link to{"\n"}
                        <Text style={styles.emailHighlight}>{email}</Text>
                    </Text>

                    <Text style={styles.instructionText}>
                        Click the link in the email to reset your password. If you don't see it, check your spam folder.
                    </Text>

                    {/* Resend Button */}
                    <TouchableOpacity
                        style={styles.resendButton}
                        onPress={() => {
                            setIsEmailSent(false);
                            handleResetPassword();
                        }}
                    >
                        <Text style={styles.resendButtonText}>Resend Email</Text>
                    </TouchableOpacity>

                    {/* Back to Login */}
                    <TouchableOpacity style={styles.backToLoginButton} onPress={handleBackToLogin}>
                        <Ionicons name="arrow-back" size={20} color="#007AFF" />
                        <Text style={styles.backToLoginText}>Back to Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={styles.content}>
                {/* Back Button */}
                <TouchableOpacity style={styles.backButton} onPress={handleBackToLogin}>
                    <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
                </TouchableOpacity>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="lock-closed-outline" size={50} color="#007AFF" />
                    </View>
                    <Text style={styles.title}>Forgot Password?</Text>
                    <Text style={styles.subtitle}>
                        No worries! Enter your email address and we'll send you a link to reset your password.
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoFocus
                        />
                    </View>

                    {/* Reset Button */}
                    <TouchableOpacity
                        style={[styles.resetButton, isLoading && styles.resetButtonDisabled]}
                        onPress={handleResetPassword}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.resetButtonText}>Send Reset Link</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Remember your password? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                        <Text style={styles.loginLink}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        justifyContent: "center",
    },
    backButton: {
        position: "absolute",
        top: 60,
        left: 24,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#f5f5f5",
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        alignItems: "center",
        marginBottom: 40,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#007AFF15",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#1a1a1a",
        marginBottom: 12,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    form: {
        marginBottom: 24,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 24,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: "#1a1a1a",
    },
    resetButton: {
        backgroundColor: "#007AFF",
        borderRadius: 12,
        height: 56,
        justifyContent: "center",
        alignItems: "center",
    },
    resetButtonDisabled: {
        opacity: 0.7,
    },
    resetButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    footerText: {
        color: "#666",
        fontSize: 14,
    },
    loginLink: {
        color: "#007AFF",
        fontSize: 14,
        fontWeight: "600",
    },
    // Success screen styles
    successIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#007AFF15",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        marginBottom: 32,
    },
    successTitle: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#1a1a1a",
        textAlign: "center",
        marginBottom: 16,
    },
    successMessage: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 12,
    },
    emailHighlight: {
        color: "#007AFF",
        fontWeight: "600",
    },
    instructionText: {
        fontSize: 14,
        color: "#999",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    resendButton: {
        backgroundColor: "#f5f5f5",
        borderRadius: 12,
        height: 56,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    resendButtonText: {
        color: "#007AFF",
        fontSize: 16,
        fontWeight: "600",
    },
    backToLoginButton: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        paddingVertical: 16,
    },
    backToLoginText: {
        color: "#007AFF",
        fontSize: 16,
        fontWeight: "500",
    },
});
