import { View, StyleSheet, TextInput, TouchableOpacity, ImageBackground, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Subheading, BodyText } from '../components/CustomText';

const Create = ({ onClose }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [thoughts, setThoughts] = useState('');

  const handleVoiceInput = () => {
    Alert.alert('Coming Soon', 'Voice input feature is coming soon!');
  };

  const handleSave = () => {
    if (!date || !time || !thoughts) {
      Alert.alert('Required', 'Please fill in all fields');
      return;
    }
    Alert.alert('Success', 'Journal entry saved!');
    setDate('');
    setTime('');
    setThoughts('');
    if (onClose) onClose();
  };

  const handleCancel = () => {
    setDate('');
    setTime('');
    setThoughts('');
    if (onClose) onClose();
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ImageBackground source={require('../(tabs)/assets/images/flower.png')} style={styles.backgroundImage} resizeMode="cover">
        <View style={styles.overlay} />
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <BodyText style={styles.cancelText}>Cancel</BodyText>
          </TouchableOpacity>
          <View style={styles.section}>
            <Subheading style={styles.sectionTitle}>Date and Time</Subheading>
            <View style={styles.dateTimeRow}>
              <TextInput placeholder="MM/DD/YEAR" placeholderTextColor="#999" style={styles.dateInput} value={date} onChangeText={setDate} />
              <TextInput placeholder="Time" placeholderTextColor="#999" style={styles.timeInput} value={time} onChangeText={setTime} />
            </View>
          </View>
          <View style={styles.section}>
            <Subheading style={styles.sectionTitle}>Your Thoughts</Subheading>
            <TextInput placeholder="Write about your day, your feelings, or anything on your mind..." placeholderTextColor="#999" style={styles.thoughtsInput} multiline={true} numberOfLines={8} textAlignVertical="top" value={thoughts} onChangeText={setThoughts} />
          </View>
          <TouchableOpacity style={styles.voiceButton} onPress={handleVoiceInput}>
            <Ionicons name="mic" size={20} color="#000" />
            <BodyText style={styles.voiceButtonText}>Use Voice Input</BodyText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Subheading style={styles.saveButtonText}>Save Journal Entry</Subheading>
          </TouchableOpacity>
        </ScrollView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { // Main container
    flex: 1,
    backgroundColor: '#FCC8D1',
  },
  backgroundImage: { // Background image
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: { // Pink overlay
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(252, 200, 209, 0.3)',
  },
  scrollContent: { // Scrollable content
    flexGrow: 1,
    padding: 20,
    paddingTop: 50,
  },
  cancelButton: { // Cancel button
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  cancelText: { // Cancel text
    fontSize: 16,
    color: '#000',
  },
  section: { // Section container
    marginBottom: 30,
  },
  sectionTitle: { // Section title
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  dateTimeRow: { // Date/time row
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  dateInput: { // Date input
    flex: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#000',
  },
  timeInput: { // Time input
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#000',
  },
  thoughtsInput: { // Thoughts text area
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#000',
    minHeight: 150,
  },
  voiceButton: { // Voice button
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  voiceButtonText: { // Voice button text
    fontSize: 16,
    color: '#000',
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

export default Create;