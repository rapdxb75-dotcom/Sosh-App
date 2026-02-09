import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;

export function normalize(size: number) {
    const newSize = size * scale;
    if (newSize < 1) {
        return Math.round(PixelRatio.roundToNearestPixel(1));
    }
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

export const FontFamily = {
    questrial: 'Questrial_400Regular',
    inter: 'Inter_600SemiBold',
    interRegular: 'Inter_400Regular',
};

export const FontSize = {
    heading: normalize(56),
    body: normalize(14),
    small: normalize(12),
    button: normalize(18), // lg
};
