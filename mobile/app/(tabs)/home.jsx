import { View, StyleSheet, TouchableOpacity, Image, ScrollView, Modal, Text, RefreshControl, ActivityIndicator, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect, useCallback } from "react";
import { BlurView } from 'expo-blur';
import { Subheading, BodyText } from '../components/CustomText';
import { useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useUser } from "../context/UserContext";
import { API_BASE_URL } from "../config";

// Simple Masonry Helper
const splitPins = (pins) => {
    const left = [];
    const right = [];
    pins.forEach((pin, index) => {
        if (index % 2 === 0) left.push(pin);
        else right.push(pin);
    });
    return { left, right };
};

const Home = () => {
    const { board } = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState("forYou"); // Default to forYou now that it includes discovery
    const [showPopup, setShowPopup] = useState(false);
    const router = useRouter();

    // Initialize tab from params if provided
    useEffect(() => {
        if (board) {
            setActiveTab(board);
        }
    }, [board]);

    const { userProfile, token } = useUser();

    // Data State
    const [pins, setPins] = useState([]);
    const [boards, setBoards] = useState([]); // List of available boards
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch Boards
    const fetchBoards = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/pins/user-boards`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setBoards(data);
            }
        } catch (err) {
            console.error("Error fetching boards:", err);
        }
    };

    // Fetch Pins
    const fetchPins = async () => {
        try {
            let url = `${API_BASE_URL}/pins`;
            if (activeTab === 'forYou') {
                url = `${API_BASE_URL}/pins/for-you`;
            } else {
                url += `?board=${encodeURIComponent(activeTab)}&userId=${userProfile?._id || ''}`;
            }

            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();

            if (res.ok) {
                const seenIds = new Set();
                const screenWidth = Dimensions.get('window').width;
                const formatted = data.filter(p => {
                    const id = p._id || p.id;
                    if (seenIds.has(id)) return false;
                    seenIds.add(id);
                    return true;
                }).map(p => {
                    const img = p.images[0] || {};
                    const aspectRatio = img.height && img.width ? img.height / img.width : (1 + Math.random());
                    return {
                        id: p._id || p.id,
                        image: { uri: img.url },
                        description: p.title,
                        height: Math.min(aspectRatio * (screenWidth / 2 - 20), 400),
                        user: p.userId,
                        isUnsplash: p.isUnsplash || p._id?.startsWith('unsplash-')
                    };
                });

                // Shuffle for "For You" feed randomization
                if (activeTab === 'forYou') {
                    for (let i = formatted.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [formatted[i], formatted[j]] = [formatted[j], formatted[i]];
                    }
                }

                setPins(formatted);
            }
        } catch (err) {
            console.error("Error fetching pins:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchBoards();
    }, []);

    useEffect(() => {
        fetchPins();
    }, [activeTab]);

    // Refresh when looking at screen
    useFocusEffect(
        useCallback(() => {
            fetchBoards(); // Update boards list too
            fetchPins();
        }, [activeTab])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchBoards();
        fetchPins();
    };

    // Split pins for masonry layout
    const { left, right } = splitPins(pins);

    // Initial Popup Logic
    useEffect(() => {
        const timer = setTimeout(() => setShowPopup(true), 500);
        return () => clearTimeout(timer);
    }, []);

    const handleLogMood = async (mood) => {
        setShowPopup(false);
        try {
            if (token && userProfile && userProfile._id) {
                await fetch(`${API_BASE_URL}/mood`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        userId: userProfile._id,
                        mood: mood,
                        date: new Date().toISOString().split('T')[0]
                    })
                });
            }
        } catch (error) {
            console.log("Error logging mood:", error);
        }
    };

    const isForYouActive = activeTab === "forYou";

    const renderPin = (pin) => (
        <TouchableOpacity
            key={pin.id}
            style={styles.pinCard}
            onPress={() => router.push({ pathname: '/pin-detail', params: { id: pin.id } })}
        >
            <Image source={pin.image} style={[styles.image, { height: pin.height }]} />
            {pin.description && (
                <BodyText style={styles.pinCaption} numberOfLines={2}>{pin.description}</BodyText>
            )}
            {pin.user && (
                <View style={styles.userRow}>
                    <Image source={{ uri: pin.user.profileImage }} style={styles.userAvatar} />
                    <BodyText style={styles.userName} numberOfLines={1}>{pin.user.username}</BodyText>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.tabBarWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBar}>
                    <TouchableOpacity onPress={() => setActiveTab("forYou")}>
                        <Subheading style={activeTab === "forYou" ? styles.activeTabText : styles.tabText}>For you</Subheading>
                    </TouchableOpacity>

                    {boards.map(board => (
                        <TouchableOpacity key={board._id} onPress={() => setActiveTab(board.name)}>
                            <Subheading style={activeTab === board.name ? styles.activeTabText : styles.tabText}>{board.name}</Subheading>
                        </TouchableOpacity>
                    ))}

                    {/* Fallback if no boards yet */}
                    {boards.length === 0 && (
                        <TouchableOpacity onPress={() => setActiveTab("My Board")}>
                            <Subheading style={activeTab === "My Board" ? styles.activeTabText : styles.tabText}>My Board</Subheading>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </View>

            <View style={styles.content}>
                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color="#d14d72" style={{ marginTop: 50 }} />
                ) : (
                    <ScrollView
                        contentContainerStyle={styles.gridContainer}
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    >
                        {pins.length > 0 ? (
                            <View style={styles.grid}>
                                <View style={styles.column}>
                                    {left.map(pin => renderPin(pin))}
                                </View>
                                <View style={styles.column}>
                                    {right.map(pin => renderPin(pin))}
                                </View>
                            </View>
                        ) : (
                            <BodyText style={styles.boardText}>
                                {activeTab === 'forYou' ? "No pins found." : "No pins in this board yet."} {"\n"}
                                <Text style={{ color: '#d14d72' }}>Create one to get started!</Text>
                            </BodyText>
                        )}
                    </ScrollView>
                )}
            </View>

            <Modal transparent={true} visible={showPopup} animationType="fade">
                <View style={styles.overlay}>
                    <BlurView intensity={5} style={styles.blurView}>
                        <View style={styles.blurFallback} />
                    </BlurView>
                    <View style={styles.popup}>
                        <View style={styles.titleBox}>
                            <Subheading style={styles.popupTitle}>Quick Mood Check-in</Subheading>
                        </View>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setShowPopup(false)}>
                            <BodyText style={styles.closeButtonText}>✕</BodyText>
                        </TouchableOpacity>
                        <View style={styles.moodRow}>
                            <TouchableOpacity style={styles.moodItem} onPress={() => handleLogMood("Great")}>
                                <Image source={require("../(tabs)/assets/images/Great Emote.png")} style={styles.moodIcon} />
                                <BodyText style={styles.moodLabel}>Great</BodyText>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.moodItem} onPress={() => handleLogMood("Good")}>
                                <Image source={require("../(tabs)/assets/images/good emote.png")} style={styles.moodIcon} />
                                <BodyText style={styles.moodLabel}>Good</BodyText>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.moodItem} onPress={() => handleLogMood("Okay")}>
                                <Image source={require("../(tabs)/assets/images/okay emote.png")} style={styles.moodIcon} />
                                <BodyText style={styles.moodLabel}>Okay</BodyText>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.moodItem} onPress={() => handleLogMood("Low")}>
                                <Image source={require("../(tabs)/assets/images/low emote.png")} style={styles.moodIcon} />
                                <BodyText style={styles.moodLabel}>Low</BodyText>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.moodItem} onPress={() => handleLogMood("Struggling")}>
                                <Image source={require("../(tabs)/assets/images/struggling emote.png")} style={styles.moodIcon} />
                                <BodyText style={styles.moodLabel}>Struggling</BodyText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { // Main container
        flex: 1,
        backgroundColor: "#fef2f4",
    },
    tabBarWrapper: {
        height: 60,
    },
    tabBar: { // Tab bar
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        backgroundColor: "#fef2f4",
        gap: 20,
    },
    tabText: { // Inactive tab
        fontSize: 16,
        color: "#999",
    },
    activeTabText: { // Active tab
        fontSize: 16,
        color: "#d14d72",
        borderBottomWidth: 2,
        borderBottomColor: "#d14d72",
        paddingBottom: 5,
    },
    content: { // Content area
        flex: 1,
        backgroundColor: "#fef2f4",
    },
    gridContainer: { // Grid padding
        padding: 10,
    },
    grid: { // Grid layout
        flexDirection: "row",
        justifyContent: "space-between",
    },
    column: { // Column
        flex: 1,
        marginHorizontal: 5,
    },
    pinCard: {
        marginBottom: 10,
    },
    image: {
        width: "100%",
        borderRadius: 15, // More rounded like Pins
        resizeMode: "cover",
    },
    pinCaption: {
        marginTop: 5,
        fontSize: 12,
        color: '#333',
        marginLeft: 4,
    },
    boardText: { // Board empty state
        textAlign: "center",
        marginTop: 290,
        fontSize: 15,
        color: "#666",
    },
    overlay: { // Popup overlay
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    blurView: { // Blur view
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    blurFallback: { // Blur fallback
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255, 255, 255, 0.85)",
    },
    popup: { // Popup card
        width: 350, // Slightly smaller
        backgroundColor: "#fef2f4",
        borderRadius: 20,
        paddingVertical: 30,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 10,
    },
    titleBox: { // Title box
        position: "absolute",
        top: -35,
        width: 250,
        height: 60,
        backgroundColor: "#fff",
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
    },
    popupTitle: { // Popup title
        fontSize: 18,
        color: "#000",
        fontWeight: 'bold',
    },
    closeButton: { // Close button
        position: "absolute",
        top: 10,
        right: 15,
        width: 30,
        height: 30,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
    },
    closeButtonText: { // Close button text
        fontSize: 20,
        color: "#d14d72",
        fontWeight: "bold",
    },
    moodRow: { // Mood row
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 15,
        width: '90%',
    },
    moodItem: { // Mood item
        alignItems: "center",
        marginHorizontal: 2,
    },
    moodIcon: { // Mood icon
        width: 50,
        height: 50,
        resizeMode: "contain",
        marginBottom: 5,
    },
    moodLabel: { // Mood label
        fontSize: 12,
        color: "#ff9eb4",
        textAlign: "center",
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        marginLeft: 4
    },
    userAvatar: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 4
    },
    userName: {
        fontSize: 10,
        color: '#666'
    }
});

export default Home;