import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions, SafeAreaView, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Subheading, BodyText } from './components/CustomText';

const { width } = Dimensions.get('window');

export default function PinDetail() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const { MOCK_PINS } = require('./data/pins');

    const pin = MOCK_PINS.find(p => p.id.toString() === params.id) || MOCK_PINS[0];

    const [isHearted, setIsHearted] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    return (
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
                            <TouchableOpacity style={styles.iconButton}>
                                <Ionicons name="share-social-outline" size={30} color="#333" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton}>
                                <Ionicons name="ellipsis-horizontal" size={30} color="#333" />
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

                        {/* Mock Input */}
                        <View style={styles.commentInputRow}>
                            <Image source={require('./(tabs)/assets/images/id1.png')} style={styles.currentUserAvatar} />
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    placeholder="Add a comment"
                                    style={styles.commentInput}
                                    placeholderTextColor="#999"
                                />
                            </View>
                        </View>

                        <BodyText style={styles.noComments}>No comments yet. Be the first to share your thoughts!</BodyText>
                    </View>

                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#FEF2F4', // User requested Global Background match
    },
    header: {
        position: 'absolute',
        top: 50,
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
        backgroundColor: '#FEF2F4', // Match background
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
        backgroundColor: '#FFABAB', // User requested Default
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
    },
    savedButton: {
        backgroundColor: '#D14D72', // User requested Clicked
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
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#FFABAB',
    },
    commentInput: {
        fontSize: 14,
        color: '#333',
    },
    noComments: {
        fontStyle: 'italic',
        color: '#999',
        textAlign: 'center',
        marginTop: 10,
    },
});
