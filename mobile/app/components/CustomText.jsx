import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { FONTS } from '../constants/fonts';

export const Subheading = ({ children, style, ...props }) => {
    return <Text style={[styles.subheading, style]} {...props}>{children}</Text>;
};

export const BodyText = ({ children, style, ...props }) => {
    return <Text style={[styles.body, style]} {...props}>{children}</Text>;
};

const CustomText = ({ children, style, ...props }) => {
    return <Text style={[styles.body, style]} {...props}>{children}</Text>;
};

const styles = StyleSheet.create({
    subheading: { // Bold heading text
        fontFamily: FONTS.semiBold,
        fontSize: 20,
    },
    body: { // Regular body text
        fontFamily: FONTS.regular,
        fontSize: 16,
    },
});

export default CustomText;
