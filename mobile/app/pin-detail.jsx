import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TextInput, KeyboardAvoidingView, Platform, Text, Modal, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Subheading, BodyText } from './components/CustomText';
import { ActivityIndicator } from 'react-native';
import { API_BASE_URL } from './config';
import { useUser } from './context/UserContext';
import CustomAlert from './components/CustomAlert';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';

const { width } = Dimensions.get('window');

// Simple Toast Component
const CustomToast = ({ visible, message }) => {
    if (!visible) return null;
    return (
        <View style={styles.toastContainer}>
            <View style={styles.toastContent}>
                <Ionicons name="checkmark-circle" size={24} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.toastText}>{message}</Text>
            </View>
        </View>
    );
};

export default function PinDetail() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const { token, userProfile } = useUser(); // Get token/user
    const { MOCK_PINS } = require('./data/pins'); // Keep for fallback if needed, or remove.

    // State
    const [pin, setPin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isHearted, setIsHearted] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Comments State
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    // Toast State
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Save Modal State
    const [saveModalVisible, setSaveModalVisible] = useState(false);
    const [userBoards, setUserBoards] = useState([]);
    const [newBoardName, setNewBoardName] = useState('');
    const [creatingBoard, setCreatingBoard] = useState(false);

    // Custom Alert State
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', onConfirm: null, singleButton: true });

    const showAlert = (title, message, onConfirm = null) => {
        setAlertConfig({ visible: true, title, message, onConfirm, singleButton: true });
    };

    const hideAlert = () => {
        setAlertConfig(prev => ({ ...prev, visible: false }));
    };

    // Fetch Pin Details
    useEffect(() => {
        const fetchPinDetails = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/pins/${params.id}`);
                const data = await response.json();

                if (response.ok) {
                    // Decide which user to show as author
                    let authorName = "Unknown";
                    let authorAvatar = "https://api.dicebear.com/9.x/pixel-art/png?seed=user";

                    if (data.isUnsplash) {
                        authorName = data.userId?.fullName || data.userId?.username || "Unsplash User";
                        authorAvatar = data.userId?.profileImage || authorAvatar;
                    } else if (data.isSaved && data.originalAuthor) {
                        authorName = data.originalAuthor.username || "Unknown";
                        authorAvatar = data.originalAuthor.profileImage || authorAvatar;
                    } else {
                        authorName = data.userId?.username || "Unknown";
                        authorAvatar = data.userId?.profileImage || authorAvatar;
                    }

                    // Transform backend data to UI format
                    setPin({
                        ...data,
                        id: data._id,
                        image: { uri: data.images[0]?.url },
                        user: {
                            name: authorName,
                            avatar: { uri: authorAvatar }
                        },
                        description: (data.title === data.description || !data.description)
                            ? (data.title || "Inspiration")
                            : `${data.title}\n\n${data.description}`,
                    });

                    // Format comments for UI
                    const formattedComments = (data.comments || []).map(c => {
                        let pfp = c.userId?.profileImage || `https://api.dicebear.com/9.x/pixel-art/png?seed=${c.userId?.username || 'user'}`;
                        if (pfp.includes("api.dicebear.com") && pfp.includes("/svg")) {
                            pfp = pfp.replace("/svg", "/png");
                        }
                        return {
                            id: c._id,
                            text: c.text,
                            user: {
                                name: c.userId?.username || 'Unknown',
                                avatar: { uri: pfp }
                            },
                            timestamp: new Date(c.createdAt)
                        };
                    }).reverse(); // Newest first

                    setComments(formattedComments);

                } else {
                    // Fallback to mock data
                    const mockPin = MOCK_PINS.find(p => p.id.toString() === params.id);
                    if (mockPin) setPin(mockPin);
                }
            } catch (error) {
                console.error("Error fetching pin:", error);
                const mockPin = MOCK_PINS.find(p => p.id.toString() === params.id);
                if (mockPin) setPin(mockPin);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchPinDetails();
        }
    }, [params.id, token]);


    const copyToLink = async () => {
        await Clipboard.setStringAsync(`https://innerglow.app/pin/${pin?.id}`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    };

    const handleDownload = async () => {
        if (!pin?.image?.uri) return;

        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                showAlert('Permission Required', 'Permission to access media library is required to download images.');
                return;
            }

            const fileUri = FileSystem.documentDirectory + (pin.id || 'download') + '.jpg';
            const { uri } = await FileSystem.downloadAsync(pin.image.uri, fileUri);
            await MediaLibrary.createAssetAsync(uri);

            setToastMessage("Image saved to gallery!");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2000);

        } catch (error) {
            console.error("Download error:", error);
            showAlert("Error", "Failed to download image.");
        }
    };

    const handleSendComment = async () => {
        if (!newComment.trim()) return;

        try {
            const res = await fetch(`${API_BASE_URL}/pins/${params.id}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    text: newComment.trim(),
                    unsplashData: pin.isUnsplash ? {
                        title: pin.title,
                        description: pin.description,
                        images: pin.images,
                        board: pin.board
                    } : null
                })
            });

            if (res.ok) {
                const updatedComments = await res.json();

                // Format for UI
                const formatted = updatedComments.map(c => {
                    let pfp = c.userId?.profileImage || `https://api.dicebear.com/9.x/pixel-art/png?seed=${c.userId?.username || 'user'}`;
                    if (pfp.includes("api.dicebear.com") && pfp.includes("/svg")) {
                        pfp = pfp.replace("/svg", "/png");
                    }
                    return {
                        id: c._id,
                        text: c.text,
                        user: {
                            name: c.userId?.username || 'Unknown',
                            avatar: { uri: pfp }
                        },
                        timestamp: new Date(c.createdAt)
                    };
                }).reverse();

                setComments(formatted);
                setNewComment('');
            } else {
                const err = await res.json();
                showAlert("Error", err.message || "Failed to post comment");
            }
        } catch (error) {
            console.error("Comment error:", error);
            showAlert("Error", "Could not connect to server");
        }
    };

    const fetchUserBoards = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/pins/user-boards`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUserBoards(data);
            }
        } catch (error) {
            console.error("Error fetching boards:", error);
        }
    };

    const openSaveModal = () => {
        if (!token) {
            showAlert("Login Required", "Please login to save pins.");
            return;
        }
        fetchUserBoards();
        setSaveModalVisible(true);
    };

    const handleSavePin = async (boardName, createNew = false) => {
        try {
            const res = await fetch(`${API_BASE_URL}/pins/save/${pin.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    boardName: boardName,
                    createNewBoard: createNew
                })
            });

            if (res.ok) {
                setIsSaved(true);
                setSaveModalVisible(false);
                setNewBoardName('');
                setCreatingBoard(false);
                setToastMessage(`Saved to ${boardName}!`);
                setShowToast(true);
                setTimeout(() => setShowToast(false), 2000);
            } else {
                const err = await res.json();
                showAlert("Error", err.message || "Failed to save pin");
            }
        } catch (error) {
            console.error("Save error:", error);
            showAlert("Error", "An unexpected error occurred");
        }
    };

    const handleDeleteComment = (commentId) => {
        setComments(comments.filter(c => c.id !== commentId));
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.mainContainerWrapper}>
                <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color="#D14D72" />
                </View>
            </SafeAreaView>
        );
    }

    if (!pin) {
        return (
            <SafeAreaView style={styles.mainContainerWrapper}>
                <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center' }]}>
                    <BodyText>Pin not found.</BodyText>
                    <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                        <Subheading style={{ color: "#D14D72" }}>Go Back</Subheading>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.mainContainerWrapper} edges={['top']}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.mainContainer}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="chevron-back" size={32} color="#000" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        {/* Main Image */}
                        <View style={styles.imageContainer}>
                            <Image source={pin.image} style={styles.mainImage} resizeMode="contain" />
                        </View>

                        {/* Info Section */}
                        <View style={styles.infoContainer}>

                            {/* Actions Row */}
                            <View style={styles.actionsRow}>
                                <View style={styles.leftActions}>
                                    <TouchableOpacity onPress={() => setIsHearted(!isHearted)}>
                                        <Ionicons
                                            name={isHearted ? "heart" : "heart-outline"}
                                            size={32}
                                            color={isHearted ? "#D14D72" : "#333"}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.iconButton} onPress={handleDownload}>
                                        <Ionicons name="download-outline" size={30} color="#333" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.iconButton} onPress={copyToLink}>
                                        <Ionicons name="share-social-outline" size={30} color="#333" />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    style={[styles.saveButton, isSaved && styles.savedButton]}
                                    onPress={openSaveModal}
                                >
                                    <BodyText style={[styles.saveButtonText, isSaved && styles.savedButtonText]}>
                                        {isSaved ? "Saved" : "Save"}
                                    </BodyText>
                                </TouchableOpacity>
                            </View>

                            {/* User Info */}
                            <View style={styles.userRow}>
                                <Image source={pin.user.avatar} style={styles.avatar} />
                                <View style={styles.userInfo}>
                                    <Subheading style={styles.username}>{pin.user.name}</Subheading>
                                </View>
                            </View>

                            {/* Caption */}
                            {pin.description && (
                                <BodyText style={styles.caption}>{pin.description}</BodyText>
                            )}

                            {/* Comments Section */}
                            <View style={styles.commentSection}>
                                <Subheading style={styles.commentsTitle}>Comments</Subheading>

                                {/* Input */}
                                <View style={styles.commentInputRow}>
                                    <Image
                                        source={{ uri: userProfile?.avatar?.uri || `https://api.dicebear.com/9.x/pixel-art/png?seed=${userProfile?.username || 'user'}` }}
                                        style={styles.currentUserAvatar}
                                    />
                                    <View style={styles.inputWrapper}>
                                        <TextInput
                                            placeholder="Add a comment"
                                            style={styles.commentInput}
                                            placeholderTextColor="#999"
                                            value={newComment}
                                            onChangeText={setNewComment}
                                            onSubmitEditing={handleSendComment}
                                        />
                                        <TouchableOpacity onPress={handleSendComment} disabled={!newComment.trim()}>
                                            <Ionicons name="send" size={24} color={newComment.trim() ? "#FFABAB" : "#ccc"} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Comments List */}
                                {comments.length === 0 ? (
                                    <BodyText style={styles.noComments}>No comments yet. Be the first to share your thoughts!</BodyText>
                                ) : (
                                    comments.map((comment) => (
                                        <View key={comment.id} style={styles.commentItem}>
                                            <Image source={comment.user.avatar} style={styles.commentAvatar} />
                                            <View style={styles.commentContent}>
                                                <View style={styles.commentHeader}>
                                                    <Subheading style={styles.commentAuthor}>{comment.user.name}</Subheading>
                                                    {/* Allow deleting "your" comments (mock logic: all comments for now) */}
                                                    <TouchableOpacity onPress={() => handleDeleteComment(comment.id)}>
                                                        <Ionicons name="trash-outline" size={16} color="#999" />
                                                    </TouchableOpacity>
                                                </View>
                                                <BodyText style={styles.commentText}>{comment.text}</BodyText>
                                            </View>
                                        </View>
                                    ))
                                )}
                            </View>

                        </View>
                    </ScrollView>

                    <CustomToast visible={showToast} message={toastMessage || "Link copied to clipboard!"} />

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

                    {/* Save Modal */}
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={saveModalVisible}
                        onRequestClose={() => setSaveModalVisible(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Subheading style={styles.modalTitle}>Save to Board</Subheading>
                                    <TouchableOpacity onPress={() => setSaveModalVisible(false)}>
                                        <Ionicons name="close" size={24} color="#333" />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView style={styles.boardList} contentContainerStyle={{ paddingBottom: 20 }}>
                                    <TouchableOpacity
                                        style={styles.createBoardItem}
                                        onPress={() => setCreatingBoard(!creatingBoard)}
                                    >
                                        <View style={styles.createIcon}>
                                            <Ionicons name="add" size={24} color="#FFF" />
                                        </View>
                                        <BodyText style={styles.createBoardText}>Create new board</BodyText>
                                    </TouchableOpacity>

                                    {creatingBoard && (
                                        <View style={styles.newBoardInputContainer}>
                                            <TextInput
                                                style={styles.newBoardInput}
                                                placeholder="Board Name (e.g., Summer Outfit)"
                                                value={newBoardName}
                                                onChangeText={setNewBoardName}
                                                autoFocus
                                            />
                                            <TouchableOpacity
                                                style={[styles.createBtnSmall, !newBoardName.trim() && { opacity: 0.5 }]}
                                                onPress={() => handleSavePin(newBoardName, true)}
                                                disabled={!newBoardName.trim()}
                                            >
                                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Create</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}

                                    {userBoards.map((board) => (
                                        <TouchableOpacity
                                            key={board._id}
                                            style={styles.boardItem}
                                            onPress={() => handleSavePin(board.name, false)}
                                        >
                                            {board.coverImage ? (
                                                <Image source={{ uri: board.coverImage }} style={styles.boardThumb} />
                                            ) : (
                                                <View style={[styles.boardThumb, { backgroundColor: '#eee' }]} />
                                            )}
                                            <BodyText style={styles.boardName}>{board.name}</BodyText>
                                            {board.isPrivate && <Ionicons name="lock-closed" size={14} color="#666" style={{ marginLeft: 8 }} />}
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>
                    </Modal>

                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    mainContainerWrapper: {
        flex: 1,
        backgroundColor: '#FEF2F4',
    },
    mainContainer: {
        flex: 1,
        backgroundColor: '#FEF2F4',
    },
    header: {
        position: 'absolute',
        top: 10, // Adjusted relative to header containing view
        left: 20,
        zIndex: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    scrollContent: {
        paddingTop: 0,
        paddingBottom: 40,
    },
    imageContainer: {
        width: '100%',
        backgroundColor: '#f9f9f9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainImage: {
        width: width,
        height: 500,
        backgroundColor: '#f9f9f9',
    },
    infoContainer: {
        padding: 20,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -20,
        backgroundColor: '#FEF2F4',
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10,
    },
    leftActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    iconButton: {
        // padding: 5,
    },
    saveButton: {
        backgroundColor: '#FFABAB',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
    },
    savedButton: {
        backgroundColor: '#D14D72',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    savedButtonText: {
        color: '#fff',
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: '#eee',
    },
    currentUserAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 10,
    },
    userInfo: {
        justifyContent: 'center',
    },
    username: {
        fontSize: 16,
        color: '#000',
    },
    caption: {
        fontSize: 14,
        color: '#333',
        lineHeight: 22,
        marginBottom: 30,
    },
    commentSection: {
        borderTopWidth: 1,
        borderTopColor: '#e0d0d5',
        paddingTop: 20,
    },
    commentsTitle: {
        fontSize: 18,
        color: '#333',
        marginBottom: 15,
    },
    commentInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#FFABAB',
    },
    commentInput: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        marginRight: 10,
    },
    noComments: {
        fontStyle: 'italic',
        color: '#999',
        textAlign: 'center',
        marginTop: 10,
    },
    commentItem: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    commentAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 10,
    },
    commentContent: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 10,
        borderBottomLeftRadius: 2,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    commentAuthor: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    commentText: {
        fontSize: 14,
        color: '#444',
    },
    toastContainer: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 100,
    },
    toastContent: {
        backgroundColor: '#D14D72', // Using app primary color
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    toastText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '60%',
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        color: '#333',
    },
    boardList: {
        flex: 1,
    },
    createBoardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        marginBottom: 10,
    },
    createIcon: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: '#FFABAB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    createBoardText: {
        fontSize: 16,
        color: '#333',
        fontWeight: 'bold',
    },
    newBoardInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        gap: 10,
    },
    newBoardInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
    },
    createBtnSmall: {
        backgroundColor: '#D14D72',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    boardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    boardThumb: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 15,
    },
    boardName: {
        fontSize: 16,
        color: '#333',
    },
});
