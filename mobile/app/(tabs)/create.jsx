import { View, StyleSheet, TextInput, TouchableOpacity, ImageBackground, ScrollView, KeyboardAvoidingView, Platform, Text, Image, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Subheading, BodyText } from '../components/CustomText';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { useJournal } from '../context/JournalContext';
import { API_BASE_URL } from '../config';
import CustomAlert from '../components/CustomAlert';

const Create = ({ onClose }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [thoughts, setThoughts] = useState('');

  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Image State
  const [imageUri, setImageUri] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const { addEntry } = useJournal();

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

  const handleVoiceInput = async () => {
    try {
      if (isRecording) {
        // Stop recording
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setAudioUri(uri);
        setRecording(null);
        setIsRecording(false);
        showAlert('Success', 'Voice recording saved!');
      } else {
        // Request permission
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          showAlert('Permission Required', 'Please allow microphone access to record audio.');
          return;
        }

        // Start recording
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(newRecording);
        setIsRecording(true);
      }
    } catch (error) {
      console.error('Failed to record audio:', error);
      showAlert('Error', 'Failed to record audio');
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
      showAlert('Error', 'Failed to play audio preview');
    }
  };

  const handleSave = async () => {
    // 1. Validate Date
    const dateRegex1 = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/; // MM/DD/YYYY
    const dateRegex2 = /^(January|February|March|April|May|June|July|August|September|October|November|December)\s(0?[1-9]|[12][0-9]|3[01]),\s\d{4}$/; // Month DD, YYYY

    if (!date) {
      showAlert('Required', 'Please fill in the date.');
      return;
    }

    if (!dateRegex1.test(date) && !dateRegex2.test(date)) {
      showAlert('Invalid Date Format', 'Please use one of these formats:\n- MM/DD/YYYY (e.g. 12/17/2025)\n- Month DD, YYYY (e.g. December 17, 2025)');
      return;
    }

    // 2. Validate Time
    const timeRegex = /^((1[0-2]|0?[1-9]):([0-5][0-9]) ?([AaPp][Mm]))$/; // 8:00 AM or 12:16 AM

    if (!time) {
      showAlert('Required', 'Please fill in the time.');
      return;
    }

    if (!timeRegex.test(time)) {
      showAlert('Invalid Time Format', 'Please use HH:MM AM/PM format (e.g. 8:00 AM).');
      return;
    }

    if (!thoughts && !audioUri && !imageUri) {
      showAlert('Required', 'Please write thoughts, record audio, or add a photo.');
      return;
    }

    setIsUploading(true);

    try {
      let uploadedAudioUrl = null;
      let uploadedImageUrl = null;

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
        });

        const uploadData = await uploadResponse.json();
        uploadedAudioUrl = uploadData.audioUrl;
      }

      // Upload image if exists
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

      // Save entry
      await addEntry(thoughts, uploadedAudioUrl, uploadedImageUrl);

      showAlert('Success', 'Journal entry saved!', () => {
        resetForm();
        if (onClose) onClose();
      });
    } catch (error) {
      console.error('Failed to save entry:', error);
      showAlert('Error', 'Failed to save journal entry: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setDate('');
    setTime('');
    setThoughts('');
    setAudioUri(null);
    setImageUri(null);
  };

  const handleCancel = () => {
    resetForm();
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

          {/* Media Buttons Row */}
          <View style={styles.mediaButtonsRow}>
            <TouchableOpacity
              style={[styles.voiceButton, isRecording && styles.voiceButtonRecording]}
              onPress={handleVoiceInput}
            >
              <Ionicons name={isRecording ? "stop-circle" : "mic"} size={20} color={isRecording ? "#FFF" : "#000"} />
              <BodyText style={[styles.voiceButtonText, isRecording && styles.voiceButtonTextRecording]}>
                {isRecording ? 'Stop' : audioUri ? 'Recorded ✓' : 'Voice'}
              </BodyText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
              <Ionicons name="image" size={20} color="#000" />
              <BodyText style={styles.mediaButtonText}>{imageUri ? 'Photo Added ✓' : 'Add Photo'}</BodyText>
            </TouchableOpacity>
          </View>

          {/* Previews */}
          {audioUri && !isRecording && (
            <TouchableOpacity style={styles.previewButton} onPress={togglePreview}>
              <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={20} color="#D14D72" />
              <BodyText style={styles.previewButtonText}>
                {isPlaying ? 'Pause Preview' : 'Preview Recording'}
              </BodyText>
            </TouchableOpacity>
          )}

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
              <Subheading style={styles.saveButtonText}>
                Save Journal Entry
              </Subheading>
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
    marginBottom: 10,
  },
  cancelText: { // Cancel text
    fontSize: 16,
    color: '#000',
  },
  // Tab Styles removed

  section: { // Section container
    marginBottom: 30,
  },
  sectionTitle: { // Section title
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  helperText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 15,
    fontStyle: 'italic'
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
  // Gratitude Styles removed
  mediaButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 15,
    marginBottom: 15,
  },
  voiceButton: { // Voice button
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 15,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  mediaButton: { // Photo button
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 15,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  mediaButtonText: {
    fontSize: 14,
    color: '#000',
  },
  voiceButtonText: { // Voice button text
    fontSize: 14,
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