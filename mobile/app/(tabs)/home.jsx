import { View, StyleSheet, TouchableOpacity, Image, ScrollView, Modal } from "react-native";
import React, { useState, useEffect } from "react";
import { BlurView } from 'expo-blur';
import { Subheading, BodyText } from '../components/CustomText'; // Custom text components

const Home = () => {
    const [activeTab, setActiveTab] = useState("forYou");
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        // Show popup shortly after component mounts
        const timer = setTimeout(() => setShowPopup(true), 100); 
        return () => clearTimeout(timer);
    }, []);

    const isForYou = activeTab === "forYou";

    return (
        <View style={s.container}>
            {/* Tab Navigation */}
            <View style={s.tabBar}>
                <TouchableOpacity onPress={() => setActiveTab("forYou")}>
                    {/* Subheading for tab name */}
                    <Subheading style={[s.tabText, isForYou && s.activeTabText]}>
                        For you
                    </Subheading>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setActiveTab("board")}>
                    {/* Subheading for tab name */}
                    <Subheading style={[s.tabText, !isForYou && s.activeTabText]}>
                        Board Name
                    </Subheading>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={s.content}>
                {isForYou ? (
                    <ScrollView contentContainerStyle={s.gridContainer}>
                        <View style={s.grid}>
                            {/* Left Column */}
                            <View style={s.column}>
                                <TouchableOpacity><Image source={require("../(tabs)/assets/images/1image.png")} style={[s.image, { height: 174 }]} /></TouchableOpacity>
                                <TouchableOpacity>
                                    <Image source={require("../(tabs)/assets/images/3image.png")} style={[s.image, { height: 280 }]} />
                                    {/* BodyText for small label */}
                                    <BodyText style={s.paidLinkText}>Paid Link</BodyText>
                                </TouchableOpacity>
                                <TouchableOpacity><Image source={require("../(tabs)/assets/images/5image.png")} style={[s.image, { height: 174 }]} /></TouchableOpacity>
                                <TouchableOpacity>
                                    <Image source={require("../(tabs)/assets/images/7image.png")} style={[s.image, s.smallImage]} />
                                    {/* BodyText for positioned label */}
                                    <BodyText style={s.moreLikeThis}>More like this</BodyText>
                                </TouchableOpacity>
                            </View>

                            {/* Right Column */}
                            <View style={s.column}>
                                <TouchableOpacity><Image source={require("../(tabs)/assets/images/2image.png")} style={[s.image, { height: 280 }]} /></TouchableOpacity>
                                <TouchableOpacity><Image source={require("../(tabs)/assets/images/4image.png")} style={[s.image, { height: 101 }]} /></TouchableOpacity>
                                <TouchableOpacity><Image source={require("../(tabs)/assets/images/6image.png")} style={[s.image, { height: 280 }]} /></TouchableOpacity>
                                <TouchableOpacity>
                                    <Image source={require("../(tabs)/assets/images/8image.png")} style={[s.image, s.smallImage]} />
                                    {/* BodyText for positioned label */}
                                    <BodyText style={s.moreLikeThis}>More like this</BodyText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                ) : (
                    // BodyText for board message
                    <BodyText style={s.boardText}>
                        Nothing here yet.{"\n"}Pin a post to get started!
                    </BodyText>
                )}
            </View>

            {/* POPUP */}
            <Modal transparent visible={showPopup} animationType="fade">
                <BlurView intensity={15} tint="light" style={s.overlay}>
                    <View style={s.popup}>
                        <View style={s.titleBox}>
                            {/* Subheading for popup title */}
                            <Subheading style={s.popupTitle}>Quick Mood Check-in</Subheading>
                        </View>

                        <View style={s.moodRow}>
                            <TouchableOpacity onPress={() => setShowPopup(false)}>
                                <Image source={require("../(tabs)/assets/images/Great Emote.png")} style={s.moodIcon} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setShowPopup(false)}>
                                <Image source={require("../(tabs)/assets/images/good emote.png")} style={s.moodIcon} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setShowPopup(false)}>
                                <Image source={require("../(tabs)/assets/images/okay emote.png")} style={s.moodIcon} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setShowPopup(false)}>
                                <Image source={require("../(tabs)/assets/images/low emote.png")} style={s.moodIcon} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setShowPopup(false)}>
                                <Image source={require("../(tabs)/assets/images/struggling emote.png")} style={s.moodIcon} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </BlurView>
            </Modal>
        </View>
    );
};

const s = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: 40,
    },
    tabBar: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: "#fef2f4",
        gap: 20,
    },
    tabText: {
        fontSize: 16,
        color: "#999",
    },
    activeTabText: {
        color: "#d14d72",
        borderBottomWidth: 2,
        borderBottomColor: "#d14d72",
        paddingBottom: 5,
    },
    content: {
        flex: 1,
        backgroundColor: "#fef2f4",
    },
    gridContainer: { 
        padding: 10 
    },
    grid: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    column: {
        flex: 1,
        marginHorizontal: 5,
    },
    image: {
        width: "100%",
        borderRadius: 10,
        marginBottom: 10,
        resizeMode: "cover",
    },
    smallImage: { 
        height: 60, 
        opacity: 0.7 
    },
    paidLinkText: {
        marginBottom: 10,
        fontSize: 16,
    },
    moreLikeThis: {
        position: "absolute",
        right: 40,
        fontSize: 16,
        marginTop: 18,
    },
    boardText: {
        textAlign: "center",
        marginTop: 290,
        fontSize: 15,
        color: "#666",
    },
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    popup: {
        width: 350,
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
    titleBox: {
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
    popupTitle: {
        fontSize: 18,
        color: "#d14d72",
    },
    moodRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 5,
    },
    moodIcon: {
        width: 70,
        height: 90,
        resizeMode: "contain",
        marginBottom: 5,
        backgroundColor: "#ffffffff",
        marginHorizontal: 3,
    },
});

export default Home;