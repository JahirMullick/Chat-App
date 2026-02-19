import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getAuth } from "@react-native-firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    ToastAndroid,
    TouchableOpacity,
    View
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Header from "../components/Header";
import Colors from "../constants/colors";
import { AuthStackParamList } from "../Navigation/types";
import { UserService } from "../services/firestore";

type Gender = "male" | "female" | "";

export default function CompleteProfileScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
    const currentUser = getAuth().currentUser;

    const [phoneNumber, setPhoneNumber] = useState("");
    const [gender, setGender] = useState<Gender>("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [bio, setBio] = useState("");
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [customAvatar, setCustomAvatar] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Handle image picker
    const handleSelectImage = () => {
        launchImageLibrary(
            {
                mediaType: "photo",
                quality: 0.8,
                maxWidth: 800,
                maxHeight: 800,
            },
            (response) => {
                if (response.didCancel) {
                    return;
                }
                if (response.errorCode) {
                    Alert.alert("Error", "Failed to select image");
                    return;
                }
                if (response.assets && response.assets[0].uri) {
                    setProfileImage(response.assets[0].uri);
                }
            }
        );
    };

    // Handle date picker change
    const onDateChange = (event: any, date?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (date) {
            setSelectedDate(date);
            // Format date as DD/MM/YYYY
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            setDateOfBirth(`${day}/${month}/${year}`);
        }
    };

    // Validate date format (DD/MM/YYYY)
    const validateDate = (date: string): boolean => {
        const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
        return dateRegex.test(date);
    };

    // // Handle skip
    // const handleSkip = async () => {
    //     if (!currentUser) return;

    //     try {
    //         // Just mark profile as completed without additional info
    //         await UserService.updateProfile(currentUser.uid, {
    //             profileCompleted: true,
    //         });
    //         // AppNavigator will automatically navigate to Main stack
    //     } catch (error) {
    //         console.error("Error skipping profile:", error);
    //     }
    // };

    // Fetch the actual image URL from redirect URL
    const fetchAvatarUrl = async (redirectUrl: string): Promise<string> => {
        try {
            const response = await fetch(redirectUrl);
            // The response.url will contain the final redirected URL
            return response.url;
        } catch (error) {
            console.error("Error fetching avatar URL:", error);
            return redirectUrl; // Fallback to redirect URL if fetch fails
        }
    };

    // Handle profile completion
    const handleCompleteProfile = async () => {
        console.log("============== handleCompleteProfile started ===================");

        // Validation
        const cleanPhoneNumber = phoneNumber.replace(/[\s-]/g, '');

        if (!cleanPhoneNumber) {
            Alert.alert("Invalid", "Please enter your phone number");
            return;
        }

        if (!/^\d{10}$/.test(cleanPhoneNumber)) {
            Alert.alert("Invalid", "Phone number must be exactly 10 digits");
            return;
        }

        if (dateOfBirth && !validateDate(dateOfBirth)) {
            Alert.alert("Invalid Date", "Please enter date in DD/MM/YYYY format");
            return;
        }

        if (!currentUser) {
            Alert.alert("Error", "No user logged in");
            return;
        }

        setIsLoading(true);

        try {
            // Check if phone number is unique
            const isPhoneNumberTaken = await UserService.checkPhoneNumberExists(cleanPhoneNumber, currentUser.uid);
            if (isPhoneNumberTaken) {
                Alert.alert("Error", "This phone number is already registered by another user.");
                setIsLoading(false);
                return;
            }
            let photoURL = null;

            // Determine photoURL based on custom avatar toggle and image selection
            if (customAvatar) {
                if (profileImage) {
                    // User selected a custom image
                    // TODO: Upload to Firebase Storage and get URL
                    photoURL = profileImage; // For now, use local URI (should be uploaded)
                    console.log("Using selected profile image:", photoURL);
                } else {
                    // Custom avatar enabled but no image selected - use random avatar based on gender
                    if (gender === "male") {
                        const redirectUrl = "https://xsgames.co/randomusers/avatar.php?g=male";
                        console.log("Fetching male avatar from:", redirectUrl);
                        photoURL = await fetchAvatarUrl(redirectUrl);
                        console.log("Male avatar URL:", photoURL);
                    } else if (gender === "female") {
                        const redirectUrl = "https://xsgames.co/randomusers/avatar.php?g=female";
                        console.log("Fetching female avatar from:", redirectUrl);
                        photoURL = await fetchAvatarUrl(redirectUrl);
                        console.log("Female avatar URL:", photoURL);
                    }
                }
            }
            // If customAvatar is false and no image selected, photoURL remains null (shows initials)

            console.log("Final photoURL:", photoURL);

            // Update user profile in Firestore
            console.log("Updating profile with data:", {
                phoneNumber: cleanPhoneNumber,
                bio: bio.trim() || undefined,
                gender: gender || undefined,
                dateOfBirth: dateOfBirth.trim() || undefined,
                profileCompleted: true,
                photoURL
            });

            await UserService.updateProfile(currentUser.uid, {
                phoneNumber: cleanPhoneNumber,
                bio: bio.trim() || undefined,
                gender: gender || undefined,
                dateOfBirth: dateOfBirth.trim() || undefined,
                profileCompleted: true,
                photoURL: photoURL, // Include photoURL (can be null for initials)
            });

            setIsLoading(false);

            console.log("Profile updated successfully!");

            // Force reload user state to trigger navigation to Main stack
            await getAuth().currentUser?.reload();

            console.log("Auth reloaded");

            // Show success message - AppNavigator will automatically navigate to Main stack
            if (Platform.OS === 'android') {
                ToastAndroid.show(
                    'Profile completed successfully!',
                    ToastAndroid.SHORT
                );
            }

            console.log("=== handleCompleteProfile completed ===");
        } catch (error) {
            console.error("Error completing profile:", error);
            Alert.alert("Error", "Failed to complete profile. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

            <Header
                title="Complete Profile"
                showBackButton={true}
                showDrawerIcon={false}
                showSearch={false}
                onBackPress={() => navigation.goBack()}
            />

            <KeyboardAwareScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Info Text */}
                <Text style={styles.infoText}>
                    Please provide your information to complete your profile
                </Text>

                {/* Profile Image Section */}
                <View style={styles.imageSection}>
                    <TouchableOpacity
                        style={styles.imageContainer}
                        onPress={handleSelectImage}
                        activeOpacity={0.8}
                    >
                        {profileImage ? (
                            <Image
                                source={{ uri: profileImage }}
                                style={styles.profileImage}
                            />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Ionicons name="camera" size={40} color={Colors.textSecondary} />
                            </View>
                        )}
                        <View style={styles.cameraIconBadge}>
                            <Ionicons name="camera" size={18} color={Colors.white} />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.imageHint}>Tap to select profile photo</Text>
                </View>

                {/* Form Fields */}
                <View style={styles.form}>
                    {/* Custom Avatar Toggle */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Do you want custom Avatar?</Text>
                        <TouchableOpacity
                            style={styles.toggleContainer}
                            onPress={() => setCustomAvatar(!customAvatar)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.toggleInfo}>
                                <Ionicons
                                    name="image-outline"
                                    size={20}
                                    color={Colors.primary}
                                    style={styles.inputIcon}
                                />
                                <Text style={styles.toggleLabel}>
                                    {customAvatar ? "Custom avatar enabled" : "Use default avatar"}
                                </Text>
                            </View>
                            <View style={[styles.toggleSwitch, customAvatar && styles.toggleSwitchActive]}>
                                <View style={[styles.toggleThumb, customAvatar && styles.toggleThumbActive]} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Phone Number */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons
                                name="call-outline"
                                size={20}
                                color={Colors.textSecondary}
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="1234567890"
                                placeholderTextColor={Colors.textSecondary}
                                value={phoneNumber}
                                onChangeText={(text) => setPhoneNumber(text.replace(/[^0-9]/g, ''))}
                                keyboardType="number-pad"
                                maxLength={10}
                            />
                        </View>
                    </View>

                    {/* Gender */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Gender</Text>
                        <View style={styles.genderContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.genderButton,
                                    gender === "male" && styles.genderButtonActive,
                                ]}
                                onPress={() => setGender("male")}
                            >
                                <Ionicons
                                    name="male"
                                    size={20}
                                    color={gender === "male" ? Colors.white : Colors.primary}
                                />
                                <Text
                                    style={[
                                        styles.genderText,
                                        gender === "male" && styles.genderTextActive,
                                    ]}
                                >
                                    Male
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.genderButton,
                                    gender === "female" && styles.genderButtonActive,
                                ]}
                                onPress={() => setGender("female")}
                            >
                                <Ionicons
                                    name="female"
                                    size={20}
                                    color={gender === "female" ? Colors.white : Colors.primary}
                                />
                                <Text
                                    style={[
                                        styles.genderText,
                                        gender === "female" && styles.genderTextActive,
                                    ]}
                                >
                                    Female
                                </Text>
                            </TouchableOpacity>

                        </View>
                    </View>

                    {/* Date of Birth */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Date of Birth</Text>
                        <TouchableOpacity
                            style={styles.inputContainer}
                            onPress={() => setShowDatePicker(true)}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name="calendar-outline"
                                size={20}
                                color={Colors.textSecondary}
                                style={styles.inputIcon}
                            />
                            <Text style={[styles.input, !dateOfBirth && styles.placeholderText]}>
                                {dateOfBirth || "DD/MM/YYYY"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Date Picker Modal */}
                    {showDatePicker && (
                        <DateTimePicker
                            value={selectedDate}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onDateChange}
                            maximumDate={new Date()}
                        />
                    )}

                    {/* Bio */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Bio</Text>
                        <View style={[styles.inputContainer, styles.textAreaContainer]}>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Write something about yourself..."
                                placeholderTextColor={Colors.textSecondary}
                                value={bio}
                                onChangeText={setBio}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>
                </View>

                {/* Complete Button */}
                <TouchableOpacity
                    style={[styles.completeButton, isLoading && styles.buttonDisabled]}
                    onPress={handleCompleteProfile}
                    disabled={isLoading}
                    activeOpacity={0.8}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                        <Text style={styles.completeButtonText}>Complete Profile</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.bottomSpacer} />
            </KeyboardAwareScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    flex: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    imageSection: {
        alignItems: "center",
        paddingVertical: 24,
        marginBottom: 8,
    },
    imageContainer: {
        position: "relative",
        marginBottom: 12,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: Colors.primary,
    },
    imagePlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.gray50,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: Colors.borderLight,
        borderStyle: "dashed",
    },
    cameraIconBadge: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.primary,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: Colors.white,
    },
    imageHint: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    infoText: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: "center",
        marginBottom: 24,
        lineHeight: 20,
    },
    form: {
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.textPrimary,
        marginBottom: 8,
    },
    required: {
        color: Colors.error,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.gray50,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        paddingHorizontal: 12,
        minHeight: 50,
    },
    textAreaContainer: {
        alignItems: "flex-start",
        paddingVertical: 12,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: Colors.textPrimary,
        paddingVertical: 0,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: "top",
    },
    placeholderText: {
        color: Colors.textSecondary,
    },
    genderContainer: {
        flexDirection: "row",
        gap: 10,
    },
    genderButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: Colors.primary,
        backgroundColor: Colors.white,
    },
    genderButtonActive: {
        backgroundColor: Colors.primary,
    },
    genderText: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.primary,
    },
    genderTextActive: {
        color: Colors.white,
    },
    completeButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 12,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    completeButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.white,
    },
    toggleContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: Colors.gray50,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        paddingHorizontal: 12,
        paddingVertical: 14,
    },
    toggleInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    toggleLabel: {
        fontSize: 15,
        color: Colors.textPrimary,
        fontWeight: "500",
    },
    toggleSwitch: {
        width: 50,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.borderLight,
        padding: 2,
        justifyContent: "center",
    },
    toggleSwitchActive: {
        backgroundColor: Colors.primary,
    },
    toggleThumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.white,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    toggleThumbActive: {
        transform: [{ translateX: 22 }],
    },
    bottomSpacer: {
        height: 40,
    },
});
