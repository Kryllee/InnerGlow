import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, TouchableOpacity, ScrollView, Modal, ActivityIndicator, TextInput, Platform, StatusBar, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { FONTS } from '../constants/fonts';
import { useJournal } from '../context/JournalContext';
import { useUser } from '../context/UserContext';
import { API_BASE_URL } from '../config';
import { useRouter } from 'expo-router';

const StreakModal = ({ visible, onClose, onComplete, challenge }) => {
    const [answer, setAnswer] = useState('');

    const handleSend = () => {
        if (answer.trim()) {
            onComplete();
            setAnswer('');
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.streakModalContent}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <FontAwesome5 name="times" size={20} color="#333" />
                    </TouchableOpacity>
                    <FontAwesome5 name="fire" size={40} color="#E78AA1" style={{ marginBottom: 15 }} />
                    <Text style={styles.streakTitle}>Mindset Challenge</Text>
                    <Text style={styles.streakQuestion}>{challenge || 'Loading challenge...'}</Text>

                    <TextInput
                        style={styles.streakInput}
                        placeholder="Type your answer..."
                        value={answer}
                        onChangeText={setAnswer}
                        multiline
                    />

                    <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                        <FontAwesome5 name="paper-plane" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};


// ... (imports remain)

const Progress = () => {
    const insets = useSafeAreaInsets();
    const { entries, gratitude, isStreakActive, setIsStreakActive, fetchEntries } = useJournal();
    const { userProfile, token, refreshProfile } = useUser();
    const router = useRouter();

    // Affirmation State
    const [affirmation, setAffirmation] = useState("Loading affirmation...");
    const [loadingAffirmation, setLoadingAffirmation] = useState(true);

    // Streak State
    const [showStreakModal, setShowStreakModal] = useState(false);
    const [networkChallenge, setNetworkChallenge] = useState(null);
    const [streakCount, setStreakCount] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([
            fetchAffirmation(),
            fetchEntries ? fetchEntries() : Promise.resolve(),
            refreshProfile ? refreshProfile() : Promise.resolve()
        ]);
        setRefreshing(false);
    };

    // Fetch data on screen focus
    useFocusEffect(
        useCallback(() => {
            fetchAffirmation();
            if (fetchEntries) fetchEntries(); // Sync entries
            if (refreshProfile) refreshProfile(); // Sync streak
        }, [fetchEntries, refreshProfile])
    );

    // Update local streak count and status from profile
    useEffect(() => {
        if (userProfile) {
            setStreakCount(userProfile.streakCount || 0);

            // Check if streak completed today
            if (userProfile.lastStreakDate) {
                const today = new Date().toISOString().split('T')[0];
                const lastStreak = new Date(userProfile.lastStreakDate).toISOString().split('T')[0];
                if (lastStreak === today) {
                    setIsStreakActive(true);
                }
            }
        }
    }, [userProfile]);

    // Fetch challenge when modal opens
    useEffect(() => {
        if (showStreakModal) {
            fetchChallenge();
        }
    }, [showStreakModal]);

    const fetchAffirmation = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/affirmation/daily`);
            const data = await response.json();
            if (data && data.text) {
                setAffirmation(data.text);
            }
        } catch (error) {
            console.log("Error fetching affirmation:", error);
            // No static fallback as requested
        } finally {
            setLoadingAffirmation(false);
        }
    };

    const fetchChallenge = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/streak/challenge`);
            const data = await response.json();
            if (data.challenge) {
                setNetworkChallenge(data.challenge);
            }
        } catch (error) {
            console.log("Error fetching challenge:", error);
        }
    };

    const handleStreakComplete = async () => {
        setIsStreakActive(true);
        setShowStreakModal(false);

        // Increment streak in backend
        try {
            if (token && userProfile && userProfile._id) {
                await fetch(`${API_BASE_URL}/streak/complete`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ userId: userProfile._id })
                });
                // Refresh profile to update streak count immediately
                if (refreshProfile) refreshProfile();
                else setStreakCount(prev => prev + 1); // Optimistic update
            }
        } catch (error) {
            console.log("Error updating streak:", error);
        }
    };

    const formatDate = (dateString, type) => {
        if (!dateString) return '';
        // If it's already "Month DD, YYYY", append dummy time or existing time if available?
        // Check if dateString is ISO or already formatted.
        // The requirement is: "December 16, 2025   8:40 PM"

        let dateObj = new Date(dateString);
        if (isNaN(dateObj.getTime())) {
            // If manual string like "Today", return as is or parse
            return dateString;
        }

        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
        return dateObj.toLocaleString('en-US', options).replace(',', '').replace(' at', '  '); // Adjusting to match "December 16, 2025   8:40 PM"
    };

    // Helper to format consistent with requirement
    const getFormattedDate = (entry) => {
        if (entry.displayDate) {
            // Check if displayDate is already formatted? 
            // The User wants "December 16, 2025   8:40 PM"
            // If the backend saves it as a string, we might just display it.
            // But let's try to parse entry.createdAt for consistent real time
            try {
                const date = new Date(entry.createdAt || entry.date);
                return date.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                }) + '   ' + date.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });
            } catch (e) {
                return entry.displayDate;
            }
        }
        return new Date().toLocaleDateString();
    };


    // Get latest entries
    const latestJournalList = entries.slice(0, 3);

    // Filter for just gratitude entries for the "Recent" list if user wants specific gratitude
    const recentGratitudeList = gratitude.slice(0, 3);

    return (
        <View style={{ flex: 1, backgroundColor: '#FCC8D1' }}>
            <ImageBackground source={require('../../app/(tabs)/assets/images/flower.png')} style={styles.background}>
                <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                    <View style={{ flex: 1 }}>
                        <ScrollView
                            contentContainerStyle={styles.container}
                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D14D72" />}
                        >
                            {/* Header Section with Affirmation */}
                            <View style={styles.headerCard}>
                                <View style={styles.affirmationContent}>
                                    <View style={styles.affirmationTitleContainer}>
                                        <FontAwesome5 name="star" size={24} color="#E78AA1" />
                                        <Text style={styles.affirmationTitle}>Daily Affirmation</Text>
                                    </View>
                                    {loadingAffirmation ? (
                                        <ActivityIndicator size="small" color="#E78AA1" style={{ alignSelf: 'flex-start', marginLeft: 20 }} />
                                    ) : (
                                        <Text style={styles.affirmationText}>
                                            {affirmation}
                                        </Text>
                                    )}
                                </View>
                                {/* Kiki Image - Positioned to not cover text */}
                                <View style={styles.kikiContainer}>
                                    <Image source={require('../../app/(tabs)/assets/images/kiki.png')} style={styles.kikiImage} resizeMode="contain" />
                                </View>
                            </View>

                            {/* --- Stats/Metric Cards Section --- */}
                            <View style={styles.statsContainer}>
                                {/* Streak Card */}
                                <TouchableOpacity
                                    style={[styles.statCard, isStreakActive && styles.activeCardBorder]}
                                    onPress={() => !isStreakActive && setShowStreakModal(true)}
                                    disabled={isStreakActive}
                                >
                                    <FontAwesome5
                                        name="fire"
                                        size={30}
                                        color={isStreakActive ? "#D14D72" : "#E78AA1"}
                                        style={styles.statIcon}
                                    />
                                    <Text style={styles.statNumber}>{streakCount}</Text>
                                    <Text style={styles.statLabel}>Day Streak</Text>
                                </TouchableOpacity>

                                {/* Entries Card - NAVIGATE */}
                                <TouchableOpacity
                                    style={styles.statCard}
                                    onPress={() => router.push('/journalGratitudeView')}
                                >
                                    <FontAwesome5 name="calendar-alt" size={30} color="#E78AA1" style={styles.statIcon} />
                                    <Text style={styles.statNumber}>{entries.length}</Text>
                                    <Text style={styles.statLabel}>Entries</Text>
                                </TouchableOpacity>

                                {/* Gratitude Card - NAVIGATE */}
                                <TouchableOpacity
                                    style={styles.statCard}
                                    onPress={() => router.push('/journalGratitudeView')}
                                >
                                    <FontAwesome5 name="heart" size={30} color="#E78AA1" style={styles.statIcon} solid />
                                    <Text style={styles.statNumber}>{gratitude.length}</Text>
                                    <Text style={styles.statLabel}>Gratitude</Text>
                                </TouchableOpacity>
                            </View>

                            {/* --- Recent Entries Header --- */}
                            <View style={styles.recentHeader}>
                                <Text style={styles.recentTitle}>Recent Entries</Text>
                                <TouchableOpacity onPress={() => router.push('/journalGratitudeView')}>
                                    <Text style={styles.viewAllText}>
                                        View All
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* --- Recent Journal --- */}
                            {latestJournalList.length > 0 ? (
                                latestJournalList.map((item, index) => (
                                    <View key={item._id || index} style={[styles.entryCard, styles.journalCardBackground]}>
                                        <View style={styles.entryHeader}>
                                            <Text style={[styles.entryType, styles.journalType]}>Journal</Text>
                                            <Text style={styles.entryTime}>{getFormattedDate(item)}</Text>
                                        </View>
                                        <Text style={styles.entryText} numberOfLines={2}>
                                            {item.text}
                                        </Text>
                                    </View>
                                ))
                            ) : (
                                <View style={[styles.entryCard, { alignItems: 'center', justifyContent: 'center' }]}>
                                    <Text style={{ fontFamily: FONTS.regular, color: '#999' }}>No journal entries yet.</Text>
                                </View>
                            )}

                            {/* --- Recent Gratitude List --- */}
                            <Text style={[styles.recentTitle, { marginTop: 20, marginBottom: 10, marginLeft: 5 }]}>Recent Gratitude</Text>

                            {recentGratitudeList.length > 0 ? (
                                recentGratitudeList.map((item, index) => (
                                    <View key={item._id || index} style={styles.entryCard}>
                                        <View style={styles.entryHeader}>
                                            <Text style={[styles.entryType, styles.gratitudeType]}>Gratitude</Text>
                                            <Text style={styles.entryTime}>{getFormattedDate(item)}</Text>
                                        </View>
                                        <Text style={styles.entryText} numberOfLines={3}>
                                            {item.items.join(', ')}
                                        </Text>
                                    </View>
                                ))
                            ) : (
                                <View style={[styles.entryCard, { alignItems: 'center', justifyContent: 'center' }]}>
                                    <Text style={{ fontFamily: FONTS.regular, color: '#999' }}>No gratitude list yet.</Text>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </SafeAreaView>
            </ImageBackground>

            <StreakModal
                visible={showStreakModal}
                onClose={() => setShowStreakModal(false)}
                onComplete={handleStreakComplete}
                challenge={networkChallenge}
            />
        </View>
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
        paddingTop: 20,
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
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden'
    },
    affirmationContent: {
        flex: 1,
        paddingRight: 10,
        zIndex: 2,
    },
    kikiContainer: {
        width: 80,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    kikiImage: {
        width: 100,
        height: 100,
        opacity: 0.9,
    },
    affirmationTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    affirmationTitle: {
        fontSize: 18,
        fontFamily: FONTS.semiBold,
        color: '#E78AA1',
        marginLeft: 5,
    },
    affirmationText: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        color: '#333',
        marginTop: 5,
        lineHeight: 24,
    },
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
        minHeight: 110,
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    activeCardBorder: {
        borderColor: '#D14D72',
        backgroundColor: '#FFF0F5',
    },
    statIcon: {
        marginBottom: 5,
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
    entryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#FFABAB',
        minHeight: 100,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    streakModalContent: {
        backgroundColor: '#FFF',
        width: '80%',
        padding: 25,
        borderRadius: 20,
        alignItems: 'center',
        elevation: 5,
    },
    streakTitle: {
        fontSize: 20,
        fontFamily: FONTS.bold,
        color: '#333',
        marginBottom: 10,
    },
    streakQuestion: {
        fontSize: 16,
        fontFamily: FONTS.regular,
        textAlign: 'center',
        color: '#555',
        marginBottom: 25,
    },
    streakInput: {
        width: '100%',
        backgroundColor: '#F5F5F5',
        borderRadius: 15,
        padding: 15,
        minHeight: 100,
        textAlignVertical: 'top',
        marginBottom: 15,
        fontFamily: FONTS.regular,
    },
    sendButton: {
        backgroundColor: '#D14D72',
        borderRadius: 25,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-end',
        elevation: 3,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 15,
        padding: 5,
    }
});

export default Progress;