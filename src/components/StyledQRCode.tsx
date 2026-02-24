import React from 'react';
import type { ColorValue } from 'react-native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCodeStyled from 'react-native-qrcode-styled';
import Colors from '../constants/colors';

// ─── Types ──────────────────────────────────────────────────────────
type GradientConfig = {
    type: 'linear' | 'radial';
    options: {
        colors: ColorValue[];
        start?: [number, number];
        end?: [number, number];
        center?: [number, number];
        radius?: [number, number];
        locations?: number[];
    };
};

type EyeConfig = {
    borderRadius?: number | number[];
    color?: ColorValue;
    gradient?: GradientConfig;
    scale?: number | [number, number];
    rotation?: string | number;
    stroke?: ColorValue;
    strokeWidth?: number;
};

type EyesOptions = EyeConfig | {
    topLeft?: EyeConfig;
    topRight?: EyeConfig;
    bottomLeft?: EyeConfig;
};

export type QRThemeConfig = {
    label: string;                             // Emoji icon for the selector
    color: ColorValue;                         // Solid color of QR pieces
    pieceBorderRadius: number | number[];      // Corner radius of each piece
    isPiecesGlued: boolean;                    // Whether adjacent pieces merge
    innerEyesOptions?: EyesOptions;            // Inner eye (center dot) styling
    outerEyesOptions?: EyesOptions;            // Outer eye (frame) styling
    AllEyesOptions?: EyesOptions;              // All eyes styling
    gradient?: GradientConfig;                 // Optional gradient overlay
    pieceCornerType?: 'rounded' | 'cut';       // Corner shape type
    pieceLiquidRadius?: number;                // Liquid effect level
    pieceStroke?: ColorValue;                  // Border color of each piece
    pieceStrokeWidth?: number;                 // Border width of each piece
};

// ─── Default themes ─────────────────────────────────────────────────
export const DEFAULT_QR_THEMES: QRThemeConfig[] = [
    {
        label: '🏠',
        color: Colors.primary,
        pieceBorderRadius: 4,
        isPiecesGlued: false,
        innerEyesOptions: { borderRadius: 4, color: Colors.primary },
        outerEyesOptions: { borderRadius: 12, color: Colors.primary },
    },
    {
        label: '🐥',
        color: '#00a2ffff',
        pieceBorderRadius: 6,
        isPiecesGlued: true,
        innerEyesOptions: { borderRadius: 6, color: '#d400ffff' },
        outerEyesOptions: { borderRadius: 20, color: '#a200ffff' },
    },
    {
        label: '⛄',
        color: '#4A90E2',
        pieceBorderRadius: 2,
        isPiecesGlued: true,
        innerEyesOptions: { borderRadius: 8, color: '#9013FE' },
        outerEyesOptions: { borderRadius: 16, color: '#4A90E2' },
    },
    {
        label: '💎',
        color: '#00C4B5',
        pieceBorderRadius: 0,
        isPiecesGlued: false,
        innerEyesOptions: { borderRadius: 0, color: '#00C4B5' },
        outerEyesOptions: { borderRadius: 0, color: '#00C4B5' },
    },
    {
        label: '🤓',
        color: '#00E676',
        pieceBorderRadius: [4, 0, 4, 0],
        isPiecesGlued: false,
        innerEyesOptions: { borderRadius: 2, color: '#1DE9B6' },
        outerEyesOptions: { borderRadius: 6, color: '#00E676' },
    },
    {
        label: '🔵',
        color: '#5482A6',
        pieceBorderRadius: 8,
        isPiecesGlued: false,
        innerEyesOptions: { borderRadius: 8, color: '#5482A6' },
        outerEyesOptions: { borderRadius: 12, color: '#5482A6' },
    },
    {
        label: '🌈',
        color: '#000000',
        pieceBorderRadius: [8, 0, 8, 0],
        isPiecesGlued: true,
        innerEyesOptions: { borderRadius: 8 },
        outerEyesOptions: { borderRadius: 16 },
        gradient: {
            type: 'linear',
            options: {
                colors: ['#FF0055', '#FFAA00', '#00E676', '#4A90E2', '#9013FE'],
                start: [0, 0],
                end: [1, 1],
            },
        },
    },
    {   // 👁️ Custom Eyes — blue-to-teal gradient, bold square eyes
        label: '👁️',
        color: '#3B7DD8',
        pieceBorderRadius: 4,
        isPiecesGlued: true,
        innerEyesOptions: {
            borderRadius: 4,
            color: '#2C3E80',
            stroke: '#2C3E80',
            strokeWidth: 1,
        },
        outerEyesOptions: {
            borderRadius: 6,
            color: '#2C3E80',
            stroke: '#2C3E80',
            strokeWidth: 1,
        },
        gradient: {
            type: 'linear',
            options: {
                colors: ['#2C3E80', '#3B7DD8', '#00BCD4'],
                start: [0, 0],
                end: [1, 1],
            },
        },
    },
    // {   // 💜 Purple Dots — magenta/purple gradient, circular dot pieces
    //     label: '💜',
    //     color: '#9C27B0',
    //     pieceBorderRadius: 5,
    //     // pieceBorderRadius: 10,
    //     isPiecesGlued: true,
    //     innerEyesOptions: {
    //         borderRadius: 1,
    //         color: '#7B1FA2',
    //         stroke: '#CE93D8',
    //         strokeWidth: 5,
    //     },
    //     outerEyesOptions: {
    //         borderRadius: [15, 15, 15, 0],
    //         color: '#7B1FA2',
    //         stroke: '#CE93D8',
    //         strokeWidth: 1,
    //     },
    //     gradient: {
    //         type: 'linear',
    //         options: {
    //             colors: ['#9C27B0', '#E040FB', '#7C4DFF'],
    //             start: [0, 0],
    //             end: [1, 1],
    //         },
    //     },
    // },
];

// ─── Component Props ────────────────────────────────────────────────
interface StyledQRCodeProps {
    /** The data string to encode into the QR code */
    data: string;
    /** Size of the QR code SVG (default 220) */
    size?: number;
    /** Padding inside the QR SVG (default 10) */
    padding?: number;
    /** The currently selected theme index */
    selectedThemeIndex: number;
    /** Callback when the user taps a theme icon */
    onThemeChange: (index: number) => void;
    /** Optional custom themes array (defaults to DEFAULT_QR_THEMES) */
    themes?: QRThemeConfig[];
    /** Whether to show the theme selector strip (default true) */
    showThemeSelector?: boolean;
}

// ─── Component ──────────────────────────────────────────────────────
export default function StyledQRCode({
    data,
    size = 220,
    padding = 10,
    selectedThemeIndex,
    onThemeChange,
    themes = DEFAULT_QR_THEMES,
    showThemeSelector = true,
}: StyledQRCodeProps) {
    const config = themes[selectedThemeIndex] ?? themes[0];

    return (
        <View>
            {/* QR Code (only render when size > 0) */}
            {size > 0 && (
                <View style={styles.qrCodeContainer}>
                    <QRCodeStyled
                        data={data}
                        style={{ backgroundColor: 'white' }}
                        padding={padding}
                        size={size}
                        pieceBorderRadius={config.pieceBorderRadius}
                        isPiecesGlued={config.isPiecesGlued}
                        color={config.color}
                        innerEyesOptions={config.innerEyesOptions as any}
                        outerEyesOptions={config.outerEyesOptions as any}
                        gradient={config.gradient as any}
                        pieceCornerType={config.pieceCornerType}
                        pieceLiquidRadius={config.pieceLiquidRadius}
                        pieceStroke={config.pieceStroke}
                        pieceStrokeWidth={config.pieceStrokeWidth}
                    />
                </View>
            )}

            {/* Theme Selector */}
            {showThemeSelector && (
                <View style={styles.themesSection}>
                    <Text style={styles.themesTitle}>QR Code Styles</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.themesContent}
                    >
                        {themes.map((theme, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.qrStyleCard,
                                    selectedThemeIndex === index && styles.activeQrStyleCard,
                                ]}
                                activeOpacity={0.7}
                                onPress={() => onThemeChange(index)}
                            >
                                <Text style={styles.qrIcon}>{theme.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

// ─── Standalone Theme Selector ──────────────────────────────────────
interface QRThemeSelectorProps {
    selectedThemeIndex: number;
    onThemeChange: (index: number) => void;
    themes?: QRThemeConfig[];
}

export function QRThemeSelector({
    selectedThemeIndex,
    onThemeChange,
    themes = DEFAULT_QR_THEMES,
}: QRThemeSelectorProps) {
    return (
        <View style={styles.themesSection}>
            <Text style={styles.themesTitle}>QR Code Styles</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.themesContent}
            >
                {themes.map((theme, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.qrStyleCard,
                            selectedThemeIndex === index && styles.activeQrStyleCard,
                        ]}
                        activeOpacity={0.7}
                        onPress={() => onThemeChange(index)}
                    >
                        <Text style={styles.qrIcon}>{theme.label}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

// ─── Styles ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    qrCodeContainer: {
        backgroundColor: Colors.white,
        padding: 20,
        borderRadius: 16,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        alignSelf: 'center',
    },
    themesSection: {
        paddingHorizontal: 16,
        marginTop: 24,
        marginBottom: 24,
    },
    themesTitle: {
        fontSize: 16,
        fontWeight: '600',
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
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 2,
        borderColor: Colors.borderLight,
    },
    activeQrStyleCard: {
        borderColor: Colors.primary,
        borderWidth: 3,
        backgroundColor: Colors.white,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    qrIcon: {
        fontSize: 32,
    },
});
