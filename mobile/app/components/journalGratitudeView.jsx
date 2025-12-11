import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { FONTS } from '../constants/fonts';
import { Ionicons } from '@expo/vector-icons';
import { useJournal } from '../context/JournalContext';
import { Audio } from 'expo-av';
import { API_BASE_URL } from '../config';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;

const journalGratitudeView = () => {
    // Consume context instead of local state
    const { entries: journalEntries, gratitude: gratitudeEntries, updateEntry } = useJournal();

    // State for modal
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState('');
    const [entryType, setEntryType] = useState('');

    // Audio playback state
    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Open modal
    const openModal = (entry, type) => {
        setSelectedEntry(entry);
        setEntryType(type);
        // For gratitude, join items for editing
        if (type === 'gratitude') {
            setEditedText(entry.items.join('\n'));
        } else {
            setEditedText(entry.text || '');
        }
        setIsModalVisible(true);
        setIsEditing(false);
    };

    // Save edited content
    const saveEdit = async () => {
        if (entryType === 'journal') {
            // Update journal entry
            await updateEntry(selectedEntry._id, { text: editedText }, 'journal');
            setSelectedEntry({ ...selectedEntry, text: editedText });
        } else {
            // Update gratitude entry - split by newlines
            const newItems = editedText.split('\n').filter(item => item.trim() !== '');
            await updateEntry(selectedEntry._id, { items: newItems }, 'gratitude');
            setSelectedEntry({ ...selectedEntry, items: newItems });
        }
        setIsEditing(false);
    };

    // Close modal
    const closeModal = async () => {
        if (sound) {
            await sound.unloadAsync();
            setSound(null);
        }
        setIsPlaying(false);
        setIsModalVisible(false);
        setIsEditing(false);
        setSelectedEntry(null);
    };

    // Start editing
    const startEditing = () => {
        setIsEditing(true);
    };

    // Play/Pause audio
    const toggleAudioPlayback = async () => {
        try {
            if (!selectedEntry?.audioUrl) return;

            console.log('Attempting to play audio from:', selectedEntry.audioUrl);

            if (sound) {
                if (isPlaying) {
                    await sound.pauseAsync();
                    setIsPlaying(false);
                } else {
                    await sound.playAsync();
                    setIsPlaying(true);
                }
            } else {
                // audioUrl from Cloudinary is already a full URL
                // If it starts with /, it's an old local path - show error
                if (selectedEntry.audioUrl.startsWith('/')) {
                    Alert.alert(
                        'Old Recording',
                        'This is an old recording saved before cloud storage was enabled. Please record a new voice note.',
                        [{ text: 'OK' }]
                    );
                    return;
                }

                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri: selectedEntry.audioUrl },
                    { shouldPlay: true },
                    (status) => {
                        if (status.didJustFinish) {
                            setIsPlaying(false);
                        }
                    }
                );
                setSound(newSound);
                setIsPlaying(true);
            }
        } catch (error) {
            console.error('Error playing audio:', error);
            Alert.alert('Error', 'Failed to play audio. Please try recording a new voice note.');
        }
    };

    const renderJournalCard = (entry) => (
        <View key={entry._id} style={styles.cardWrapper}>
            <Image
                source={require('../(tabs)/assets/images/ribbon.png')}
                style={styles.ribbonTopRight}
                resizeMode="contain"
            />

            <TouchableOpacity
                style={styles.polaroid}
                onPress={() => openModal(entry, 'journal')}
                activeOpacity={0.8}
            >
                <View style={styles.pinkContent}>
                    {entry.audioUrl ? (
                        <View style={styles.audioIndicator}>
                            <Ionicons name="musical-notes" size={40} color="#D14D72" />
                            <Text style={styles.audioText}>Voice Note</Text>
                        </View>
                    ) : (
                        <Text style={styles.contentText} numberOfLines={8}>{entry.text || ''}</Text>
                    )}
                </View>
                <Text style={styles.dateText}>{entry.date}</Text>
            </TouchableOpacity>
        </View>
    );

    const renderGratitudeCard = (entry) => (
        <View key={entry._id} style={styles.cardWrapper}>
            <Image
                source={require('../(tabs)/assets/images/ribbon.png')}
                style={styles.ribbonTopLeft}
                resizeMode="contain"
            />

            <TouchableOpacity
                style={styles.polaroid}
                onPress={() => openModal(entry, 'gratitude')}
                activeOpacity={0.8}
            >
                <View style={styles.pinkContent}>
                    {entry.items.map((item, index) => (
                        <View key={index} style={styles.bulletRow}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.contentText}>{item}</Text>
                        </View>
                    ))}
                </View>
                <Text style={styles.dateText}>{entry.date}</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Journal</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.cardsContainer}
                    >
                        {journalEntries.map(renderJournalCard)}
                    </ScrollView>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Gratitude</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.cardsContainer}
                    >
                        {gratitudeEntries.map(renderGratitudeCard)}
                    </ScrollView>
                </View>
            </ScrollView>

            {/* Simple Pink Rectangle Modal */}
            <Modal
                visible={isModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    {/* Close button */}
                    <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                        <Ionicons name="close" size={30} color="#FFF" />
                    </TouchableOpacity>

                    {/* Edit button (pen icon) - only show for text entries */}
                    {!selectedEntry?.audioUrl && (
                        <TouchableOpacity style={styles.editButton} onPress={startEditing}>
                            <Ionicons name="pencil" size={24} color="#333" />
                        </TouchableOpacity>
                    )}

                    {/* Pink content - no white container */}
                    <View style={styles.modalPinkContent}>
                        {isEditing ? (
                            <>
                                <TextInput
                                    style={styles.editInput}
                                    value={editedText}
                                    onChangeText={setEditedText}
                                    multiline={true}
                                    autoFocus={true}
                                    placeholder={entryType === 'gratitude' ? "Write each item on a new line..." : "Write your thoughts..."}
                                />
                                {/* Save button */}
                                <TouchableOpacity style={styles.saveButton} onPress={saveEdit}>
                                    <Text style={styles.saveButtonText}>Save</Text>
                                </TouchableOpacity>
                            </>
                        ) : selectedEntry?.audioUrl ? (
                            <View style={styles.audioPlayerContainer}>
                                <Ionicons name="musical-notes" size={60} color="#D14D72" />
                                <Text style={styles.audioLabel}>Voice Recording</Text>
                            </View>
                        ) : (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {entryType === 'journal' ? (
                                    <Text style={styles.modalText}>
                                        {selectedEntry?.text}
                                    </Text>
                                ) : (
                                    selectedEntry?.items.map((item, index) => (
                                        <View key={index} style={styles.bulletRow}>
                                            <Text style={styles.bullet}>•</Text>
                                            <Text style={styles.modalText}>{item}</Text>
                                        </View>
                                    ))
                                )}
                            </ScrollView>
                        )}

                        {/* Audio Player */}
                        {selectedEntry?.audioUrl && !isEditing && (
                            <TouchableOpacity
                                style={styles.audioPlayerButton}
                                onPress={toggleAudioPlayback}
                            >
                                <Ionicons
                                    name={isPlaying ? "pause-circle" : "play-circle"}
                                    size={40}
                                    color="#333"
                                />
                                <Text style={styles.audioPlayerText}>
                                    {isPlaying ? 'Pause Voice Note' : 'Play Voice Note'}
                                </Text>
                            </TouchableOpacity>
                        )}

                        {/* Date at bottom */}
                        <Text style={styles.modalDate}>{selectedEntry?.date}</Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { // Main container
        flex: 1,
        backgroundColor: '#FEF2F4',
    },
    section: { // Section wrapper
        marginVertical: 30,
    },
    sectionTitle: { // Section title text
        fontSize: 24,
        fontFamily: FONTS.bold,
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
    },
    cardsContainer: { // Horizontal scroll container
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    cardWrapper: { // Card + ribbon wrapper
        width: CARD_WIDTH,
        marginRight: 15,
        position: 'relative',
    },
    polaroid: { // White polaroid card
        width: '100%',
        backgroundColor: '#FFFFFF',
        padding: 20,
        paddingBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    pinkContent: { // Pink content area
        backgroundColor: '#F2AFBC',
        borderRadius: 8,
        padding: 20,
        minHeight: 220,
        justifyContent: 'center',
    },
    contentText: { // Text inside cards
        fontSize: 16,
        fontFamily: FONTS.regular,
        color: '#333',
        lineHeight: 24,
    },
    dateText: { // Date text
        fontSize: 14,
        fontFamily: FONTS.regular,
        color: '#999',
        textAlign: 'left',
        marginTop: 15,
    },
    ribbonTopRight: { // Ribbon for journal
        width: 110,
        height: 110,
        position: 'absolute',
        top: -20,
        right: '70%',
        zIndex: 10,
    },
    ribbonTopLeft: { // Ribbon for gratitude
        width: 110,
        height: 110,
        position: 'absolute',
        top: -20,
        left: '70%',
        zIndex: 10,
    },
    bulletRow: { // Gratitude bullet row
        flexDirection: 'row',
        marginBottom: 8,
    },
    bullet: { // Bullet point
        fontSize: 16,
        fontFamily: FONTS.bold,
        color: '#333',
        marginRight: 10,
    },
    audioIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    audioText: {
        fontSize: 16,
        fontFamily: FONTS.semiBold,
        color: '#D14D72',
        textAlign: 'center',
    },
    audioPlayerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 15,
        paddingVertical: 30,
    },
    audioLabel: {
        fontSize: 18,
        fontFamily: FONTS.semiBold,
        color: '#D14D72',
        textAlign: 'center',
    },

    // Modal styles
    modalOverlay: { // Modal background
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    closeButton: { // Close button (X)
        position: 'absolute',
        top: 50,
        left: 30,
        zIndex: 10,
        padding: 5,
    },
    editButton: { // Edit button (pen)
        position: 'absolute',
        top: 50,
        right: 30,
        zIndex: 10,
        padding: 5,
        backgroundColor: '#FFF',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalPinkContent: { // Modal pink area
        backgroundColor: '#F2AFBC',
        borderRadius: 16,
        padding: 25,
        width: '90%',
        maxHeight: '70%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    modalText: { // Modal text content
        fontSize: 16,
        fontFamily: FONTS.regular,
        color: '#333',
        lineHeight: 24,
        marginBottom: 20,
    },
    modalDate: { // Modal date text
        fontSize: 14,
        fontFamily: FONTS.regular,
        color: '#666',
        textAlign: 'center',
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    editInput: { // Text input for editing
        fontSize: 16,
        fontFamily: FONTS.regular,
        color: '#333',
        lineHeight: 24,
        minHeight: 250,
        textAlignVertical: 'top',
        marginBottom: 15,
    },
    saveButton: { // Save button
        backgroundColor: '#333',
        borderRadius: 10,
        padding: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: { // Save button text
        color: '#FFF',
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
    audioPlayerButton: { // Audio player button
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 12,
        marginTop: 15,
        gap: 10,
    },
    audioPlayerText: { // Audio player text
        fontSize: 16,
        fontFamily: FONTS.semiBold,
        color: '#333',
    },
});

export default journalGratitudeView;