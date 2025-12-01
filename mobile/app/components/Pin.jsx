// components/Pin.jsx
import React, { useState } from "react";
import { 
  View, Text, TextInput, Image, ScrollView, 
  TouchableOpacity, StyleSheet, Alert, Modal 
} from "react-native";
import * as ImagePicker from "expo-image-picker";

// Default boards
const defaultBoards = ["Travel", "Food", "Quotes"];

export default function Pin({ media = [], onClose }) {
  const [title, setTitle] = useState("");          
  const [description, setDescription] = useState(""); 
  const [boards, setBoards] = useState(defaultBoards);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [pinMedia, setPinMedia] = useState(media);

  // New Board modal
  const [showNewBoardModal, setShowNewBoardModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");

  // Post pin
  const handlePost = () => {
    if (!title.trim()) {
      Alert.alert("Title required", "Please add a title for your pin.");
      return;
    }
    if (!selectedBoard) {
      Alert.alert("Board required", "Please select or create a board.");
      return;
    }
    Alert.alert(
      "Success",
      `Your pin has been posted to "${selectedBoard}" board!`
    );
    setTitle(""); 
    setDescription(""); 
    setSelectedBoard(null); 
    setPinMedia([]);
    if (onClose) onClose();
  };

  // Add new board
  const handleAddBoard = () => {
    if (!newBoardName.trim()) return;
    if (!boards.includes(newBoardName)) setBoards([...boards, newBoardName]);
    setSelectedBoard(newBoardName);
    setNewBoardName("");
    setShowNewBoardModal(false);
  };

  // Add photo
  const handleAddMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled) setPinMedia([...pinMedia, ...result.assets]);
  };

  // Remove photo
  const handleRemoveMedia = (index) => {
    const newMedia = [...pinMedia];
    newMedia.splice(index, 1);
    setPinMedia(newMedia);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Close button */}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Create Pin</Text>

      {/* Pin Title */}
      <TextInput
        style={styles.titleInput}
        placeholder="Add your pin title..."
        placeholderTextColor="#777"
        value={title}
        onChangeText={setTitle}
      />

      {/* Board selection */}
      <Text style={styles.sectionLabel}>Select Board</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
        {boards.slice(0, 3).map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.boardButton,
              selectedBoard === item && styles.boardSelected
            ]}
            onPress={() => setSelectedBoard(item)}
          >
            <Text
              style={[
                styles.boardButtonText,
                selectedBoard === item && styles.boardButtonTextSelected
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
        {/* + button for new board */}
        <TouchableOpacity
          style={styles.boardButton}
          onPress={() => setShowNewBoardModal(true)}
        >
          <Text style={styles.boardButtonText}>+</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Selected Media */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaScroll}>
        {pinMedia.map((item, index) => (
          <View key={index} style={{ marginRight: 10, position: "relative" }}>
            <Image source={{ uri: item.uri }} style={styles.mediaPreview} />
            <TouchableOpacity
              style={styles.removeMediaButton}
              onPress={() => handleRemoveMedia(index)}
            >
              <Text style={styles.removeMediaText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Add photo */}
        <TouchableOpacity style={styles.addMediaButton} onPress={handleAddMedia}>
          <Text style={styles.addMediaText}>+</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Pin Description */}
      <TextInput
        style={styles.descriptionInput}
        placeholder="Add a description..."
        placeholderTextColor="#777"
        multiline
        value={description}
        onChangeText={setDescription}
      />

      {/* Post Button */}
      <TouchableOpacity style={styles.postButton} onPress={handlePost}>
        <Text style={styles.postButtonText}>Save Pin</Text>
      </TouchableOpacity>

      {/* New Board Modal */}
      <Modal
        transparent
        visible={showNewBoardModal}
        animationType="slide"
        onRequestClose={() => setShowNewBoardModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Board</Text>
            <TextInput
              style={styles.newBoardInput}
              placeholder="Board name"
              placeholderTextColor="#777"
              value={newBoardName}
              onChangeText={setNewBoardName}
            />
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#D14D72" }]}
                onPress={handleAddBoard}
              >
                <Text style={styles.modalButtonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#999" }]}
                onPress={() => setShowNewBoardModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 20, 
    backgroundColor: "#FEF2F4", 
    flexGrow: 1 
  },

  closeButton: { 
    position: "absolute", 
    top: 16, 
    right: 15, 
    zIndex: 1 
  },
  closeText: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: "#000" 
  },
  header: { 
    fontSize: 24, 
    fontWeight: "bold", 
    textAlign: "center", 
    marginBottom: 20 
  },

  titleInput: { 
    backgroundColor: "#fff", 
    padding: 15, 
    borderRadius: 10, 
    fontSize: 16, 
    marginBottom: 15, 
    color: "#000" 
  },
  sectionLabel: { 
    fontSize: 16, 
    fontWeight: "600", 
    marginBottom: 10, 
    color: "#333" 
  },
  descriptionInput: { 
    backgroundColor: "#fff", 
    padding: 15, 
    borderRadius: 10, 
    minHeight: 100, 
    fontSize: 16, 
    textAlignVertical: "top", 
    color: "#000" 
  },

  boardButton: {
    width: 80,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f2f2f2",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  boardSelected: { backgroundColor: "#D14D72" },
  boardButtonText: { color: "#333", fontWeight: "500" },
  boardButtonTextSelected: { color: "#fff", fontWeight: "700" },

  mediaScroll: { flexDirection: "row",
    marginTop: -190,
  },
  mediaPreview: { width: 120, height: 120, borderRadius: 10 },
  removeMediaButton: {
    position: "absolute",
    top: 1,
    right: -5,
    backgroundColor: "#D14D72",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  removeMediaText: { color: "#fff", fontWeight: "bold" },
  addMediaButton: {
    width: 120,
    height: 120,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D14D72",
    justifyContent: "center",
    alignItems: "center",
  },
  addMediaText: { color: "#D14D72", fontSize: 24, fontWeight: "bold" },

  postButton: { 
    backgroundColor: "#D14D72", 
    paddingVertical: 15, 
    borderRadius: 20, 
    marginTop: 25, 
    alignItems: "center" 
  },
  postButtonText: { 
    color: "#fff", 
    fontSize: 18, 
    fontWeight: "bold" 
  },

  modalOverlay: { 
    flex: 1, 
    backgroundColor: "rgba(0,0,0,0.5)", 
    justifyContent: "center", 
    alignItems: "center" 
  },
  modalContent: { 
    backgroundColor: "#fff", 
    padding: 20, 
    width: "80%", 
    borderRadius: 15 
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: "bold", 
    marginBottom: 15, 
    textAlign: "center" 
  },
  newBoardInput: { 
    backgroundColor: "#f2f2f2", 
    padding: 10, 
    borderRadius: 10, 
    marginBottom: 15 
  },
  modalButton: { 
    flex: 1, 
    padding: 12, 
    borderRadius: 10, 
    marginHorizontal: 5, 
    alignItems: "center" 
  },
  modalButtonText: { 
    color: "#fff", 
    fontWeight: "bold" 
  },
});
