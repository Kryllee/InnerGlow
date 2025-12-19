
import React, { useState, useEffect, useCallback } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Subheading, BodyText } from './components/CustomText';
import { API_BASE_URL } from './config';
import { useUser } from './context/UserContext';
import CustomAlert from './components/CustomAlert';

const { width } = Dimensions.get('window');

export default function MyPinsScreen() {
    const router = useRouter();
    const { token, userProfile } = useUser();
    const [pins, setPins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedPins, setSelectedPins] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Custom Alert State
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', onConfirm: null, singleButton: true });

    const showAlert = (title, message, onConfirm = null) => {
        setAlertConfig({ visible: true, title, message, onConfirm, singleButton: true });
    };

    const hideAlert = () => {
        setAlertConfig(prev => ({ ...prev, visible: false }));
    };

    const fetchPins = async () => {
        try {
            if (!token || !userProfile?._id) return;
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/pins?userId=${userProfile._id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPins(data);
            }
        } catch (error) {
            console.error("Error fetching pins:", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchPins();
        }, [token, userProfile])
    );

    const toggleSelectMode = () => {
        setIsSelectMode(!isSelectMode);
        setSelectedPins([]);
    };

    const handleSelectPin = (pinId) => {
        if (!isSelectMode) {
            router.push({ pathname: '/pin-detail', params: { id: pinId } });
            return;
        }

        if (selectedPins.includes(pinId)) {
            setSelectedPins(selectedPins.filter(id => id !== pinId));
        } else {
            setSelectedPins([...selectedPins, pinId]);
        }
    };

    const confirmDelete = () => {
        setShowDeleteModal(true);
    };

    const deleteSelectedPins = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/pins/delete-batch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ pinIds: selectedPins })
            });

            if (res.ok) {
                // Update UI locally
                setPins(pins.filter(p => !selectedPins.includes(p._id)));
                setIsSelectMode(false);
                setSelectedPins([]);
                setShowDeleteModal(false);
            } else {
                setShowDeleteModal(false);
                showAlert("Error", "Failed to delete pins");
            }
        } catch (error) {
            console.error("Delete error:", error);
            setShowDeleteModal(false);
            showAlert("Error", "An unexpected error occurred");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#333" />
                </TouchableOpacity>
                <Subheading style={styles.headerTitle}>All Pins</Subheading>
                <TouchableOpacity onPress={toggleSelectMode} style={styles.selectButton}>
                    <BodyText style={styles.selectButtonText}>
                        {isSelectMode ? "Cancel" : "Select"}
                    </BodyText>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.gridContent} showsVerticalScrollIndicator={false}>
                <View style={styles.grid}>
                    {pins.length > 0 ? (
                        pins.map((pin) => (
                            <TouchableOpacity
                                key={pin._id}
                                style={[
                                    styles.pinCard,
                                    isSelectMode && selectedPins.includes(pin._id) && styles.selectedPinCard
                                ]}
                                onPress={() => handleSelectPin(pin._id)}
                            >
                                <Image source={{ uri: pin.images[0]?.url }} style={styles.pinImage} />
                                {isSelectMode && (
                                    <View style={styles.checkboxContainer}>
                                        <Ionicons
                                            name={selectedPins.includes(pin._id) ? "checkmark-circle" : "ellipse-outline"}
                                            size={24}
                                            color={selectedPins.includes(pin._id) ? "#D14D72" : "#FFF"}
                                        />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))
                    ) : (
                        !loading && <BodyText style={styles.emptyText}>No pins found.</BodyText>
                    )}
                </View>
            </ScrollView>

            {/* Custom Delete Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showDeleteModal}
                onRequestClose={() => setShowDeleteModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalIconContainer}>
                            <Ionicons name="trash-outline" size={48} color="#FF4D4D" />
                        </View>
                        <Subheading style={styles.modalTitle}>Delete Pins?</Subheading>
                        <BodyText style={styles.modalMessage}>
                            Are you sure you want to delete {selectedPins.length} {selectedPins.length === 1 ? 'pin' : 'pins'}?
                            {'\n'}This action cannot be undone.
                        </BodyText>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowDeleteModal(false)}
                            >
                                <BodyText style={styles.cancelButtonText}>Cancel</BodyText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.deleteButtonModal}
                                onPress={deleteSelectedPins}
                            >
                                <BodyText style={styles.deleteButtonTextModal}>Delete</BodyText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            {isSelectMode && selectedPins.length > 0 && (
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.deleteButton} onPress={confirmDelete}>
                        <Ionicons name="trash-outline" size={20} color="#FFF" />
                        <Subheading style={styles.deleteButtonText}>Delete ({selectedPins.length})</Subheading>
                    </TouchableOpacity>
                </View>
            )}

            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                onClose={hideAlert}
                onConfirm={() => {
                    hideAlert();
                    if (alertConfig.onConfirm) alertConfig.onConfirm();
                }}
                singleButton={alertConfig.singleButton}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF5F7',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0E0F0',
        backgroundColor: '#FFF'
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        color: '#333',
    },
    selectButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: '#F0E0F0',
        borderRadius: 15,
    },
    selectButtonText: {
        color: '#D14D72',
        fontSize: 14,
        fontWeight: '600',
    },
    gridContent: {
        padding: 12,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    pinCard: {
        width: (width - 24) / 3, // 3 columns, no gap
        aspectRatio: 1,
        backgroundColor: '#FFF',
        position: 'relative',
    },
    selectedPinCard: {
        opacity: 0.7,
    },
    pinImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    checkboxContainer: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 12,
    },
    emptyText: {
        textAlign: 'center',
        width: '100%',
        marginTop: 40,
        color: '#999',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0E0F0',
        alignItems: 'center',
    },
    deleteButton: {
        flexDirection: 'row',
        backgroundColor: '#FF4D4D',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        alignItems: 'center',
        gap: 8,
    },
    deleteButtonText: {
        color: '#FFF',
        fontSize: 16,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 30,
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    modalIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFE5E5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 22,
        color: '#333',
        marginBottom: 12,
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: '#F0E0F0',
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    deleteButtonModal: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: '#FF4D4D',
        borderRadius: 12,
        alignItems: 'center',
    },
    deleteButtonTextModal: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
