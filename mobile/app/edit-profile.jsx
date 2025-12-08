import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Dimensions, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useUser } from "./context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import { horizontalScale, verticalScale, moderateScale } from "./utils/responsive";
import { FONTS } from "./constants/fonts";

const { width } = Dimensions.get("window");

export default function EditProfileScreen() {
    const router = useRouter();
    const { userProfile, updateProfile } = useUser();

    // Local state initialized with context data
    const [firstName, setFirstName] = useState(userProfile.firstName);
    const [surname, setSurname] = useState(userProfile.surname);
    const [username, setUsername] = useState(userProfile.username);
    const [bio, setBio] = useState(userProfile.bio);

    // State to track if any changes were made or input interactions occurred
    const [hasChanges, setHasChanges] = useState(false);

    // Function to handle input changes and set dirty state
    const handleInputChange = (setter, value) => {
        setter(value);
        setHasChanges(true); // Requirement: "if they type any in input field, the done button will change color"
    };

    const handleDone = () => {
        // Update context with new values
        updateProfile({
            firstName,
            surname,
            username,
            bio,
        });
        router.back();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.headerBackground} />

                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={moderateScale(28)} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit profile</Text>
                    <TouchableOpacity
                        style={[styles.doneButton, hasChanges ? styles.doneButtonActive : styles.doneButtonInactive]}
                        onPress={handleDone}
                        disabled={!hasChanges}
                    >
                        <Text style={styles.doneButtonText}>Done</Text>
                    </TouchableOpacity>
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                        {/* Avatar Section - Positioned to overlap pink header */}
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatarPlaceholder} />
                            <TouchableOpacity style={styles.editAvatarBadge}>
                                <Text style={styles.editAvatarText}>Edit</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Form Fields */}
                        <View style={styles.formContainer}>
                            <View style={styles.fieldGroup}>
                                <Text style={styles.fieldLabel}>First name</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="First name"
                                        placeholderTextColor="#999"
                                        value={firstName}
                                        onChangeText={(text) => handleInputChange(setFirstName, text)}
                                    />
                                </View>
                            </View>

                            <View style={styles.fieldGroup}>
                                <Text style={styles.fieldLabel}>Surname</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Surname"
                                        placeholderTextColor="#999"
                                        value={surname}
                                        onChangeText={(text) => handleInputChange(setSurname, text)}
                                    />
                                </View>
                            </View>

                            <View style={styles.fieldGroup}>
                                <Text style={styles.fieldLabel}>Username</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Username"
                                        placeholderTextColor="#999"
                                        value={username}
                                        onChangeText={(text) => handleInputChange(setUsername, text)}
                                    />
                                </View>
                            </View>

                            <Text style={styles.sectionTitle}>Bio</Text>
                            <View style={[styles.inputWrapper, styles.bioInputWrapper]}>
                                <TextInput
                                    style={[styles.input, styles.bioInput]}
                                    placeholder="Put your motto or quote here"
                                    placeholderTextColor="#999"
                                    value={bio}
                                    onChangeText={(text) => handleInputChange(setBio, text)}
                                    multiline
                                />
                            </View>
                        </View>

                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#FFF5F7",
    },
    container: {
        flex: 1,
        backgroundColor: "#FFF5F7",
    },
    headerBackground: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: verticalScale(250),
        backgroundColor: "#FFB6C1",
        borderBottomLeftRadius: moderateScale(40),
        borderBottomRightRadius: moderateScale(40),
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: horizontalScale(30),
        paddingTop: verticalScale(5),
        paddingBottom: verticalScale(20),
    },
    backButton: {
        top: 20,
        right: 15,
        width: moderateScale(40),
        alignItems: "flex-start",
    },
    headerTitle: {
        left: 10,
        fontFamily: FONTS.bold,
        fontSize: moderateScale(20),
        paddingTop: verticalScale(30),
        color: "#FFF",
        textAlign: "center",
        flex: 1,
    },
    doneButton: {
        top: 20,
        left: 15,
        paddingHorizontal: horizontalScale(20),
        paddingVertical: verticalScale(10),
        borderRadius: moderateScale(20),
        minWidth: moderateScale(70),
        alignItems: "center",
    },
    doneButtonInactive: {
        backgroundColor: "#E0E0E0",
    },
    doneButtonActive: {
        backgroundColor: "#D14D72",
    },
    doneButtonText: {
        fontFamily: FONTS.semiBold,
        color: "#FFF",
        fontSize: moderateScale(14),
    },
    scrollContent: {
        alignItems: "center",
        paddingBottom: verticalScale(40),
    },
    avatarContainer: {
        alignItems: "center",
        marginTop: verticalScale(60),
        marginBottom: verticalScale(60),
    },
    avatarPlaceholder: {
        width: moderateScale(150),
        height: moderateScale(150),
        borderRadius: moderateScale(70),
        backgroundColor: "#D9D9D9",
        marginBottom: verticalScale(-15),
        zIndex: 1,
    },
    editAvatarBadge: {
        backgroundColor: "#D9D9D9",
        paddingHorizontal: horizontalScale(24),
        paddingVertical: verticalScale(10),
        borderRadius: moderateScale(10),
        zIndex: 2,
        marginTop: verticalScale(30),
    },
    editAvatarText: {
        fontFamily: FONTS.bold,
        fontSize: moderateScale(14),
        color: "#000",
    },
    formContainer: {
        width: "100%",
        marginTop: verticalScale(-30),
        paddingHorizontal: horizontalScale(20),
        gap: verticalScale(16),
    },
    fieldGroup: {
        gap: verticalScale(8),
    },
    fieldLabel: {
        fontFamily: FONTS.semiBold,
        fontSize: moderateScale(14),
        color: "#666",
        marginLeft: horizontalScale(4),
    },
    inputWrapper: {
        backgroundColor: "#FFF",
        borderRadius: moderateScale(12),
        borderWidth: 1,
        borderColor: "#FFABAB",
        paddingHorizontal: horizontalScale(16),
        paddingVertical: verticalScale(4),
        shadowColor: "#FFB6C1",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    input: {
        fontFamily: FONTS.regular,
        fontSize: moderateScale(16),
        color: "#333",
        paddingVertical: verticalScale(12),
        height: verticalScale(50),
    },
    sectionTitle: {
        fontFamily: FONTS.bold,
        fontSize: moderateScale(20),
        color: "#000",
        textAlign: "center",
        marginTop: verticalScale(20),
        marginBottom: verticalScale(-8),
    },
    bioInputWrapper: {
        height: verticalScale(150),
        paddingVertical: verticalScale(10),
    },
    bioInput: {
        height: "100%",
        textAlignVertical: "top",
    }
});
