import { View, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Subheading, BodyText } from '../components/CustomText';
import CustomAlert from '../components/CustomAlert';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL } from '../config';

import { useJournal } from '../context/JournalContext';

const Gratitude = ({ onClose }) => {
    const [gratitudeItems, setGratitudeItems] = useState(['', '', '']);
    const { addGratitude } = useJournal();

    // Image State
    const [imageUri, setImageUri] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // Custom Alert State
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', onConfirm: null, singleButton: true });

    const showAlert = (title, message, onConfirm = null) => {
        setAlertConfig({ visible: true, title, message, onConfirm, singleButton: true });
    };

    const hideAlert = () => {
        setAlertConfig(prev => ({ ...prev, visible: false }));
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            showAlert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleAddAnother = () => {
        setGratitudeItems([...gratitudeItems, '']);
    };

    const handleItemChange = (text, index) => {
        const newItems = [...gratitudeItems];
        newItems[index] = text;
        setGratitudeItems(newItems);
    };

    const handleDeleteItem = (index) => {
        if (gratitudeItems.length > 3) {
            const newItems = gratitudeItems.filter((item, i) => i !== index);
            setGratitudeItems(newItems);
        } else {
            showAlert('Minimum Required', 'You must have at least 3 gratitude items');
        }
    };

    const handleSave = async () => {
        const filledItems = gratitudeItems.filter(item => item.trim() !== '');
        if (filledItems.length < 3) {
            showAlert('Required', 'Please list at least 3 things you are grateful for');
            return;
        }

        setIsUploading(true);

        try {
            let uploadedImageUrl = null;

            if (imageUri) {
                const formData = new FormData();
                formData.append('image', {
                    uri: imageUri,
                    type: 'image/jpeg',
                    name: 'photo.jpg',
                });

                const uploadResponse = await fetch(`${API_BASE_URL}/entries/upload-image`, {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadResponse.ok) {
                    throw new Error("Failed to upload image");
                }

                const uploadData = await uploadResponse.json();
                uploadedImageUrl = uploadData.imageUrl;
            }

            await addGratitude(filledItems, uploadedImageUrl);

            showAlert('Success', 'Gratitude list saved!', () => {
                setGratitudeItems(['', '', '']);
                setImageUri(null);
                if (onClose) onClose();
            });
        } catch (error) {
            console.error("Failed to save gratitude:", error);
            showAlert('Error', 'Failed to save gratitude list: ' + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleCancel = () => {
        setGratitudeItems(['', '', '']);
        setImageUri(null);
        if (onClose) onClose();
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                    <BodyText style={styles.cancelText}>Cancel</BodyText>
                </TouchableOpacity>

                <Subheading style={styles.title}>What are you grateful for today?</Subheading>
                <BodyText style={styles.subtitle}>List at least 3 things</BodyText>

                {gratitudeItems.map((item, index) => (
                    <View key={index} style={styles.inputRow}>
                        <View style={styles.bulletPoint} />
                        <TextInput
                            placeholder={`Gratitude ${index + 1}`}
                            placeholderTextColor="#999"
                            style={styles.input}
                            value={item}
                            onChangeText={(text) => handleItemChange(text, index)}
                        />
                        {gratitudeItems.length > 3 && (
                            <TouchableOpacity onPress={() => handleDeleteItem(index)} style={styles.deleteButton}>
                                <Ionicons name="close-circle" size={20} color="#999" />
                            </TouchableOpacity>
                        )}
                    </View>
                ))}

                <TouchableOpacity style={styles.addButton} onPress={handleAddAnother}>
                    <Ionicons name="add" size={20} color="#000" />
                    <BodyText style={styles.addButtonText}>Add Another</BodyText>
                </TouchableOpacity>

                {/* Photo Button */}
                <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
                    <Ionicons name="image" size={20} color="#000" />
                    <BodyText style={styles.mediaButtonText}>{imageUri ? 'Photo Added ✓' : 'Add Photo'}</BodyText>
                </TouchableOpacity>

                {/* Image Preview */}
                {imageUri && (
                    <View style={styles.imagePreviewContainer}>
                        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                        <TouchableOpacity style={styles.removeImageButton} onPress={() => setImageUri(null)}>
                            <Ionicons name="close-circle" size={24} color="#D14D72" />
                        </TouchableOpacity>
                    </View>
                )}

                <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isUploading}>
                    {isUploading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Subheading style={styles.saveButtonText}>Save Gratitude List</Subheading>
                    )}
                </TouchableOpacity>
            </ScrollView>

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
        </View>
    );
};

const styles = StyleSheet.create({
    container: { // Main container
        flex: 1,
        backgroundColor: '#FEF2F4',
    },
    scrollContent: { // Scrollable content
        flexGrow: 1,
        padding: 20,
        paddingTop: 50,
    },
    cancelButton: { // Cancel button
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 10,
    },
    cancelText: { // Cancel text
        fontSize: 16,
        color: '#000',
    },
    checkButton: { // Check button (top right)
        position: 'absolute',
        top: 20,
        right: 80,
        width: 40,
        height: 40,
        borderWidth: 2,
        borderColor: '#000',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    title: { // Main title
        fontSize: 18,
        color: '#999',
        marginBottom: 5,
        marginTop: 20,
    },
    subtitle: { // Subtitle
        fontSize: 14,
        color: '#999',
        marginBottom: 30,
    },
    inputRow: { // Input row with bullet
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    bulletPoint: { // Bullet point (circle)
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#999',
        marginRight: 12,
    },
    input: { // Text input
        flex: 1,
        backgroundColor: '#FFF',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 14,
        color: '#000',
        borderWidth: 1,
        borderColor: '#F0E0F0',
    },
    deleteButton: { // Delete button
        marginLeft: 8,
        padding: 4,
    },
    addButton: { // Add another button
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginTop: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F0E0F0',
    },
    addButtonText: { // Add button text
        fontSize: 14,
        color: '#000',
        marginLeft: 5,
    },
    saveButton: { // Save button
        backgroundColor: '#FCC8D1',
        borderRadius: 25,
        paddingVertical: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        marginBottom: 30,
    },
    saveButtonText: { // Save button text
        fontSize: 16,
        color: '#FFFFFF',
    },
    mediaButton: { // Photo button
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginBottom: 15,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F0E0F0',
    },
    mediaButtonText: {
        fontSize: 14,
        color: '#000',
    },
    imagePreviewContainer: {
        marginBottom: 20,
        alignItems: 'center',
        position: 'relative',
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: 15,
    },
    removeImageButton: {
        position: 'absolute',
        top: -10,
        right: -10,
        backgroundColor: '#fff',
        borderRadius: 15,
    },
});

export default Gratitude;
