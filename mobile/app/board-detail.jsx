import { View, StyleSheet, TouchableOpacity, Image, ScrollView, Modal, ActivityIndicator, Switch, TouchableWithoutFeedback } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect, useCallback } from "react";
import { Subheading, BodyText } from './components/CustomText';
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useUser } from "./context/UserContext";
import { API_BASE_URL } from "./config";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { BlurView } from 'expo-blur';
import CustomAlert from "./components/CustomAlert";

export default function BoardDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { token } = useUser();

    const [board, setBoard] = useState(null);
    const [pins, setPins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [menuVisible, setMenuVisible] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedPins, setSelectedPins] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Custom Alert State
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', onConfirm: null, singleButton: true, confirmText: 'Confirm' });

    const showAlert = (title, message, onConfirm = null, singleButton = true, confirmText = 'Confirm') => {
        setAlertConfig({ visible: true, title, message, onConfirm, singleButton, confirmText });
    };

    const hideAlert = () => {
        setAlertConfig(prev => ({ ...prev, visible: false }));
    };

    // Fetch Board Details
    const fetchDetails = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/pins/boards/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setBoard(data.board);
                setPins(data.pins);
            } else {
                showAlert("Error", "Could not load board.", () => router.back());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (id && token) fetchDetails();
        }, [id, token])
    );

    const toggleSelectMode = () => {
        setIsSelectMode(!isSelectMode);
        setSelectedPins([]);
        setMenuVisible(false);
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

    const confirmDeletePins = () => {
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

    // Masonry Layout Helper
    const splitPins = (allPins) => {
        const left = [];
        const right = [];
        allPins.forEach((pin, index) => {
            if (index % 2 === 0) left.push(pin);
            else right.push(pin);
        });
        return { left, right };
    };
    const { left, right } = splitPins(pins);

    // Handle Privacy Toggle
    const togglePrivacy = async () => {
        setProcessing(true);
        try {
            const newPrivacy = !board.isPrivate;
            const res = await fetch(`${API_BASE_URL}/pins/boards/${id}`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isPrivate: newPrivacy })
            });

            if (res.ok) {
                setBoard(prev => ({ ...prev, isPrivate: newPrivacy }));
                showAlert("Success", `Board is now ${newPrivacy ? 'Private' : 'Public'}`);
            } else {
                showAlert("Error", "Failed to update privacy.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setProcessing(false);
            setMenuVisible(false);
        }
    };

    // Handle Board Delete
    const handleDelete = () => {
        setMenuVisible(false);
        showAlert(
            "Delete Board",
            "Are you sure? This will delete the board and all pins inside it.",
            async () => {
                try {
                    const res = await fetch(`${API_BASE_URL}/pins/boards/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        router.replace("/(tabs)/profile");
                    } else {
                        showAlert("Error", "Failed to delete board.");
                    }
                } catch (error) {
                    showAlert("Error", error.message);
                }
            },
            false,
            "Delete"
        );
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#D14D72" style={{ flex: 1, backgroundColor: "#FFF5F7" }} />;
    }

    return (
        <SafeAreaView style={s.container}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#333" />
                </TouchableOpacity>

                <View style={s.headerTitleContainer}>
                    <Subheading style={s.headerTitle}>{board?.name}</Subheading>
                    {board?.isPrivate && <FontAwesome5 name="lock" size={14} color="#666" style={{ marginLeft: 6 }} />}
                </View>

                <TouchableOpacity onPress={() => setMenuVisible(true)} style={s.menuButton}>
                    <Ionicons name="ellipsis-horizontal" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Pins Grid */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
                {pins.length > 0 ? (
                    <View style={s.grid}>
                        <View style={s.column}>
                            {left.map(pin => (
                                <TouchableOpacity
                                    key={pin._id}
                                    style={[
                                        s.pinCard,
                                        isSelectMode && selectedPins.includes(pin._id) && s.selectedPinCard
                                    ]}
                                    onPress={() => handleSelectPin(pin._id)}
                                >
                                    <Image source={{ uri: pin.images[0]?.url }} style={[s.pinImage, { height: pin.images[0]?.height || 200 }]} />
                                    {pin.title ? <BodyText style={s.pinTitle} numberOfLines={1}>{pin.title}</BodyText> : null}
                                    {isSelectMode && (
                                        <View style={s.checkboxContainer}>
                                            <Ionicons
                                                name={selectedPins.includes(pin._id) ? "checkmark-circle" : "ellipse-outline"}
                                                size={24}
                                                color={selectedPins.includes(pin._id) ? "#D14D72" : "#FFF"}
                                            />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={s.column}>
                            {right.map(pin => (
                                <TouchableOpacity
                                    key={pin._id}
                                    style={[
                                        s.pinCard,
                                        isSelectMode && selectedPins.includes(pin._id) && s.selectedPinCard
                                    ]}
                                    onPress={() => handleSelectPin(pin._id)}
                                >
                                    <Image source={{ uri: pin.images[0]?.url }} style={[s.pinImage, { height: pin.images[0]?.height || 200 }]} />
                                    {pin.title ? <BodyText style={s.pinTitle} numberOfLines={1}>{pin.title}</BodyText> : null}
                                    {isSelectMode && (
                                        <View style={s.checkboxContainer}>
                                            <Ionicons
                                                name={selectedPins.includes(pin._id) ? "checkmark-circle" : "ellipse-outline"}
                                                size={24}
                                                color={selectedPins.includes(pin._id) ? "#D14D72" : "#FFF"}
                                            />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ) : (
                    <BodyText style={s.emptyText}>No pins in this board yet.</BodyText>
                )}
            </ScrollView>

            <Modal transparent visible={menuVisible} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
                <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
                    <TouchableWithoutFeedback>
                        <View style={s.menuContainer}>
                            <TouchableOpacity style={s.menuItem} onPress={toggleSelectMode}>
                                <View style={s.menuItemLeft}>
                                    <FontAwesome5 name="check-square" size={18} color="#333" style={s.menuIcon} />
                                    <BodyText style={s.menuText}>{isSelectMode ? "Cancel Selection" : "Select Pins"}</BodyText>
                                </View>
                            </TouchableOpacity>

                            <View style={s.menuSeparator} />

                            <TouchableOpacity style={s.menuItem} onPress={togglePrivacy}>
                                <View style={s.menuItemLeft}>
                                    <FontAwesome5 name={board.isPrivate ? "globe" : "lock"} size={18} color="#333" style={s.menuIcon} />
                                    <BodyText style={s.menuText}>Make {board.isPrivate ? "Public" : "Private"}</BodyText>
                                </View>
                                {processing && <ActivityIndicator size="small" color="#D14D72" />}
                            </TouchableOpacity>

                            <View style={s.menuSeparator} />

                            <TouchableOpacity style={s.menuItem} onPress={handleDelete}>
                                <View style={s.menuItemLeft}>
                                    <FontAwesome5 name="trash-alt" size={18} color="#FF6B6B" style={s.menuIcon} />
                                    <BodyText style={s.menuTextRed}>Delete Board</BodyText>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>

            {/* Delete Pins Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showDeleteModal}
                onRequestClose={() => setShowDeleteModal(false)}
            >
                <View style={s.deleteModalOverlay}>
                    <View style={s.deleteModalContent}>
                        <View style={s.deleteModalIconContainer}>
                            <Ionicons name="trash-outline" size={48} color="#FF4D4D" />
                        </View>
                        <Subheading style={s.deleteModalTitle}>Delete Pins?</Subheading>
                        <BodyText style={s.deleteModalMessage}>
                            Are you sure you want to delete {selectedPins.length} {selectedPins.length === 1 ? 'pin' : 'pins'}?
                            {'\n'}This action cannot be undone.
                        </BodyText>
                        <View style={s.deleteModalButtons}>
                            <TouchableOpacity
                                style={s.cancelDeleteButton}
                                onPress={() => setShowDeleteModal(false)}
                            >
                                <BodyText style={s.cancelDeleteButtonText}>Cancel</BodyText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={s.confirmDeleteButton}
                                onPress={deleteSelectedPins}
                            >
                                <BodyText style={s.confirmDeleteButtonText}>Delete</BodyText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Delete Footer */}
            {isSelectMode && selectedPins.length > 0 && (
                <View style={s.deleteFooter}>
                    <TouchableOpacity style={s.deleteFooterButton} onPress={confirmDeletePins}>
                        <Ionicons name="trash-outline" size={20} color="#FFF" />
                        <Subheading style={s.deleteFooterButtonText}>Delete ({selectedPins.length})</Subheading>
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
                confirmText={alertConfig.confirmText}
            />
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF5F7",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 10, // Adjusted for SafeAreaView
        paddingBottom: 16,
        backgroundColor: "#FFF",
        borderBottomWidth: 1,
        borderBottomColor: "#F0E0F0"
    },
    backButton: {
        width: 40,
        alignItems: 'flex-start'
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    headerTitle: {
        fontSize: 18,
        color: "#333",
    },
    menuButton: {
        width: 40,
        alignItems: 'flex-end'
    },
    content: {
        padding: 12,
    },
    grid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    column: {
        width: '48%',
        gap: 12
    },
    pinCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 8
    },
    pinImage: {
        width: '100%',
        borderRadius: 16,
        resizeMode: 'cover'
    },
    pinTitle: {
        padding: 8,
        fontSize: 12,
        color: '#333'
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 100,
        color: '#999'
    },
    modalOverlay: { // Modal styling
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    menuContainer: {
        width: 250,
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 10
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        justifyContent: 'space-between',
        width: '100%'
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIcon: {
        width: 30,
        textAlign: 'center',
        marginRight: 10
    },
    menuSeparator: {
        height: 1,
        backgroundColor: '#F0E0F0',
    },
    menuText: {
        fontSize: 16,
        color: '#333',
    },
    menuTextRed: {
        fontSize: 16,
        color: '#FF6B6B',
    },
    selectedPinCard: {
        opacity: 0.7,
    },
    checkboxContainer: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 12,
    },
    deleteFooter: {
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
    deleteFooterButton: {
        flexDirection: 'row',
        backgroundColor: '#FF4D4D',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        alignItems: 'center',
        gap: 8,
    },
    deleteFooterButtonText: {
        color: '#FFF',
        fontSize: 16,
    },
    deleteModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    deleteModalContent: {
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
    deleteModalIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFE5E5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    deleteModalTitle: {
        fontSize: 22,
        color: '#333',
        marginBottom: 12,
        textAlign: 'center',
    },
    deleteModalMessage: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    deleteModalButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    cancelDeleteButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: '#F0E0F0',
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelDeleteButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    confirmDeleteButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: '#FF4D4D',
        borderRadius: 12,
        alignItems: 'center',
    },
    confirmDeleteButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    }
});
