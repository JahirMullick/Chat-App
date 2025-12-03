
import { Dimensions, PixelRatio, useWindowDimensions } from 'react-native';

export interface ResponsiveData {
  wp: (width: number) => number;
  hp: (height: number) => number;
  isPortrait: boolean;
  screenWidth: number;
  screenHeight: number;
  isTablet: boolean;
}

export const useResponsive = () => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const isTablet = Math.min(screenWidth, screenHeight) >= 600;
  const isPortrait = screenHeight >= screenWidth;

  const wp = (width: number) =>
    PixelRatio.roundToNearestPixel((screenWidth * width) / 100);

  const hp = (height: number) =>
    PixelRatio.roundToNearestPixel((screenHeight * height) / 100);

  return { wp, hp, isPortrait, screenWidth, screenHeight, isTablet };
};

export const getDeviceType = (): 'small' | 'medium' | 'large' => {
  const {width} = Dimensions.get('window');
  if (width < 375) return 'small';
  if (width < 768) return 'medium';
  return 'large';
};


export const getOrientationValue = <T,>(portraitValue: T, landscapeValue: T): T => {
  const {height, width} = Dimensions.get('window');
  return height >= width ? portraitValue : landscapeValue;
};

/**
 * Get value based on device type only (ignores orientation)
 */
export const getDeviceValue = <T,>(phoneValue: T, tabletValue: T): T => {
  const {width, height} = Dimensions.get('window');
  const tablet = Math.min(width, height) >= 600;
  return tablet ? tabletValue : phoneValue;
};

/**
 * Get responsive value with full control (device + orientation)
 */
export const getResponsiveValue = <T,>(
  phonePortrait: T,
  phoneLandscape: T,
  tabletPortrait: T,
  tabletLandscape: T
): T => {
  const {width, height} = Dimensions.get('window');
  const tablet = Math.min(width, height) >= 600;
  const portrait = height >= width;

  if (tablet) {
    return portrait ? tabletPortrait : tabletLandscape;
  } else {
    return portrait ? phonePortrait : phoneLandscape;
  }
};
