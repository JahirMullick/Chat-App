// components/LockScreen.tsx

import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View,
} from 'react-native';
import {
    BiometricType,
    LockScreenProps,
    PinPadButton,
    PinPadRow,
} from '../types/auth.types';

const MAX_ATTEMPTS: number = 5;
const LOCKOUT_DURATION: number = 30000; // 30 seconds
const PIN_LENGTH: number = 4;

const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
    // State
    const [pin, setPin] = useState<string>('');
    const [savedPin, setSavedPin] = useState<string | null>(null);
    const [isSettingPin, setIsSettingPin] = useState<boolean>(false);
    const [confirmPin, setConfirmPin] = useState<string>('');
    const [isConfirming, setIsConfirming] = useState<boolean>(false);
    const [biometricsAvailable, setBiometricsAvailable] = useState<boolean>(false);
    const [biometricType, setBiometricType] = useState<BiometricType>(null);
    const [attempts, setAttempts] = useState<number>(0);
    const [isLockedOut, setIsLockedOut] = useState<boolean>(false);
    const [lockoutTimer, setLockoutTimer] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Initialize on mount
    useEffect(() => {
        const initialize = async (): Promise<void> => {
            await checkBiometrics();
            await loadSavedPin();
            await checkLockout();
            setIsLoading(false);
        };

        initialize();
    }, []);

    // Auto trigger biometric
    useEffect(() => {
        if (
            biometricsAvailable &&
            savedPin &&
            !isSettingPin &&
            !isLockedOut &&
            !isLoading
        ) {
            handleBiometricAuth();
        }
    }, [biometricsAvailable, savedPin, isLoading]);

    // Lockout timer
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isLockedOut && lockoutTimer > 0) {
            interval = setInterval(() => {
                setLockoutTimer((prev) => {
                    if (prev <= 1) {
                        setIsLockedOut(false);
                        setAttempts(0);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isLockedOut, lockoutTimer]);

    // Check biometric availability
    const checkBiometrics = async (): Promise<void> => {
        try {
            const hasHardware: boolean = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled: boolean = await LocalAuthentication.isEnrolledAsync();
            const available: boolean = hasHardware && isEnrolled;

            setBiometricsAvailable(available);

            if (available) {
                const types: LocalAuthentication.AuthenticationType[] =
                    await LocalAuthentication.supportedAuthenticationTypesAsync();

                if (
                    types.includes(
                        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
                    )
                ) {
                    setBiometricType('face');
                } else if (
                    types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
                ) {
                    setBiometricType('fingerprint');
                }
            }
        } catch (error) {
            console.error('Error checking biometrics:', error);
        }
    };

    // Load saved PIN
    const loadSavedPin = async (): Promise<void> => {
        try {
            const storedPin: string | null = await SecureStore.getItemAsync('app_pin');
            if (storedPin) {
                setSavedPin(storedPin);
            } else {
                setIsSettingPin(true);
            }
        } catch (error) {
            console.error('Error loading PIN:', error);
            setIsSettingPin(true);
        }
    };

    // Check lockout status
    const checkLockout = async (): Promise<void> => {
        try {
            const lockoutTime: string | null = await SecureStore.getItemAsync(
                'lockout_time'
            );

            if (lockoutTime) {
                const endTime: number = parseInt(lockoutTime, 10);
                const now: number = Date.now();

                if (now < endTime) {
                    setIsLockedOut(true);
                    setLockoutTimer(Math.ceil((endTime - now) / 1000));
                } else {
                    await SecureStore.deleteItemAsync('lockout_time');
                }
            }
        } catch (error) {
            console.error('Error checking lockout:', error);
        }
    };

    // Handle lockout
    const handleLockout = async (): Promise<void> => {
        const endTime: number = Date.now() + LOCKOUT_DURATION;
        await SecureStore.setItemAsync('lockout_time', endTime.toString());
        setIsLockedOut(true);
        setLockoutTimer(LOCKOUT_DURATION / 1000);
    };

    // Biometric authentication
    const handleBiometricAuth = useCallback(async (): Promise<void> => {
        if (isLockedOut) return;

        try {
            const result: LocalAuthentication.LocalAuthenticationResult =
                await LocalAuthentication.authenticateAsync({
                    promptMessage: 'Authenticate to unlock',
                    fallbackLabel: 'Use PIN',
                    cancelLabel: 'Cancel',
                    disableDeviceCredentials: true,
                });

            if (result.success) {
                onUnlock();
            }
        } catch (error) {
            console.error('Biometric auth error:', error);
        }
    }, [isLockedOut, onUnlock]);

    // Handle number press
    const handleNumberPress = (num: string): void => {
        if (pin.length < PIN_LENGTH && !isLockedOut) {
            const newPin: string = pin + num;
            setPin(newPin);

            if (newPin.length === PIN_LENGTH) {
                setTimeout(() => {
                    if (isSettingPin) {
                        handleSetPin(newPin);
                    } else {
                        verifyPin(newPin);
                    }
                }, 100);
            }
        }
    };

    // Set new PIN
    const handleSetPin = async (newPin: string): Promise<void> => {
        if (!isConfirming) {
            // First entry
            setConfirmPin(newPin);
            setIsConfirming(true);
            setPin('');
        } else {
            // Confirming
            if (newPin === confirmPin) {
                try {
                    await SecureStore.setItemAsync('app_pin', newPin);
                    setSavedPin(newPin);
                    setIsSettingPin(false);
                    setIsConfirming(false);
                    setConfirmPin('');
                    setPin('');
                    Alert.alert('Success', 'PIN has been set successfully!');
                } catch (error) {
                    console.error('Error saving PIN:', error);
                    Alert.alert('Error', 'Failed to save PIN. Please try again.');
                    resetPinEntry();
                }
            } else {
                Vibration.vibrate(500);
                Alert.alert('Error', 'PINs do not match. Please try again.');
                resetPinEntry();
            }
        }
    };

    // Reset PIN entry
    const resetPinEntry = (): void => {
        setIsConfirming(false);
        setConfirmPin('');
        setPin('');
    };

    // Verify entered PIN
    const verifyPin = async (enteredPin: string): Promise<void> => {
        if (enteredPin === savedPin) {
            setAttempts(0);
            await SecureStore.deleteItemAsync('lockout_time');
            onUnlock();
        } else {
            Vibration.vibrate(500);
            const newAttempts: number = attempts + 1;
            setAttempts(newAttempts);
            setPin('');

            if (newAttempts >= MAX_ATTEMPTS) {
                await handleLockout();
                Alert.alert(
                    'Too Many Attempts',
                    `You've been locked out for ${LOCKOUT_DURATION / 1000} seconds.`
                );
            } else {
                Alert.alert(
                    'Incorrect PIN',
                    `${MAX_ATTEMPTS - newAttempts} attempts remaining.`
                );
            }
        }
    };

    // Delete last digit
    const handleDelete = (): void => {
        setPin((prev) => prev.slice(0, -1));
    };

    // Get title text
    const getTitle = (): string => {
        if (isLockedOut) return 'Locked Out';
        if (isSettingPin) {
            return isConfirming ? 'Confirm Your PIN' : 'Create a PIN';
        }
        return 'Enter PIN to Unlock';
    };

    // Get subtitle text
    const getSubtitle = (): string => {
        if (isLockedOut) {
            return `Try again in ${lockoutTimer} seconds`;
        }
        if (isSettingPin) {
            return isConfirming
                ? 'Re-enter your PIN to confirm'
                : 'Set a 4-digit PIN for security';
        }
        return 'Enter your PIN or use biometrics';
    };

    // Render PIN dots
    const renderPinDots = (): React.ReactNode => {
        return (
            <View style={styles.dotsContainer}>
                {Array.from({ length: PIN_LENGTH }).map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            index < pin.length && styles.dotFilled,
                            isLockedOut && styles.dotLocked,
                        ]}
                    />
                ))}
            </View>
        );
    };

    // Get biometric icon name
    const getBiometricIcon = (): keyof typeof Ionicons.glyphMap => {
        return biometricType === 'face' ? 'scan' : 'finger-print';
    };

    // Number pad configuration
    const numberPad: PinPadRow[] = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        ['bio', 0, 'del'],
    ];

    // Render number pad button
    const renderButton = (
        button: PinPadButton,
        index: number
    ): React.ReactNode => {
        // Biometric button
        if (button === 'bio') {
            const isDisabled: boolean =
                !biometricsAvailable || isSettingPin || isLockedOut;

            return (
                <TouchableOpacity
                    key={index}
                    style={[styles.button, isDisabled && styles.buttonDisabled]}
                    onPress={handleBiometricAuth}
                    disabled={isDisabled}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name={getBiometricIcon()}
                        size={32}
                        color={!isDisabled ? '#4A90D9' : '#ccc'}
                    />
                </TouchableOpacity>
            );
        }

        // Delete button
        if (button === 'del') {
            const isDisabled: boolean = pin.length === 0 || isLockedOut;

            return (
                <TouchableOpacity
                    key={index}
                    style={[styles.button, isDisabled && styles.buttonDisabled]}
                    onPress={handleDelete}
                    disabled={isDisabled}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name="backspace-outline"
                        size={32}
                        color={!isDisabled ? '#333' : '#ccc'}
                    />
                </TouchableOpacity>
            );
        }

        // Number button
        return (
            <TouchableOpacity
                key={index}
                style={[styles.button, isLockedOut && styles.buttonDisabled]}
                onPress={() => handleNumberPress(button.toString())}
                disabled={isLockedOut}
                activeOpacity={0.7}
            >
                <Text style={[styles.buttonText, isLockedOut && styles.textDisabled]}>
                    {button}
                </Text>
            </TouchableOpacity>
        );
    };

    // Loading state
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4A90D9" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Lock Icon */}
            <View
                style={[styles.iconContainer, isLockedOut && styles.iconContainerLocked]}
            >
                <Ionicons
                    name={isLockedOut ? 'lock-closed' : 'lock-open'}
                    size={60}
                    color={isLockedOut ? '#e74c3c' : '#4A90D9'}
                />
            </View>

            {/* Title */}
            <Text style={[styles.title, isLockedOut && styles.titleLocked]}>
                {getTitle()}
            </Text>
            <Text style={styles.subtitle}>{getSubtitle()}</Text>

            {/* Attempts remaining */}
            {attempts > 0 && !isLockedOut && (
                <Text style={styles.attemptsText}>
                    {MAX_ATTEMPTS - attempts} attempts remaining
                </Text>
            )}

            {/* PIN Dots */}
            {renderPinDots()}

            {/* Number Pad */}
            <View style={styles.numberPad}>
                {numberPad.map((row: PinPadRow, rowIndex: number) => (
                    <View key={rowIndex} style={styles.row}>
                        {row.map((button: PinPadButton, buttonIndex: number) =>
                            renderButton(button, buttonIndex)
                        )}
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: '#666',
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#e8f4fd',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconContainerLocked: {
        backgroundColor: '#fdeaea',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    titleLocked: {
        color: '#e74c3c',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
        textAlign: 'center',
    },
    attemptsText: {
        fontSize: 12,
        color: '#e74c3c',
        marginBottom: 20,
    },
    dotsContainer: {
        flexDirection: 'row',
        marginBottom: 40,
        marginTop: 20,
    },
    dot: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: '#4A90D9',
        marginHorizontal: 12,
        backgroundColor: 'transparent',
    },
    dotFilled: {
        backgroundColor: '#4A90D9',
    },
    dotLocked: {
        borderColor: '#e74c3c',
    },
    numberPad: {
        width: '100%',
        maxWidth: 300,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 15,
    },
    button: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    buttonDisabled: {
        backgroundColor: '#f5f5f5',
        elevation: 0,
        shadowOpacity: 0,
    },
    buttonText: {
        fontSize: 32,
        fontWeight: '600',
        color: '#333',
    },
    textDisabled: {
        color: '#ccc',
    },
});

export default LockScreen;