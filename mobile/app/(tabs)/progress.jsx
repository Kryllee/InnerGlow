import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { FONTS } from '../constants/fonts';

const progress = () => {
    return (
        <ImageBackground source={require('../(tabs)/assets/images/flower.png')} style={styles.background}>
            <ScrollView contentContainerStyle={styles.container}>

                {/* Header Section with Affirmation */}
                <View style={styles.headerCard}>
                    <View style={styles.affirmationContent}>
                        <View style={styles.affirmationTitleContainer}>
                            <FontAwesome5 name="star" size={24} color="#E78AA1" />
                            <Text style={styles.affirmationTitle}>Daily Affirmation</Text>
                        </View>
                        <Text style={styles.affirmationText}>
                            You have the strength to overcome challenges.
                        </Text>
                    </View>
                    <Image source={require('../(tabs)/assets/images/kiki.png')} style={styles.kikiImage} resizeMode="contain" />
                </View>

                {/* --- Stats/Metric Cards Section --- */}
                <View style={styles.statsContainer}>
                    {/* 7 Day Streak Card */}
                    <View style={styles.statCard}>
                        <FontAwesome5 name="fire" size={30} color="#E78AA1" style={styles.statIcon} />
                        <Text style={styles.statNumber}>7</Text>
                        <Text style={styles.statLabel}>Day Streak</Text>
                    </View>

                    {/* 24 Entries Card */}
                    <View style={styles.statCard}>
                        <FontAwesome5 name="calendar-alt" size={30} color="#E78AA1" style={styles.statIcon} />
                        <Text style={styles.statNumber}>24</Text>
                        <Text style={styles.statLabel}>Entries</Text>
                    </View>

                    {/* 15 Gratitude Card */}
                    <View style={styles.statCard}>
                        <FontAwesome5 name="heart" size={30} color="#E78AA1" style={styles.statIcon} solid />
                        <Text style={styles.statNumber}>15</Text>
                        <Text style={styles.statLabel}>Gratitude</Text>
                    </View>
                </View>

                {/* --- Recent Entries Header --- */}
                <View style={styles.recentHeader}>
                    <Text style={styles.recentTitle}>Recent Entries</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewAllText}>
                            View All
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* --- Recent Entries List --- */}
                <View style={[styles.entryCard, styles.journalCardBackground]}>
                    <View style={styles.entryHeader}>
                        <Text style={[styles.entryType, styles.journalType]}>Journal</Text>
                        <Text style={styles.entryTime}>Today, 8:02 pm</Text>
                    </View>
                    <Text style={styles.entryText} numberOfLines={2}>
                        Ganiha sa 3rd floor sa CITC Building, nagkita mi—nag-wave sa usag usa with a smile, then nag ki...
                    </Text>
                </View>

                {/* Gratitude Entry Card */}
                <View style={styles.entryCard}>
                    <View style={styles.entryHeader}>
                        <Text style={[styles.entryType, styles.gratitudeType]}>Gratitude</Text>
                        <Text style={styles.entryTime}>Yesterday, 8:10 pm</Text>
                    </View>
                    <Text style={styles.entryText} numberOfLines={3}>
                        That unexpected smile from someone I like. That quiet moment when our eyes locked and my heart forgot its rhythm...
                    </Text>
                </View>
            </ScrollView>
        </ImageBackground>
    );
};
const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    container: {
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 80
    },
    headerCard: {
        backgroundColor: '#F0FFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    affirmationContent: {
        flex: 1,
    },
    affirmationTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
        shadowColor: 'rgba(231,138,161,0.35)',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.50,
        shadowRadius: 20,
        elevation: 6,
    },
    affirmationTitle: {
        fontSize: 18,
        fontFamily: FONTS.semiBold,
        color: '#E78AA1',
        marginLeft: 5,
    },
    affirmationText: {
        fontSize: 28,
        alignItems: 'center',
        fontFamily: FONTS.bold,
        color: '#333',
    },
    kikiImage: {
        width: 100,
        height: 100,
        marginLeft: 10,
        position: 'absolute',
        right: 0,
        top: 0,
    },

    // Stats Section
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    statLabel: {
        fontSize: 12,
        color: '#333',
        fontFamily: FONTS.regular,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 15,
        alignItems: 'center',
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: '#FFABAB',
    },
    statIcon: {
        marginBottom: 5,
        color: '#E78AA1'
    },
    statNumber: {
        fontSize: 24,
        fontFamily: FONTS.bold,
        color: '#333',
    },
    recentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 15,
        paddingHorizontal: 5,
    },
    recentTitle: {
        fontSize: 20,
        fontFamily: FONTS.bold,
        color: '#333',
    },
    viewAllText: {
        fontSize: 14,
        color: '#D14D72',
        fontFamily: FONTS.semiBold,
    },
    // Entry Card Styles
    entryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#FFABAB'
    },
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    entryType: {
        fontSize: 16,
        fontFamily: FONTS.semiBold,
    },
    journalType: {
        color: '#D14D72'
    },
    gratitudeType: {
        color: '#D14D72'
    },
    entryTime: {
        fontSize: 12,
        color: '#666',
        fontFamily: FONTS.regular,
    },
    entryText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
        fontFamily: FONTS.regular,
    },
    navItem: {
        padding: 5,
    }
});
export default progress;