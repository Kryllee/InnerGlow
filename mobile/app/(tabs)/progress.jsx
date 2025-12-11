import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, TouchableOpacity, ScrollView, Modal, ActivityIndicator, Alert, TextInput } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { FONTS } from '../constants/fonts';
import JournalGratitudeView from '../components/journalGratitudeView';
import { useJournal } from '../context/JournalContext';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/affirmation/daily`;

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

const Progress = () => {
    const { entries, gratitude, isStreakActive, setIsStreakActive } = useJournal();
    const [showJournalGratitude, setShowJournalGratitude] = useState(false);

    // Affirmation State
    const [affirmation, setAffirmation] = useState("Loading affirmation...");
    const [loadingAffirmation, setLoadingAffirmation] = useState(true);

    // Streak State
    const [showStreakModal, setShowStreakModal] = useState(false);
    const [networkChallenge, setNetworkChallenge] = useState(null);

    // Fetch affirmation on mount
    useEffect(() => {
        fetchAffirmation();
    }, []);

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
            } else {
                setAffirmation("You are capable of amazing things.");
            }
        } catch (error) {
            console.log("Error fetching affirmation:", error);
            setAffirmation("You are strong, confident, and unstoppable.");
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
        } catch (error) {
            console.log("Error updating streak:", error);
        }
    };

    // Get latest entries
    const latestJournal = entries.length > 0 ? entries[0] : null;
    const latestGratitude = gratitude.length > 0 ? gratitude[0] : null;

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
                        {loadingAffirmation ? (
                            <ActivityIndicator size="small" color="#E78AA1" style={{ alignSelf: 'flex-start', marginLeft: 20 }} />
                        ) : (
                            <Text style={styles.affirmationText}>
                                {affirmation}
                            </Text>
                        )}
                    </View>
                    <Image source={require('../(tabs)/assets/images/kiki.png')} style={styles.kikiImage} resizeMode="contain" />
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
                        <Text style={styles.statNumber}>7</Text>
                        <Text style={styles.statLabel}>Day Streak</Text>
                    </TouchableOpacity>

                    {/* Entries Card */}
                    <View style={styles.statCard}>
                        <FontAwesome5 name="calendar-alt" size={30} color="#E78AA1" style={styles.statIcon} />
                        <Text style={styles.statNumber}>{entries.length}</Text>
                        <Text style={styles.statLabel}>Entries</Text>
                    </View>

                    {/* Gratitude Card */}
                    <View style={styles.statCard}>
                        <FontAwesome5 name="heart" size={30} color="#E78AA1" style={styles.statIcon} solid />
                        <Text style={styles.statNumber}>{gratitude.length}</Text>
                        <Text style={styles.statLabel}>Gratitude</Text>
                    </View>
                </View>

                {/* --- Recent Entries Header --- */}
                <View style={styles.recentHeader}>
                    <Text style={styles.recentTitle}>Recent Entries</Text>
                    <TouchableOpacity onPress={() => setShowJournalGratitude(true)}>
                        <Text style={styles.viewAllText}>
                            View All
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* --- Recent Entries List --- */}
                {latestJournal ? (
                    <View style={[styles.entryCard, styles.journalCardBackground]}>
                        <View style={styles.entryHeader}>
                            <Text style={[styles.entryType, styles.journalType]}>Journal</Text>
                            <Text style={styles.entryTime}>{latestJournal.date.toString()}</Text>
                        </View>
                        <Text style={styles.entryText} numberOfLines={2}>
                            {latestJournal.text}
                        </Text>
                    </View>
                ) : (
                    <View style={[styles.entryCard, { alignItems: 'center', justifyContent: 'center' }]}>
                        <Text style={{ fontFamily: FONTS.regular, color: '#999' }}>No journal entries yet.</Text>
                    </View>
                )}

                {/* Gratitude Entry Card */}
                {latestGratitude ? (
                    <View style={styles.entryCard}>
                        <View style={styles.entryHeader}>
                            <Text style={[styles.entryType, styles.gratitudeType]}>Gratitude</Text>
                            <Text style={styles.entryTime}>{latestGratitude.date.toString()}</Text>
                        </View>
                        <Text style={styles.entryText} numberOfLines={3}>
                            {latestGratitude.items.join(', ')}
                        </Text>
                    </View>
                ) : (
                    <View style={[styles.entryCard, { alignItems: 'center', justifyContent: 'center' }]}>
                        <Text style={{ fontFamily: FONTS.regular, color: '#999' }}>No gratitude list yet.</Text>
                    </View>
                )}
            </ScrollView>

            {/* Modal for Journal/Gratitude View */}
            <Modal
                visible={showJournalGratitude}
                animationType="slide"
                onRequestClose={() => setShowJournalGratitude(false)}
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity
                        style={styles.fullScreenCloseButton}
                        onPress={() => setShowJournalGratitude(false)}
                    >
                        <FontAwesome5 name="times" size={24} color="#333" />
                    </TouchableOpacity>
                    <JournalGratitudeView />
                </View>
            </Modal>

            <StreakModal
                visible={showStreakModal}
                onClose={() => setShowStreakModal(false)}
                onComplete={handleStreakComplete}
                challenge={networkChallenge}
            />
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
        paddingRight: 10,
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
        fontSize: 22, // Slightly smaller to fit API text better
        fontFamily: FONTS.bold,
        color: '#333',
        marginTop: 5,
    },
    kikiImage: {
        width: 100,
        height: 100,
        position: 'absolute',
        right: 0,
        top: 0,
        opacity: 0.8,
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
        minHeight: 110,
        justifyContent: 'center',
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
        color: '#D14D72' // Matching color
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
    modalContainer: {
        flex: 1,
        backgroundColor: '#FEF2F4',
    },
    fullScreenCloseButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
    },

    // Streak Modal Styles
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