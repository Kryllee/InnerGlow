/**
 * Font Constants
 * Centralized font family definitions for the entire app
 */

export const FONTS = {
    // Quicksand Font Family (only the weights we use)
    bold: 'Quicksand-Bold',
    semiBold: 'Quicksand-SemiBold',
    regular: 'Quicksand-Regular',
};

/**
 * Typography Styles
 * Pre-defined text styles for common use cases
 */
export const TYPOGRAPHY = {
    // Headings
    h1: {
        fontFamily: FONTS.bold,
        fontSize: 32,
    },
    h2: {
        fontFamily: FONTS.bold,
        fontSize: 28,
    },
    h3: {
        fontFamily: FONTS.semiBold,
        fontSize: 24,
    },
    h4: {
        fontFamily: FONTS.semiBold,
        fontSize: 20,
    },

    // Body Text
    body: {
        fontFamily: FONTS.regular,
        fontSize: 16,
    },
    bodyBold: {
        fontFamily: FONTS.semiBold,
        fontSize: 16,
    },

    // Small Text
    caption: {
        fontFamily: FONTS.regular,
        fontSize: 14,
    },
    captionBold: {
        fontFamily: FONTS.semiBold,
        fontSize: 14,
    },

    // Tiny Text
    small: {
        fontFamily: FONTS.regular,
        fontSize: 12,
    },
    smallBold: {
        fontFamily: FONTS.semiBold,
        fontSize: 12,
    },

    // Input Text
    input: {
        fontFamily: FONTS.regular,
        fontSize: 16,
    },

    // Button Text
    button: {
        fontFamily: FONTS.semiBold,
        fontSize: 16,
    },
};

// Default export for convenience
export default {
    FONTS,
    TYPOGRAPHY,
};
