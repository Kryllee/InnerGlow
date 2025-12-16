import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
    const router = useRouter();
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.container}>
                <Text style={styles.sectionHeader}>Account</Text>
                <View style={styles.section}>
                    <TouchableOpacity style={styles.row}>
                        <View style={styles.rowLeft}>
                            <Ionicons name="person-outline" size={22} color="#666" />
                            <Text style={styles.rowLabel}>Personal Information</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#CCC" />
                    </TouchableOpacity>
                    <View style={styles.separator} />
                    <TouchableOpacity style={styles.row}>
                        <View style={styles.rowLeft}>
                            <Ionicons name="lock-closed-outline" size={22} color="#666" />
                            <Text style={styles.rowLabel}>Privacy & Security</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#CCC" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionHeader}>Preferences</Text>
                <View style={styles.section}>
                    <View style={styles.row}>
                        <View style={styles.rowLeft}>
                            <Ionicons name="notifications-outline" size={22} color="#666" />
                            <Text style={styles.rowLabel}>Notifications</Text>
                        </View>
                        <Switch
                            value={notifications}
                            onValueChange={setNotifications}
                            trackColor={{ false: "#E0E0E0", true: "#FFB6C1" }}
                            thumbColor={notifications ? "#D14D72" : "#f4f3f4"}
                        />
                    </View>
                    <View style={styles.separator} />
                    <View style={styles.row}>
                        <View style={styles.rowLeft}>
                            <Ionicons name="moon-outline" size={22} color="#666" />
                            <Text style={styles.rowLabel}>Dark Mode</Text>
                        </View>
                        <Switch
                            value={darkMode}
                            onValueChange={setDarkMode}
                            trackColor={{ false: "#E0E0E0", true: "#FFB6C1" }}
                            thumbColor={darkMode ? "#D14D72" : "#f4f3f4"}
                        />
                    </View>
                </View>

                <Text style={styles.sectionHeader}>Support</Text>
                <View style={styles.section}>
                    <TouchableOpacity style={styles.row}>
                        <View style={styles.rowLeft}>
                            <Ionicons name="help-circle-outline" size={22} color="#666" />
                            <Text style={styles.rowLabel}>Help Center</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#CCC" />
                    </TouchableOpacity>
                    <View style={styles.separator} />
                    <TouchableOpacity style={styles.row}>
                        <View style={styles.rowLeft}>
                            <Ionicons name="information-circle-outline" size={22} color="#666" />
                            <Text style={styles.rowLabel}>About InnerGlow</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#CCC" />
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFF5F7',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFF5F7',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    container: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: '600',
        color: '#999',
        marginBottom: 10,
        marginTop: 20,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    section: {
        backgroundColor: '#FFF',
        borderRadius: 15,
        paddingHorizontal: 15,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    rowLabel: {
        fontSize: 16,
        color: '#333',
    },
    separator: {
        height: 1,
        backgroundColor: '#F0F0F0',
    },
});
