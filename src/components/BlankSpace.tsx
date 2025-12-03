import React from 'react';
import { ColorValue, StyleProp, View, ViewStyle } from 'react-native';

type BlankSpaceProp = {
    width?: number;
    height?: number;
    backgroundColor?: ColorValue;
    style?: StyleProp<ViewStyle>; // this style prop overwrite above width , height and backgroundcolor
};

export const BlankSpace: React.FC<BlankSpaceProp> = ({ style, height, width, backgroundColor }) => {
    return <View style={[{ height, width, backgroundColor }, style]} />;
};