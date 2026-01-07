import LottieView from 'lottie-react-native';
import React from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// 1. Define the props interface
interface NoInternetProps {
    onRefresh: () => void;
}

const { width } = Dimensions.get('window');

export default function NoInternetScreen({ onRefresh }: NoInternetProps) {
    return (
        <View style={styles.container}>

            {/* Animation Section */}
            <View style={styles.animationContainer}>
                <LottieView
                    source={require('../../assets/animation/NoInternet.json')}
                    autoPlay
                    loop
                    style={styles.lottie}
                />
            </View>

            {/* <LottieView
                source={{ uri: '../../assets/animation/NoInternet.json' }}
                autoPlay
                loop
            /> */}

            {/* Text Section */}
            <Text style={styles.title}>No Internet Connection</Text>
            <Text style={styles.message}>
                Please check your internet settings{'\n'}and try again.
            </Text>

            {/* Button Section */}
            <TouchableOpacity
                style={styles.button}
                onPress={onRefresh}
                activeOpacity={0.8}
            >
                <Text style={styles.buttonText}>Refresh</Text>
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, // Covers the whole screen
        backgroundColor: '#fff',
        justifyContent: 'center', // Centers vertically
        alignItems: 'center',     // Centers horizontally
        paddingHorizontal: 24,
    },
    animationContainer: {
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lottie: {
        width: width * 0.7, // 70% of screen width
        height: width * 0.7,
        maxWidth: 300,
        maxHeight: 300,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
    },
    button: {
        backgroundColor: '#023c69', // Your App Theme Color
        paddingVertical: 14,
        paddingHorizontal: 48,
        borderRadius: 30,
        elevation: 4, // Android Shadow
        shadowColor: '#000', // iOS Shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
});