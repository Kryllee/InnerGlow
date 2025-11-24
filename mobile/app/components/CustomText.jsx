import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { FONTS } from '../constants/fonts';

const BASE_STYLES = StyleSheet.create({
    subheading: {
        fontFamily: FONTS.semiBold,
        fontSize: 20,
    },
    body: {
        fontFamily: FONTS.regular,
        fontSize: 16,
    },
});

// --- Named Exports (For utilities) ---

export const Subheading = ({ children, style, ...props }) => (
    <Text
        style={[BASE_STYLES.subheading, style]}
        {...props}
    >
        {children}
    </Text>
);

export const BodyText = ({ children, style, ...props }) => (
    <Text
        style={[BASE_STYLES.body, style]}
        {...props}
    >
        {children}
    </Text>
);

// --- Default Export  ---
const CustomText = ({ children, style, ...props }) => (
    <Text
        style={[BASE_STYLES.body, style]}
        {...props}
    >
        {children}
    </Text>
);

export default CustomText;

