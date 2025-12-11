import { View, StyleSheet, TouchableOpacity, Image, ScrollView, Modal, Text } from "react-native";
import React, { useState, useEffect } from "react";
import { BlurView } from 'expo-blur';
import { Subheading, BodyText } from '../components/CustomText';
import { useRouter } from "expo-router";
import { MOCK_PINS } from "../data/pins";

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
    const [activeTab, setActiveTab] = useState("forYou");
    const [showPopup, setShowPopup] = useState(false);
    const router = useRouter();

    // Split pins for masonry layout
    const { left, right } = splitPins(MOCK_PINS);

    // Initial Popup Logic (Mock for now, replacing previous timer)
    useEffect(() => {
        // In real app, check context if logged today
        const timer = setTimeout(() => setShowPopup(true), 500);
        return () => clearTimeout(timer);
    }, []);

    const isForYouActive = activeTab === "forYou";

    return (
        <View style={styles.container}>
            <View style={styles.tabBar}>
                <TouchableOpacity onPress={() => setActiveTab("forYou")}>
                    <Subheading style={isForYouActive ? styles.activeTabText : styles.tabText}>For you</Subheading>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab("board")}>
                    <Subheading style={isForYouActive ? styles.tabText : styles.activeTabText}>Board Name</Subheading>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {isForYouActive ? (
                    <ScrollView contentContainerStyle={styles.gridContainer} showsVerticalScrollIndicator={false}>
                        <View style={styles.grid}>
                            <View style={styles.column}>
                                {left.map((pin) => (
                                    <TouchableOpacity
                                        key={pin.id}
                                        style={styles.pinCard}
                                        onPress={() => router.push({ pathname: '/pin-detail', params: { id: pin.id } })}
                                    >
                                        <Image source={pin.image} style={[styles.image, { height: pin.height }]} />
                                        {pin.description && (
                                            <BodyText style={styles.pinCaption} numberOfLines={2}>{pin.description}</BodyText>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <View style={styles.column}>
                                {right.map((pin) => (
                                    <TouchableOpacity
                                        key={pin.id}
                                        style={styles.pinCard}
                                        onPress={() => router.push({ pathname: '/pin-detail', params: { id: pin.id } })}
                                    >
                                        <Image source={pin.image} style={[styles.image, { height: pin.height }]} />
                                        {pin.description && (
                                            <BodyText style={styles.pinCaption} numberOfLines={2}>{pin.description}</BodyText>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </ScrollView>
                ) : (
                    <BodyText style={styles.boardText}>Nothing here yet.{"\n"}Pin a post to get started!</BodyText>
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
                            <TouchableOpacity style={styles.moodItem} onPress={() => setShowPopup(false)}>
                                <Image source={require("../(tabs)/assets/images/Great Emote.png")} style={styles.moodIcon} />
                                <BodyText style={styles.moodLabel}>Great</BodyText>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.moodItem} onPress={() => setShowPopup(false)}>
                                <Image source={require("../(tabs)/assets/images/good emote.png")} style={styles.moodIcon} />
                                <BodyText style={styles.moodLabel}>Good</BodyText>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.moodItem} onPress={() => setShowPopup(false)}>
                                <Image source={require("../(tabs)/assets/images/okay emote.png")} style={styles.moodIcon} />
                                <BodyText style={styles.moodLabel}>Okay</BodyText>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.moodItem} onPress={() => setShowPopup(false)}>
                                <Image source={require("../(tabs)/assets/images/low emote.png")} style={styles.moodIcon} />
                                <BodyText style={styles.moodLabel}>Low</BodyText>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.moodItem} onPress={() => setShowPopup(false)}>
                                <Image source={require("../(tabs)/assets/images/struggling emote.png")} style={styles.moodIcon} />
                                <BodyText style={styles.moodLabel}>Struggling</BodyText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { // Main container
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: 40,
    },
    tabBar: { // Tab bar
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
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
});

export default Home;