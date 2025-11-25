import { View, StyleSheet, TouchableOpacity, Image, ScrollView, Modal } from "react-native";
import React, { useState, useEffect } from "react";
import { BlurView } from 'expo-blur';
import { Subheading, BodyText } from '../components/CustomText';

const Home = () => {
    const [activeTab, setActiveTab] = useState("forYou");
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowPopup(true), 100);
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
                    <ScrollView contentContainerStyle={styles.gridContainer}>
                        <View style={styles.grid}>
                            <View style={styles.column}>
                                <TouchableOpacity><Image source={require("../(tabs)/assets/images/1image.png")} style={styles.image1} /></TouchableOpacity>
                                <TouchableOpacity>
                                    <Image source={require("../(tabs)/assets/images/3image.png")} style={styles.image3} />
                                    <BodyText style={styles.paidLinkText}>Paid Link</BodyText>
                                </TouchableOpacity>
                                <TouchableOpacity><Image source={require("../(tabs)/assets/images/5image.png")} style={styles.image5} /></TouchableOpacity>
                                <TouchableOpacity>
                                    <Image source={require("../(tabs)/assets/images/7image.png")} style={styles.smallImage} />
                                    <BodyText style={styles.moreLikeThis}>More like this</BodyText>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.column}>
                                <TouchableOpacity><Image source={require("../(tabs)/assets/images/2image.png")} style={styles.image2} /></TouchableOpacity>
                                <TouchableOpacity><Image source={require("../(tabs)/assets/images/4image.png")} style={styles.image4} /></TouchableOpacity>
                                <TouchableOpacity><Image source={require("../(tabs)/assets/images/6image.png")} style={styles.image6} /></TouchableOpacity>
                                <TouchableOpacity>
                                    <Image source={require("../(tabs)/assets/images/8image.png")} style={styles.smallImage} />
                                    <BodyText style={styles.moreLikeThis}>More like this</BodyText>
                                </TouchableOpacity>
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
    image1: { // Image 1
        width: "100%",
        height: 174,
        borderRadius: 10,
        marginBottom: 10,
        resizeMode: "cover",
    },
    image2: { // Image 2
        width: "100%",
        height: 280,
        borderRadius: 10,
        marginBottom: 10,
        resizeMode: "cover",
    },
    image3: { // Image 3
        width: "100%",
        height: 280,
        borderRadius: 10,
        marginBottom: 10,
        resizeMode: "cover",
    },
    image4: { // Image 4
        width: "100%",
        height: 101,
        borderRadius: 10,
        marginBottom: 10,
        resizeMode: "cover",
    },
    image5: { // Image 5
        width: "100%",
        height: 174,
        borderRadius: 10,
        marginBottom: 10,
        resizeMode: "cover",
    },
    image6: { // Image 6
        width: "100%",
        height: 280,
        borderRadius: 10,
        marginBottom: 10,
        resizeMode: "cover",
    },
    smallImage: { // Small image
        width: "100%",
        height: 60,
        borderRadius: 10,
        marginBottom: 10,
        resizeMode: "cover",
        opacity: 0.7,
    },
    paidLinkText: { // Paid link text
        marginBottom: 10,
        fontSize: 16,
    },
    moreLikeThis: { // More like this text
        position: "absolute",
        right: 40,
        fontSize: 16,
        marginTop: 18,
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
        width: 400,
        backgroundColor: "#fef2f4",
        borderRadius: 10,
        paddingTop: 35,
        paddingBottom: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 10,
    },
    titleBox: { // Title box
        position: "absolute",
        top: -40,
        width: 220,
        height: 70,
        backgroundColor: "#fff",
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#f0f0f0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    popupTitle: { // Popup title
        fontSize: 18,
        color: "#d14d72",
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
        fontSize: 24,
        color: "#d14d72",
        fontWeight: "bold",
    },
    moodRow: { // Mood row
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 5,
    },
    moodItem: { // Mood item
        alignItems: "center",
        marginHorizontal: 3,
    },
    moodIcon: { // Mood icon
        width: 70,
        height: 90,
        resizeMode: "contain",
        marginBottom: 5,
    },
    moodLabel: { // Mood label
        fontSize: 14,
        fontWeight: "bold",
        color: "#ff9eb4",
        textAlign: "center",
    },
});

export default Home;