import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface QrCodeScannerProps {
    onScanned?: (data: string) => void;
}

export default function QrCodeScanner({ onScanned }: QrCodeScannerProps) {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [torchOn, setTorchOn] = useState(false);

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        );
    }

    const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
        setScanned(true);
        if (onScanned) {
            onScanned(data);
        }
    };

    const toggleTorch = () => {
        setTorchOn(!torchOn);
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                facing="back"
                enableTorch={torchOn}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
            >
                {/* Overlay */}
                <View style={styles.overlay}>
                    {/* Title */}
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Scan QR Code</Text>
                    </View>

                    {/* Scanning Area */}
                    <View style={styles.scanningArea}>
                        {/* Top Left Corner */}
                        <View style={[styles.corner, styles.topLeft]} />

                        {/* Top Right Corner */}
                        <View style={[styles.corner, styles.topRight]} />

                        {/* Bottom Left Corner */}
                        <View style={[styles.corner, styles.bottomLeft]} />

                        {/* Bottom Right Corner */}
                        <View style={[styles.corner, styles.bottomRight]} />
                    </View>

                    {/* Bottom Controls */}
                    <View style={styles.bottomControls}>
                        <TouchableOpacity
                            style={styles.torchButton}
                            onPress={toggleTorch}
                        >
                            <Ionicons
                                name={torchOn ? "flashlight" : "flashlight-outline"}
                                size={32}
                                color="#fff"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Rescan Button */}
                {scanned && (
                    <View style={styles.rescanContainer}>
                        <TouchableOpacity
                            style={styles.rescanButton}
                            onPress={() => setScanned(false)}
                        >
                            <Text style={styles.rescanText}>Tap to Scan Again</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
        padding: 20,
    },
    message: {
        textAlign: 'center',
        paddingBottom: 20,
        color: '#fff',
        fontSize: 16,
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    titleContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 80,
    },
    title: {
        fontSize: 24,
        fontWeight: '500',
        color: '#fff',
        textAlign: 'center',
    },
    scanningArea: {
        width: 280,
        height: 280,
        alignSelf: 'center',
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 50,
        height: 50,
        borderColor: '#fff',
        borderWidth: 4,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderTopLeftRadius: 8,
    },
    topRight: {
        top: 0,
        right: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
        borderTopRightRadius: 8,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderRightWidth: 0,
        borderTopWidth: 0,
        borderBottomLeftRadius: 8,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderBottomRightRadius: 8,
    },
    bottomControls: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 60,
    },
    torchButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    rescanContainer: {
        position: 'absolute',
        bottom: 150,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    rescanButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
    },
    rescanText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
    },
});
