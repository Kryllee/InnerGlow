import { View, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Subheading, BodyText } from '../components/CustomText';

const Gratitude = ({ onClose }) => {
    const [gratitudeItems, setGratitudeItems] = useState(['', '', '']);

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
            Alert.alert('Minimum Required', 'You must have at least 3 gratitude items');
        }
    };

    const handleSave = () => {
        const filledItems = gratitudeItems.filter(item => item.trim() !== '');
        if (filledItems.length < 3) {
            Alert.alert('Required', 'Please list at least 3 things you are grateful for');
            return;
        }
        Alert.alert('Success', 'Gratitude list saved!');
        setGratitudeItems(['', '', '']);
        if (onClose) onClose();
    };

    const handleCancel = () => {
        setGratitudeItems(['', '', '']);
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

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Subheading style={styles.saveButtonText}>Save Gratitude List</Subheading>
                </TouchableOpacity>
            </ScrollView>
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
        color: '#000',
    },
});

export default Gratitude;
