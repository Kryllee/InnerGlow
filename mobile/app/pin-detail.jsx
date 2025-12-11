import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TextInput, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Subheading, BodyText } from './components/CustomText';

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

    const { MOCK_PINS } = require('./data/pins');

    // Find the pin directly from the reference to allow mutation for session persistence
    const pin = MOCK_PINS.find(p => p.id.toString() === params.id) || MOCK_PINS[0];

    const [isHearted, setIsHearted] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Comments State
    const [comments, setComments] = useState(pin.comments || []);
    const [newComment, setNewComment] = useState('');

    // Toast State
    const [showToast, setShowToast] = useState(false);

    const copyToLink = async () => {
        await Clipboard.setStringAsync(`https://innerglow.app/pin/${pin.id}`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    };

    const handleSendComment = () => {
        if (!newComment.trim()) return;

        const commentObj = {
            id: Date.now(),
            text: newComment.trim(),
            user: { name: 'You', avatar: { uri: `https://api.dicebear.com/9.x/pixel-art/png?seed=xdrea` } }, // Mock current user with API
            timestamp: new Date(),
        };

        // Mutate the mock data for session persistence
        pin.comments.unshift(commentObj);

        // Update local state
        setComments([...pin.comments]);
        setNewComment('');
    };

    const handleDeleteComment = (commentId) => {
        const index = pin.comments.findIndex(c => c.id === commentId);
        if (index > -1) {
            pin.comments.splice(index, 1);
            setComments([...pin.comments]);
        }
    };

    return (
        <SafeAreaView style={styles.mainContainerWrapper}>
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
                                    <TouchableOpacity style={styles.iconButton} onPress={copyToLink}>
                                        <Ionicons name="share-social-outline" size={30} color="#333" />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    style={[styles.saveButton, isSaved && styles.savedButton]}
                                    onPress={() => setIsSaved(!isSaved)}
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
                                    <Image source={{ uri: `https://api.dicebear.com/9.x/pixel-art/png?seed=xdrea` }} style={styles.currentUserAvatar} />
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

                    <CustomToast visible={showToast} message="Link copied to clipboard!" />
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
});
