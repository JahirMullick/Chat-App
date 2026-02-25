import { Ionicons } from "@expo/vector-icons";
import { getAuth, GoogleAuthProvider, signInWithCredential } from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import AppleSignInButtonComponent from "../components/AppleSigninButton";
import FacebookSignInButtonComponent from "../components/FacebookSigninButton";
import GoogleSignInButtonComponent from "../components/GoogleSigninButton";
import { AuthStackParamList } from "../Navigation/types";
import { UserService } from "../services/firestore";

type SignupScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, "Signup">;

export default function SignupScreen() {
    const navigation = useNavigation<SignupScreenNavigationProp>();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isAppleLoading, setIsAppleLoading] = useState(false);
    const [isFacebookLoading, setIsFacebookLoading] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);

    const handleSignup = async () => {
        // Validation
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Error", "Please enter a valid email address");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        if (password.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters");
            return;
        }

        if (!agreeToTerms) {
            Alert.alert("Error", "Please agree to Terms and Conditions");
            return;
        }

        setIsLoading(true);

        try {
            // Firebase Create User with Email and Password
            const auth = getAuth();
            const userCredential = await auth.createUserWithEmailAndPassword(
                email.trim(),
                password
            );

            // Update user profile with display name
            await userCredential.user.updateProfile({
                displayName: name.trim(),
            });

            // Sync user to Firestore with the display name
            await UserService.createOrUpdateUser(userCredential.user.uid, {
                email: email.trim(),
                displayName: name.trim(),
                photoURL: null,
            });

            console.log('Account created successfully!');
            setIsLoading(false);
            // Navigate to CompleteProfile screen to collect additional information
            navigation.navigate("CompleteProfile");
        } catch (error: any) {
            setIsLoading(false);

            // Handle different Firebase auth errors
            let errorMessage = "Signup failed. Please try again.";

            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = "This email is already registered. Please login instead.";
                    break;
                case 'auth/invalid-email':
                    errorMessage = "Invalid email address format.";
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = "Email/Password sign up is not enabled.";
                    break;
                case 'auth/weak-password':
                    errorMessage = "Password is too weak. Please use a stronger password.";
                    break;
                case 'auth/network-request-failed':
                    errorMessage = "Network error. Please check your internet connection.";
                    break;
                default:
                    errorMessage = error.message || "Signup failed. Please try again.";
            }

            console.error('Signup Error:', error);
            Alert.alert("Signup Failed", errorMessage);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        try {
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            const signInResult = await GoogleSignin.signIn();
            let idToken = signInResult.data?.idToken;
            if (!idToken) {
                idToken = (signInResult as any).idToken;
            }
            if (!idToken) {
                throw new Error('No ID token found');
            }
            const googleCredential = GoogleAuthProvider.credential(idToken);
            const authInstance = getAuth();
            await signInWithCredential(authInstance, googleCredential);
            console.log('Signed in with Google!');
            console.log('User will be navigated by AppNavigator auth listener');
            setIsGoogleLoading(false);
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
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Sign up to get started</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Name Input */}
                        <View style={styles.inputContainer}>
                            <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Full Name"
                                placeholderTextColor="#999"
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                            />
                        </View>

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

                        {/* Confirm Password Input */}
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm Password"
                                placeholderTextColor="#999"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                <Ionicons
                                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                                    size={20}
                                    color="#666"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Terms and Conditions */}
                        <TouchableOpacity
                            style={styles.termsContainer}
                            onPress={() => setAgreeToTerms(!agreeToTerms)}
                        >
                            <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
                                {agreeToTerms && <Ionicons name="checkmark" size={16} color="#fff" />}
                            </View>
                            <Text style={styles.termsText}>
                                I agree to the <Text style={styles.termsLink}>Terms and Conditions</Text>
                            </Text>
                        </TouchableOpacity>

                        {/* Signup Button */}
                        <TouchableOpacity
                            style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
                            onPress={handleSignup}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.signupButtonText}>Sign Up</Text>
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
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                            <Text style={styles.loginLink}>Sign In</Text>
                        </TouchableOpacity>
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
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingVertical: 40,
        justifyContent: "center",
    },
    header: {
        marginBottom: 32,
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
    termsContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: "#ddd",
        marginRight: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    checkboxChecked: {
        backgroundColor: "#007AFF",
        borderColor: "#007AFF",
    },
    termsText: {
        flex: 1,
        fontSize: 14,
        color: "#666",
    },
    termsLink: {
        color: "#007AFF",
        fontWeight: "500",
    },
    signupButton: {
        backgroundColor: "#007AFF",
        borderRadius: 12,
        height: 56,
        justifyContent: "center",
        alignItems: "center",
    },
    signupButtonDisabled: {
        opacity: 0.7,
    },
    signupButtonText: {
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
});
