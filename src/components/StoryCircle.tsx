import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const StoryCircle = ({
    profileImage,
    stories = [],        // Array of { id, seen: boolean }
    size = 80,
    strokeWidth = 3,
    seenColor = '#gray',
    unseenColor = '#0095f6',  // Instagram blue
    gapSize = 4,         // Gap between segments
    onPress,
}) => {
    const totalStories = stories.length;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const center = size / 2;

    // Calculate segment length and gap
    const gapLength = totalStories > 1 ? gapSize : 0;
    const totalGaps = totalStories * gapLength;
    const segmentLength = (circumference - totalGaps) / totalStories;

    const renderSegments = () => {
        if (totalStories === 0) return null;

        return stories.map((story, index) => {
            // Calculate where each segment starts
            const segmentStart = index * (segmentLength + gapLength);

            return (
                <Circle
                    key={story.id || index}
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={story.seen ? seenColor : unseenColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                    strokeDashoffset={-segmentStart}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${center}, ${center}`}
                />
            );
        });
    };

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <View style={[styles.container, { width: size, height: size }]}>
                {/* SVG Circle Segments */}
                <Svg width={size} height={size} style={styles.svg}>
                    {renderSegments()}
                </Svg>

                {/* Profile Image */}
                <View style={[
                    styles.imageContainer,
                    {
                        width: size - strokeWidth * 4,
                        height: size - strokeWidth * 4,
                        borderRadius: (size - strokeWidth * 4) / 2,
                    }
                ]}>
                    <Image
                        source={{ uri: profileImage }}
                        style={styles.image}
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    svg: {
        position: 'absolute',
    },
    imageContainer: {
        overflow: 'hidden',
        backgroundColor: '#fff',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 999,
    },
});

export default StoryCircle;