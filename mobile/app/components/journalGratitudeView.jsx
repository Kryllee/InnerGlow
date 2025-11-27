import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions, TouchableOpacity, Modal, TextInput } from 'react-native';
import { FONTS } from '../constants/fonts';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;

const journalGratitudeView = () => {
    // State for entries
    const [journalEntries, setJournalEntries] = useState([
        {
            id: 1,
            text: "Ganiha sa 3rd floor sa CITC Building, nagkita mi—nag-wave sa usag usa with a smile, then nag kita gyud mi og klaro, murag slow-mo ang tanan. Gikapoy ko ato tungod sa prelim results—murag giluya akong kasing-kasing. Pero pagkakita nako niya, kalit lang ko'g smile nga wa nako damha. Ang akong friend pa gyud, murag naa gyuy plano. Ingon siya, 'Dari ta agi sa hagdanan.' Bisag naa may elevator, ni-insist gyud siya. Knowing him, kabalo ko nga naa na siyay gi-execute nga mission. Sumabay ra ko sa iyang trip, then boom—naa siya didto. Murag scripted kaayo ang moment. Ang akong disappointment kay nawala, napulihan og butterflies sa tiyan. Murag gi-restart akong adlaw. Kilig kaayo, promise. Basin wala siya kabalo, pero para nako, that small wave and smile meant everything.",
            date: "11/27/25   8:02 PM"
        },
        {
            id: 2,
            text: "Ganiha sa 3rd floor sa CITC Building, nagkita mi—nag-wave sa usag usa with a smile, then nag ki....",
            date: "11/28/25   8:02 AM"
        }
    ]);

    const [gratitudeEntries, setGratitudeEntries] = useState([
        {
            id: 1,
            items: [
                "That unexpected smile from someone I like",
                "That quiet moment when our eyes locked and my",
                "heart forgot its rhythm..."
            ],
            date: "11/27/25   8:02 PM"
        },
        {
            id: 2,
            items: [
                "That unexpected smile from someone I like",
                "That quiet moment when our eyes locked and my",
                "heart forgot its rhythm..."
            ],
            date: "11/28/25   8:02 AM"
        }
    ]);

    // State for modal
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState('');
    const [entryType, setEntryType] = useState('');

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
    const saveEdit = () => {
        if (entryType === 'journal') {
            // Update journal entry
            setJournalEntries(journalEntries.map(entry =>
                entry.id === selectedEntry.id
                    ? { ...entry, text: editedText }
                    : entry
            ));
            setSelectedEntry({ ...selectedEntry, text: editedText });
        } else {
            // Update gratitude entry - split by newlines
            const newItems = editedText.split('\n').filter(item => item.trim() !== '');
            setGratitudeEntries(gratitudeEntries.map(entry =>
                entry.id === selectedEntry.id
                    ? { ...entry, items: newItems }
                    : entry
            ));
            setSelectedEntry({ ...selectedEntry, items: newItems });
        }
        setIsEditing(false);
    };

    // Close modal
    const closeModal = () => {
        setIsModalVisible(false);
        setIsEditing(false);
        setSelectedEntry(null);
    };

    // Start editing
    const startEditing = () => {
        setIsEditing(true);
    };

    const renderJournalCard = (entry) => (
        <View key={entry.id} style={styles.cardWrapper}>
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
                    <Text style={styles.contentText} numberOfLines={8}>{entry.text}</Text>
                </View>
                <Text style={styles.dateText}>{entry.date}</Text>
            </TouchableOpacity>
        </View>
    );

    const renderGratitudeCard = (entry) => (
        <View key={entry.id} style={styles.cardWrapper}>
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

                    {/* Edit button (pen icon) */}
                    <TouchableOpacity style={styles.editButton} onPress={startEditing}>
                        <Ionicons name="pencil" size={24} color="#333" />
                    </TouchableOpacity>

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
});

export default journalGratitudeView;