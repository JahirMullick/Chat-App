import { StyleSheet, TouchableOpacity, Text, View, ActivityIndicator } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'

interface FacebookSignInButtonProps {
    onPress: () => void;
    disabled?: boolean;
}

const FacebookSignInButtonComponent = ({ onPress, disabled = false }: FacebookSignInButtonProps) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.button, disabled && styles.buttonDisabled]}
                onPress={onPress}
                disabled={disabled}
                activeOpacity={0.8}
            >
                {disabled ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    <>
                        <Ionicons name="logo-facebook" size={20} color="#fff" style={styles.icon} />
                        <Text style={styles.buttonText}>Sign in with Facebook</Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
    )
}

export default FacebookSignInButtonComponent

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: 8,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1877F2',
        width: 312,
        height: 48,
        borderRadius: 4,
        paddingHorizontal: 16,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    icon: {
        marginRight: 12,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
})
