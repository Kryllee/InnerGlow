import { useState, useEffect } from "react"
import { View, Text, TextInput, Image, ScrollView, TouchableOpacity, StyleSheet, Modal, KeyboardAvoidingView, Platform, Dimensions, ActivityIndicator, Switch } from "react-native"
import { FontAwesome5, Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { API_BASE_URL } from "../config"
import { useUser } from "../context/UserContext"

const { width } = Dimensions.get("window")

export default function PinCreator({ media = [], onClose }) {
  const { token } = useUser();

  // State Management
  const [images, setImages] = useState(media)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  // Board Management
  const [boards, setBoards] = useState([])
  const [selectedBoard, setSelectedBoard] = useState(null)

  // Modal & Loading
  const [showNewBoardModal, setShowNewBoardModal] = useState(false)
  const [newBoardName, setNewBoardName] = useState("")
  const [isPrivateBoard, setIsPrivateBoard] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch Boards on Mount
  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/pins/boards`);
        if (res.ok) {
          const data = await res.json();
          setBoards(data);
          if (data.length > 0 && !selectedBoard) {
            setSelectedBoard(data[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching boards:", err);
      }
    };
    fetchBoards();
  }, []);

  const canPost = images.length > 0 && selectedBoard

  // --- Handlers ---

  const handlePost = async () => {
    if (!canPost) return
    setIsLoading(true)

    try {
      // Loop through media to upload and create separate pins for EACH image
      for (const img of images) {

        // 1. Upload Image
        const formData = new FormData();
        formData.append('image', {
          uri: img.uri,
          type: 'image/jpeg', // Assuming jpeg for simplicity
          name: 'pin_image.jpg',
        });

        const uploadResponse = await fetch(`${API_BASE_URL}/pins/upload-image`, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (!uploadResponse.ok) {
          const err = await uploadResponse.text();
          throw new Error("Failed to upload image: " + err);
        }

        const uploadData = await uploadResponse.json();
        const uploadedImageUrl = uploadData.imageUrl;

        // 2. Create Pin for this specific image
        const pinData = {
          title, // Same title for all
          description, // Same description for all
          board: selectedBoard,
          images: [{ url: uploadedImageUrl }], // Single image per pin
          isPrivate: isPrivateBoard
        };

        const response = await fetch(`${API_BASE_URL}/pins/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(pinData)
        });

        if (!response.ok) {
          const err = await response.text();
          throw new Error("Failed to create pin: " + err);
        }
      }

      // Success after loop completes
      if (onClose) onClose();

    } catch (error) {
      console.error("Error creating pin:", error);
      alert("Failed to create pin(s). Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddBoard = () => {
    if (!newBoardName.trim()) return
    const name = newBoardName.trim();
    // Assuming unique check is simple string matching from current list
    if (!boards.includes(name)) {
      setBoards([name, ...boards])
      setSelectedBoard(name)
    } else {
      setSelectedBoard(name)
    }
    setNewBoardName("")
    // Keep isPrivate state? Or reset? Resetting is safer.
    // Actually wait, if I select a board, I need to know if it's private or public to send to backend?
    // The backend `createPin` endpoint handles looking up the board.
    // If I create a NEW board here (frontend only lists names), I need to ensure backend knows it's private.
    // My previous edit to `pinData` passed `isPrivate: isPrivateBoard`. 
    // BUT `isPrivateBoard` is only set in the modal. If I select an EXISTING board, I don't validly know its privacy here.
    // However, backend `createPin` says: if board exists, use its privacy. If new, use passed privacy.
    // So this is correct: pass `isPrivateBoard`. If user selects existing, backend ignores it. If user types new name (via modal), backend uses it.
    // One edge case: User types name in modal that already exists? Frontend `handleAddBoard` selects it. `isPrivateBoard` is lingering in state. 
    // Backend will ignore `isPrivate` if board exists. Perfect.
    // Reset private state after adding
    setIsPrivateBoard(false)
    setShowNewBoardModal(false)
  }

  const handleAddMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
      allowsMultipleSelection: true,
    })
    if (!result.canceled) {
      setImages([...images, ...result.assets])
    }
  }

  const handleRemoveMedia = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove))
  }

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* --- HEADER --- */}
      <View style={s.header}>
        <TouchableOpacity style={s.closeButton} onPress={onClose}>
          <FontAwesome5 name="times" size={20} color="#666" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Create Pin</Text>
        <TouchableOpacity
          style={[s.saveButton, { backgroundColor: canPost ? "#D14D72" : "#E8D5E8" }]}
          onPress={handlePost}
          disabled={!canPost || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={s.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>

        {/* --- MEDIA SECTION --- */}
        <Text style={s.sectionTitle}>Gallery</Text>
        <View style={s.mediaContainer}>
          {images.length === 0 ? (
            <TouchableOpacity style={s.emptyStateBox} onPress={handleAddMedia}>
              <View style={s.uploadCircle}>
                <FontAwesome5 name="image" size={24} color="#D14D72" />
              </View>
              <Text style={s.uploadText}>Pick photos</Text>
            </TouchableOpacity>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.carouselContent}>
              {images.map((img, index) => (
                <View key={index} style={s.imageCard}>
                  <Image source={{ uri: img.uri }} style={s.cardImage} />
                  <TouchableOpacity style={s.deleteButton} onPress={() => handleRemoveMedia(index)}>
                    <FontAwesome5 name="times" size={12} color="#FFF" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={s.addMoreCard} onPress={handleAddMedia}>
                <FontAwesome5 name="plus" size={24} color="#D14D72" />
                <Text style={s.addMoreText}>Add</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>

        {/* --- DETAILS SECTION --- */}
        <Text style={s.sectionTitle}>Details</Text>
        <View style={s.inputContainer}>
          <Text style={s.inputLabel}>Title</Text>
          <TextInput
            style={s.textInput}
            placeholder="Give your pin a title"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={s.inputLabel}>Description</Text>
          <TextInput
            style={[s.textInput, s.textArea]}
            placeholder="What is this pin about?"
            placeholderTextColor="#999"
            multiline
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
        </View>

        {/* --- BOARD SECTION --- */}
        <View style={s.boardHeaderRow}>
          <Text style={s.sectionTitle}>Select Board</Text>
          <TouchableOpacity onPress={() => setShowNewBoardModal(true)}>
            <Text style={s.createBoardText}>+ Create New</Text>
          </TouchableOpacity>
        </View>

        <View style={s.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.boardScroll}>
            {boards.map((item) => (
              <TouchableOpacity
                key={item}
                style={selectedBoard === item ? s.tabButtonActive : s.tabButton}
                onPress={() => setSelectedBoard(item)}
              >
                <Text style={selectedBoard === item ? s.tabLabelActive : s.tabLabel}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Spacer for bottom scrolling */}
        <View style={{ height: 50 }} />
      </ScrollView>


      {/* --- MODAL --- */}
      <Modal
        transparent
        visible={showNewBoardModal}
        animationType="fade"
        onRequestClose={() => setShowNewBoardModal(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>New Board</Text>
              <TouchableOpacity onPress={() => setShowNewBoardModal(false)}>
                <FontAwesome5 name="times" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={s.modalInput}
              placeholder='e.g., "Outfits"'
              value={newBoardName}
              onChangeText={setNewBoardName}
              autoFocus
            />

            <View style={s.privacyRow}>
              <View>
                <Text style={s.privacyTitle}>Private Board</Text>
                <Text style={s.privacySubtitle}>Only you can see this board</Text>
              </View>
              <Switch
                value={isPrivateBoard}
                onValueChange={setIsPrivateBoard}
                trackColor={{ false: "#e0e0e0", true: "#FFB6C1" }}
                thumbColor={isPrivateBoard ? "#D14D72" : "#f4f3f4"}
              />
            </View>

            <TouchableOpacity
              style={[s.modalButton, { backgroundColor: newBoardName.trim() ? "#D14D72" : "#E8D5E8" }]}
              onPress={handleAddBoard}
              disabled={!newBoardName.trim()}
            >
              <Text style={s.modalButtonText}>Create Board</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  container: { // Main container
    flex: 1,
    backgroundColor: "#FFF5F7",
  },
  header: { // Top navigation
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0E0F0",
    backgroundColor: "#FFF5F7",
  },
  headerTitle: { // Header text
    fontSize: 18,
    color: "#333",
    fontWeight: "600",
  },
  closeButton: { // Close icon area
    padding: 8,
  },
  saveButton: { // Save action button
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonText: { // Save button text
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  scrollContent: { // Scrollview body
    paddingTop: 20,
  },
  sectionTitle: { // Section headers
    fontSize: 18,
    color: "#333",
    marginBottom: 12,
    marginHorizontal: 16,
    fontWeight: "600",
  },

  // --- Media Styles ---
  mediaContainer: { // Media wrapper
    marginBottom: 24,
  },
  carouselContent: { // Horizontal scroll content
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  emptyStateBox: { // Empty placeholder
    marginHorizontal: 16,
    height: 200,
    backgroundColor: "#FFF",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FFB6C1",
    borderStyle: "dashed",
  },
  uploadCircle: { // Icon circle
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFE8F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  uploadText: { // Upload label
    fontSize: 16,
    color: "#D14D72",
    fontWeight: "500",
  },
  imageCard: { // Individual image container
    width: width * 0.7,
    height: 300,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  cardImage: { // The image itself
    width: "100%",
    height: "100%",
    borderRadius: 12,
    resizeMode: "cover",
  },
  deleteButton: { // X button on image
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  addMoreCard: { // + button at end of list
    width: 80,
    height: 300,
    borderRadius: 12,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FFB6C1",
    marginRight: 16,
  },
  addMoreText: { // + button text
    color: "#D14D72",
    marginTop: 8,
    fontWeight: "600",
  },

  // --- Input Styles ---
  inputContainer: { // Inputs wrapper
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputLabel: { // Label above inputs
    fontSize: 14,
    color: "#999",
    marginBottom: 8,
  },
  textInput: { // Standard input
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: "#333",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F0E0F0",
  },
  textArea: { // Description area
    minHeight: 100,
  },

  // --- Board Styles ---
  boardHeaderRow: { // Row with Create New button
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16,
    marginBottom: 10,
  },
  createBoardText: { // + Create text
    color: "#D14D72",
    fontSize: 14,
    fontWeight: "600",
  },
  tabsContainer: { // Board pills wrapper
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  boardScroll: { // Horizontal scroll
    paddingBottom: 10,
  },
  tabButton: { // Inactive board pill
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#F0E0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonActive: { // Active board pill
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#D14D72",
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#D14D72",
    shadowColor: "#D14D72",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  tabLabel: { // Inactive text
    fontSize: 14,
    color: "#666",
  },
  tabLabelActive: { // Active text
    fontSize: 14,
    color: "#FFF",
    fontWeight: "600",
  },

  // --- Modal Styles ---
  modalOverlay: { // Modal background
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: { // Modal card
    backgroundColor: "#FFF",
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  modalHeader: { // Modal top row
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { // Modal title
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  modalInput: { // Modal input
    backgroundColor: "#F9F9F9",
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#F0E0F0",
  },
  modalButton: { // Create button
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  modalButtonText: { // Button text
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  privacyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  privacyTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600'
  },
  privacySubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2
  }
})