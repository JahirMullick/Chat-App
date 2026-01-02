import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface GoogleSignInButtonProps {
    onPress: () => void;
    disabled?: boolean;
}

const GoogleSignInButtonComponent = ({ onPress, disabled = false }: GoogleSignInButtonProps) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.button, disabled && styles.buttonDisabled]}
                onPress={onPress}
                disabled={disabled}
                activeOpacity={0.8}
            >
                {disabled ? (
                    <ActivityIndicator color="#4285F4" size="small" />
                ) : (
                    <>
                        <Image
                            source={require('../../assets/images/GoogleIcon.png')}
                            style={styles.icon}
                            resizeMode="contain"
                        />
                        <Text style={styles.buttonText}>Sign in with Google</Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
    )
}

export default GoogleSignInButtonComponent

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: 8,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        width: 312,
        height: 48,
        borderRadius: 4,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#DADCE0',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    icon: {
        width: 20,
        height: 20,
        marginRight: 12,
    },
    buttonText: {
        color: '#3C4043',
        fontSize: 16,
        fontWeight: '600',
    },
})