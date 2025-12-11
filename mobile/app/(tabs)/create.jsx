import { View, StyleSheet, TextInput, TouchableOpacity, ImageBackground, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Subheading, BodyText } from '../components/CustomText';
import { Audio } from 'expo-av';
import { useJournal } from '../context/JournalContext';
import { API_BASE_URL } from '../config';

const Create = ({ onClose }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [thoughts, setThoughts] = useState('');
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const { addEntry } = useJournal();

  const handleVoiceInput = async () => {
    try {
      if (isRecording) {
        // Stop recording
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setAudioUri(uri);
        setRecording(null);
        setIsRecording(false);
        Alert.alert('Success', 'Voice recording saved!');
      } else {
        // Request permission
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Please allow microphone access to record audio.');
          return;
        }

        // Start recording
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(newRecording);
        setIsRecording(true);
      }
    } catch (error) {
      console.error('Failed to record audio:', error);
      Alert.alert('Error', 'Failed to record audio');
    }
  };

  const togglePreview = async () => {
    try {
      if (!audioUri) return;

      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioUri },
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
      console.error('Failed to play audio:', error);
      Alert.alert('Error', 'Failed to play audio preview');
    }
  };

  const handleSave = async () => {
    if (!date || !time) {
      Alert.alert('Required', 'Please fill in date and time');
      return;
    }

    if (!thoughts && !audioUri) {
      Alert.alert('Required', 'Please write your thoughts or record a voice note');
      return;
    }

    try {
      let uploadedAudioUrl = null;

      // Upload audio if exists
      if (audioUri) {
        const formData = new FormData();
        formData.append('audio', {
          uri: audioUri,
          type: 'audio/m4a',
          name: 'recording.m4a',
        });

        const uploadResponse = await fetch(`${API_BASE_URL}/entries/upload-audio`, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const uploadData = await uploadResponse.json();
        uploadedAudioUrl = uploadData.audioUrl;
        console.log('Audio uploaded successfully:', uploadedAudioUrl);
      }

      // Save entry
      console.log('Saving entry with audio:', uploadedAudioUrl);
      await addEntry(thoughts, uploadedAudioUrl);

      Alert.alert('Success', 'Journal entry saved!');
      setDate('');
      setTime('');
      setThoughts('');
      setAudioUri(null);
      if (onClose) onClose();
    } catch (error) {
      console.error('Failed to save entry:', error);
      Alert.alert('Error', 'Failed to save journal entry');
    }
  };

  const handleCancel = () => {
    setDate('');
    setTime('');
    setThoughts('');
    setAudioUri(null);
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
          <TouchableOpacity
            style={[styles.voiceButton, isRecording && styles.voiceButtonRecording]}
            onPress={handleVoiceInput}
          >
            <Ionicons name={isRecording ? "stop-circle" : "mic"} size={20} color={isRecording ? "#FFF" : "#000"} />
            <BodyText style={[styles.voiceButtonText, isRecording && styles.voiceButtonTextRecording]}>
              {isRecording ? 'Stop Recording' : audioUri ? 'Voice Saved ✓' : 'Use Voice Input'}
            </BodyText>
          </TouchableOpacity>

          {audioUri && !isRecording && (
            <TouchableOpacity style={styles.previewButton} onPress={togglePreview}>
              <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={20} color="#D14D72" />
              <BodyText style={styles.previewButtonText}>
                {isPlaying ? 'Pause Preview' : 'Preview Recording'}
              </BodyText>
            </TouchableOpacity>
          )}

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
  voiceButtonRecording: {
    backgroundColor: '#D14D72',
  },
  voiceButtonTextRecording: {
    color: '#FFF',
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
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
    borderWidth: 2,
    borderColor: '#D14D72',
  },
  previewButtonText: {
    fontSize: 16,
    color: '#D14D72',
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
});

export default Create;