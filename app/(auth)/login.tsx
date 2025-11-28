import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    ScrollView,
} from "react-native";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";
import GoogleSignInButtonComponent from "../../src/components/GoogleSigninButton";
import AppleSignInButtonComponent from "../../src/components/AppleSigninButton";
import FacebookSignInButtonComponent from "../../src/components/FacebookSigninButton";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isAppleLoading, setIsAppleLoading] = useState(false);
    const [isFacebookLoading, setIsFacebookLoading] = useState(false);

    const handleLogin = async () => {
        // Validation
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Error", "Please enter a valid email address");
            return;
        }

        // Password length validation
        if (password.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);

        try {
            // Firebase Email/Password Sign In
            await auth().signInWithEmailAndPassword(email.trim(), password);

            console.log('Signed in with Email/Password!');
            setIsLoading(false);
            router.replace("/(main)/home" as any);
        } catch (error: any) {
            setIsLoading(false);

            // Handle different Firebase auth errors
            let errorMessage = "Login failed. Please try again.";

            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = "Invalid email address format.";
                    break;
                case 'auth/user-disabled':
                    errorMessage = "This account has been disabled.";
                    break;
                case 'auth/user-not-found':
                    errorMessage = "No account found with this email.";
                    break;
                case 'auth/wrong-password':
                    errorMessage = "Incorrect password.";
                    break;
                case 'auth/invalid-credential':
                    errorMessage = "Invalid email or password.";
                    break;
                case 'auth/too-many-requests':
                    errorMessage = "Too many failed attempts. Please try again later.";
                    break;
                case 'auth/network-request-failed':
                    errorMessage = "Network error. Please check your internet connection.";
                    break;
                default:
                    errorMessage = error.message || "Login failed. Please try again.";
            }

            console.error('Email/Password Sign-In Error:', error);
            Alert.alert("Login Failed", errorMessage);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        try {
            // Check if your device supports Google Play
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

            // Get the users ID token
            const signInResult = await GoogleSignin.signIn();

            // Try the new style of google-sign in result, from v13+ of that module
            let idToken = signInResult.data?.idToken;
            if (!idToken) {
                // if you are using older versions of google-signin, try old style result
                idToken = (signInResult as any).idToken;
            }
            if (!idToken) {
                throw new Error('No ID token found');
            }

            // Create a Google credential with the token
            const googleCredential = auth.GoogleAuthProvider.credential(idToken);

            // Sign-in the user with the credential
            await auth().signInWithCredential(googleCredential);

            console.log('Signed in with Google!');
            setIsGoogleLoading(false);
            router.replace("/(main)/home" as any);
        } catch (error: any) {
            setIsGoogleLoading(false);
            console.error('Google Sign-In Error:', error);
            Alert.alert("Error", error.message || "Google Sign-In failed. Please try again.");
        }
    };

    const handleAppleSignIn = async () => {
        setIsAppleLoading(true);
        try {
            // Add your Apple Sign-In logic here
            setTimeout(() => {
                setIsAppleLoading(false);
                router.replace("/(main)/home" as any);
            }, 1500);
        } catch (error) {
            setIsAppleLoading(false);
            Alert.alert("Error", "Apple Sign-In failed. Please try again.");
        }
    };

    const handleFacebookSignIn = async () => {
        setIsFacebookLoading(true);
        try {
            // Add your Facebook Sign-In logic here
            setTimeout(() => {
                setIsFacebookLoading(false);
                router.replace("/(main)/home" as any);
            }, 1500);
        } catch (error) {
            setIsFacebookLoading(false);
            Alert.alert("Error", "Facebook Sign-In failed. Please try again.");
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Sign in to continue</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Email Input */}
                        <View style={styles.inputContainer}>
                            <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor="#999"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor="#999"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons
                                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                                    size={20}
                                    color="#666"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Forgot Password */}
                        <Link href={"/(auth)/forgot-password" as any} asChild>
                            <TouchableOpacity style={styles.forgotPassword}>
                                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                            </TouchableOpacity>
                        </Link>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.loginButtonText}>Sign In</Text>
                            )}
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OR</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Social Sign In Buttons */}
                        <GoogleSignInButtonComponent
                            onPress={handleGoogleSignIn}
                            disabled={isGoogleLoading}
                        />

                        <AppleSignInButtonComponent
                            onPress={handleAppleSignIn}
                            disabled={isAppleLoading}
                        />

                        <FacebookSignInButtonComponent
                            onPress={handleFacebookSignIn}
                            disabled={isFacebookLoading}
                        />
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <Link href={"/(auth)/signup" as any} asChild>
                            <TouchableOpacity>
                                <Text style={styles.signupLink}>Sign Up</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
    },
    content: {
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#1a1a1a",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
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
        marginBottom: 16,
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
    forgotPassword: {
        alignSelf: "flex-end",
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: "#007AFF",
        fontSize: 14,
    },
    loginButton: {
        backgroundColor: "#007AFF",
        borderRadius: 12,
        height: 56,
        justifyContent: "center",
        alignItems: "center",
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
    divider: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#e0e0e0",
    },
    dividerText: {
        marginHorizontal: 16,
        color: "#999",
        fontSize: 14,
    },
    socialContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 16,
    },
    socialButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#f5f5f5",
        justifyContent: "center",
        alignItems: "center",
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
    signupLink: {
        color: "#007AFF",
        fontSize: 14,
        fontWeight: "600",
    },
});
