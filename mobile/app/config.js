import { Platform } from 'react-native';

const getBaseUrl = () => {
    if (Platform.OS === 'ios') {
        return process.env.EXPO_PUBLIC_API_URL_IOS || process.env.EXPO_PUBLIC_API_URL_DEFAULT;
    } else if (Platform.OS === 'android') {
        return process.env.EXPO_PUBLIC_API_URL_ANDROID || process.env.EXPO_PUBLIC_API_URL_DEFAULT;
    } else if (Platform.OS === 'web') {
        return process.env.EXPO_PUBLIC_API_URL_WEB || process.env.EXPO_PUBLIC_API_URL_DEFAULT;
    }
    return process.env.EXPO_PUBLIC_API_URL_DEFAULT;
};

export const API_BASE_URL = getBaseUrl();
