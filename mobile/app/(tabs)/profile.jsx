"use client"
import { useState, useEffect } from "react"
import { View, ScrollView, Image, StyleSheet, TouchableOpacity, Modal, RefreshControl } from "react-native"
import { FontAwesome5 } from "@expo/vector-icons"
import { Subheading, BodyText } from '../components/CustomText';
import { API_BASE_URL } from "../config";
import { useRouter } from "expo-router";
import { useUser } from "../context/UserContext";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { useJournal } from "../context/JournalContext";

export default function ProfileScreen() {
  const router = useRouter();
  const { userProfile, token, logout } = useUser();
  const { gratitude, fetchEntries } = useJournal(); // Get gratitude data
  const [activeTab, setActiveTab] = useState("Pins")



  // ... (rest of component) ...



  // New State for features
  const [weeklyMoods, setWeeklyMoods] = useState([]);
  const [mostCommonMood, setMostCommonMood] = useState(null);
  const [streakData, setStreakData] = useState({ streakCount: 0, completedToday: false });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchMoodData(),
      fetchStreakData(),
      fetchEntries ? fetchEntries() : Promise.resolve(),
      fetchUserContent()
    ]);
    setRefreshing(false);
  };

  // Load static assets for moods
  const moodAssets = {
    "Great": require("../(tabs)/assets/images/Great Emote.png"),
    "Good": require("../(tabs)/assets/images/good emote.png"),
    "Okay": require("../(tabs)/assets/images/okay emote.png"),
    "Low": require("../(tabs)/assets/images/low emote.png"),
    "Struggling": require("../(tabs)/assets/images/struggling emote.png"),
  };

  // Use useFocusEffect to re-fetch data whenever screen is focused
  useFocusEffect(
    useCallback(() => {
      if (token && userProfile && userProfile._id) {
        fetchMoodData();
        fetchStreakData();
        if (fetchEntries) fetchEntries(); // Sync journal/gratitude
      }
    }, [token, userProfile, fetchEntries])
  );

  const fetchMoodData = async () => {
    try {
      // Calculate start/end of current week (Mon-Sun)
      const now = new Date();
      const day = now.getDay(); // 0 is Sun, 1 is Mon...
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday

      const monday = new Date(now);
      monday.setDate(diff);
      const sunday = new Date(now);
      sunday.setDate(diff + 6);

      const startDate = monday.toISOString().split('T')[0];
      const endDate = sunday.toISOString().split('T')[0];

      // 1. Get Weekly Moods
      const moodRes = await fetch(`${API_BASE_URL}/mood/weekly?startDate=${startDate}&endDate=${endDate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (moodRes.ok) {
        const data = await moodRes.json();
        // Process data to match UI structure
        // Map Day Name (Mon, Tue) from date
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const processedMoods = data.map((m, index) => {
          const d = new Date(m.date);
          return {
            id: m._id,
            day: days[d.getDay()],
            emoji: moodAssets[m.mood],
            label: m.mood
          };
        });
        setWeeklyMoods(processedMoods);
      }

      // 2. Get Most Common Mood (For this week)
      const statsRes = await fetch(`${API_BASE_URL}/mood/stats?startDate=${startDate}&endDate=${endDate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const stats = await statsRes.json();
        if (stats.mostCommon) {
          setMostCommonMood({
            label: stats.mostCommon,
            emoji: moodAssets[stats.mostCommon]
          });
        } else {
          setMostCommonMood(null);
        }
      }

    } catch (error) {
      console.log("Error fetching mood data", error);
    }
  };

  const fetchStreakData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/streak/status/${userProfile._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStreakData(data);
      }
    } catch (error) {
      console.log("Error fetching streak", error);
    }
  };

  // Data State
  const [userPins, setUserPins] = useState([]);
  const [userBoards, setUserBoards] = useState([]);
  const [loadingContent, setLoadingContent] = useState(true);

  // Fetch User Content
  const fetchUserContent = async () => {
    try {
      if (!token || !userProfile?._id) return;

      // 1. Fetch User's Boards with Covers
      const boardsRes = await fetch(`${API_BASE_URL}/pins/user-boards`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (boardsRes.ok) {
        const boardsData = await boardsRes.json();
        setUserBoards(boardsData);
      }

      // 2. Fetch User's Pins (filtered by userId)
      const pinsRes = await fetch(`${API_BASE_URL}/pins?userId=${userProfile._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (pinsRes.ok) {
        const pinsData = await pinsRes.json();
        setUserPins(pinsData);
      }
    } catch (err) {
      console.error("Error fetching profile content:", err);
    } finally {
      setLoadingContent(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserContent();
    }, [token, userProfile])
  );

  // Helper to split pins
  const splitPins = (pins) => {
    const left = [];
    const right = [];
    pins.forEach((pin, index) => {
      if (index % 2 === 0) left.push(pin);
      else right.push(pin);
    });
    return { left, right };
  };

  if (!userProfile) return null;

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF5F7" }}>
      <ScrollView
        style={s.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D14D72" />}
      >
        <Image source={require("../(tabs)/assets/images/flower.png")} style={s.backgroundImage} />
        <View style={s.profileHeader}>
          {userProfile.avatar ? (
            <Image source={userProfile.avatar} style={s.avatar} />
          ) : (
            <View style={s.avatar} />
          )}
          <Subheading style={s.profileName}>{userProfile.firstName} {userProfile.surname}</Subheading>
          {userProfile.bio ? <BodyText style={s.profileTagline}>{userProfile.bio}</BodyText> : null}
          <TouchableOpacity style={s.editButton} onPress={() => router.push("/edit-profile")}>
            <BodyText style={s.editButtonText}>Edit Profile</BodyText>
          </TouchableOpacity>
        </View>

        <View style={s.achievementsContainer}>
          <View style={s.streakHeader}>
            <View style={s.streakIconContainer}>
              <FontAwesome5 name="fire" size={24} color="#D14D72" />
            </View>
            <View style={s.streakTextContainer}>
              <Subheading style={s.streakTitle}>{streakData.streakCount} Day Streak</Subheading>
              <BodyText style={s.streakSubtitle}>Keep the flame alive!</BodyText>
            </View>
            <View style={s.streakBadge}>
              <BodyText style={s.badgeText}>Level {Math.floor(streakData.streakCount / 7) + 1}</BodyText>
            </View>
          </View>

          <View style={s.thermometerContainer}>
            <View style={s.thermometerLabel}>
              <BodyText style={s.thermometerText}>Next Milestone: 30 Days</BodyText>
              <Subheading style={s.thermometerProgress}>{streakData.streakCount % 30}/30</Subheading>
            </View>
            <View style={s.thermometerBar}>
              <View style={[s.thermometerFill, { width: `${(streakData.streakCount % 30 / 30) * 100}%` }]} />
            </View>
          </View>
        </View>

        <View style={s.tabsContainer}>
          <TouchableOpacity style={activeTab === "Pins" ? s.tabButtonActive : s.tabButton} onPress={() => setActiveTab("Pins")}>
            <BodyText style={activeTab === "Pins" ? s.tabLabelActive : s.tabLabel}>Pins</BodyText>
          </TouchableOpacity>
          <TouchableOpacity style={activeTab === "Boards" ? s.tabButtonActive : s.tabButton} onPress={() => setActiveTab("Boards")}>
            <BodyText style={activeTab === "Boards" ? s.tabLabelActive : s.tabLabel}>Boards</BodyText>
          </TouchableOpacity>
        </View>

        {activeTab === "Pins" && (
          <View style={s.gridContainer}>
            {userPins.length > 0 ? (
              <View>
                <View style={s.pinterestGrid}>
                  {userPins.slice(0, 6).map((pin) => (
                    <TouchableOpacity
                      key={pin._id}
                      style={s.squarePinCard}
                      onPress={() => router.push({ pathname: '/pin-detail', params: { id: pin._id } })}
                    >
                      <Image source={{ uri: pin.images[0]?.url }} style={s.squarePinImage} />
                    </TouchableOpacity>
                  ))}
                </View>
                {userPins.length > 0 && (
                  <TouchableOpacity style={s.seeMoreButton} onPress={() => router.push("/my-pins")}>
                    <BodyText style={s.seeMoreText}>See More</BodyText>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <BodyText style={s.comingSoonText}>No pins yet. Create your first pin!</BodyText>
            )}
          </View>
        )}

        {activeTab === "Boards" && (
          <View style={s.boardGrid}>
            {userBoards.map((board, index) => (
              <TouchableOpacity
                key={index}
                style={s.boardPost}
                onPress={() => router.push({ pathname: "/board-detail", params: { id: board._id } })}
              >
                {board.coverImage ? (
                  <Image
                    source={{ uri: board.coverImage }}
                    style={s.boardImage}
                    blurRadius={10}
                  />
                ) : (
                  <View style={[s.boardImage, { backgroundColor: '#FFB6C1' }]} />
                )}
                <View style={s.boardOverlay}>
                  <Subheading style={s.boardNameOverlay} numberOfLines={1} adjustsFontSizeToFit>{board.name}</Subheading>
                  {board.isPrivate && <FontAwesome5 name="lock" size={12} color="#FFF" style={{ marginTop: 4 }} />}
                </View>
              </TouchableOpacity>
            ))}
            {userBoards.length === 0 && <BodyText style={s.comingSoonText}>No boards created yet.</BodyText>}
          </View>
        )}

        <Subheading style={s.sectionTitle}>This Week's Mood</Subheading>
        <View style={s.moodContainer}>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={s.moodScrollContent}>
            {weeklyMoods.length > 0 ? weeklyMoods.map((item) => (
              <View key={item.id} style={s.moodItem}>
                <Image source={item.emoji} style={s.moodEmoji} />
                <BodyText style={s.moodLabel}>{item.label}</BodyText>
                <BodyText style={s.moodDay}>{item.day}</BodyText>
              </View>
            )) : <BodyText style={[s.moodLabel, { width: 200 }]}>No mood data for this week</BodyText>}
          </ScrollView>
          <View style={s.moodSeparator} />
          {mostCommonMood ? (
            <View style={s.mostCommonContainer}>
              <Image source={mostCommonMood.emoji} style={s.mostCommonEmoji} />
              <BodyText style={s.mostCommonLabel}>Most Common</BodyText>
              <Subheading style={s.mostCommonMood}>{mostCommonMood.label}</Subheading>
            </View>
          ) : (
            <View style={s.mostCommonContainer}>
              <BodyText style={s.mostCommonLabel}>Most Common</BodyText>
              <BodyText style={s.mostCommonLabel}>No data yet</BodyText>
            </View>
          )}
        </View>

        <View style={s.bottomActions}>
          <TouchableOpacity style={s.actionButton} onPress={() => router.push("/settings")}>
            <FontAwesome5 name="cog" size={20} color="#666" />
            <BodyText style={s.actionLabel}>Settings</BodyText>
          </TouchableOpacity>
          <TouchableOpacity style={s.actionButton} onPress={handleLogout}>
            <FontAwesome5 name="sign-out-alt" size={20} color="#FF6B6B" />
            <BodyText style={s.actionLabelRed}>Log out</BodyText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Logout Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showLogoutModal}
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalIconContainer}>
              <FontAwesome5 name="sign-out-alt" size={32} color="#FF6B6B" />
            </View>
            <Subheading style={s.modalTitle}>Log Out?</Subheading>
            <BodyText style={s.modalMessage}>
              Are you sure you want to log out?{'\n'}We'll miss you!
            </BodyText>
            <View style={s.modalButtons}>
              <TouchableOpacity
                style={s.cancelButton}
                onPress={() => setShowLogoutModal(false)}
              >
                <BodyText style={s.cancelButtonText}>Cancel</BodyText>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.logoutButtonModal}
                onPress={confirmLogout}
              >
                <BodyText style={s.logoutButtonTextModal}>Log Out</BodyText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { // Main container
    flex: 1,
    backgroundColor: "#FFF5F7",
  },
  backgroundImage: { // Background flower
    position: "absolute",
    width: "100%",
    height: 300,
    opacity: 0.7,
  },
  profileHeader: { // Profile header
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 20,
  },
  avatar: { // Avatar circle
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E8D5E8",
    borderWidth: 3,
    borderColor: "#FFB6C1",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileName: { // Profile name
    fontSize: 24,
    color: "#333",
    marginBottom: 8,
  },
  profileTagline: { // Profile tagline
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    marginHorizontal: 20,
    marginBottom: 16,
  },
  editButton: { // Edit button
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: "#FFB6C1",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editButtonText: { // Edit button text
    color: "#FFF",
    fontSize: 16,
  },
  sectionTitle: { // Section title
    fontSize: 18,
    color: "#333",
    marginBottom: 12,
    marginHorizontal: 16,
  },
  achievementsContainer: { // Achievements container
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#F0E0F0",
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#FFD0E0',
  },
  streakTextContainer: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 2,
  },
  streakSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  streakBadge: {
    backgroundColor: '#D14D72',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  thermometerContainer: { // Progress container
    borderTopWidth: 1,
    borderTopColor: "#F0E0F0",
    paddingTop: 12,
  },
  thermometerLabel: { // Progress label
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  thermometerText: { // Progress text
    fontSize: 15,
    color: "#333",
  },
  thermometerProgress: { // Progress numbers
    fontSize: 15,
    color: "#FFB6C1",
  },
  thermometerBar: { // Progress bar
    height: 8,
    backgroundColor: "#F0E0F0",
    borderRadius: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8D5E8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thermometerFill: { // Progress fill
    height: "100%",
    width: "23%",
    backgroundColor: "#FFB6C1",
    borderRadius: 4,
  },
  tabsContainer: { // Tabs container
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0E0F0",
  },
  tabButton: { // Inactive tab
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: { // Active tab
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#FFB6C1",
  },
  tabLabel: { // Inactive tab label
    fontSize: 18,
    color: "#999",
  },
  tabLabelActive: { // Active tab label
    fontSize: 18,
    color: "#FFB6C1",
  },
  gridContainer: { // Pin grid
    flexDirection: "row",
    paddingHorizontal: 10,
    marginBottom: 24,
    gap: 8,
  },
  grid: { // Grid layout
    flexDirection: "row",
    justifyContent: "space-between",
    width: '100%',
  },
  column: { // Grid column
    flex: 1,
    gap: 8,
    marginHorizontal: 5,
  },
  pinCard: { // Pin card
    marginBottom: 10,
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pinImage: { // Pin image
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  pinTitle: { // Pin title
    padding: 8,
    fontSize: 12,
    color: '#333',
  },
  pinterestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    // justifyContent: 'space-between',
  },
  squarePinCard: {
    width: '31%', // 3 columns roughly
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  squarePinImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 10,
    gap: 8,
  },
  seeMoreText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  comingSoonContainer: { // Coming soon container
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  comingSoonText: { // Coming soon text
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    paddingVertical: 40,
  },
  moodContainer: { // Mood container
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: "#F0E0F0",
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  moodScrollContent: { // Mood scroll
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 10,
  },
  moodItem: { // Mood item
    alignItems: 'center',
    width: 80,
    marginHorizontal: 4,
  },
  moodEmoji: { // Mood emoji
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  moodLabel: { // Mood label
    fontSize: 13,
    color: "#D14D72",
    textAlign: "center",
    marginBottom: 4,
  },
  moodDay: { // Mood day
    fontSize: 14,
    color: "#999",
    marginBottom: 12,
  },
  moodSeparator: { // Mood separator
    borderBottomWidth: 1,
    borderBottomColor: "#F0E0F0",
    marginHorizontal: -16,
  },
  mostCommonContainer: { // Most common container
    alignItems: "center",
    marginTop: 18,
  },
  mostCommonEmoji: { // Most common emoji
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  mostCommonLabel: { // Most common label
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  mostCommonMood: { // Most common mood
    fontSize: 14,
    color: "#FFB6C1",
  },
  bottomActions: { // Bottom actions
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },
  actionButton: { // Action button
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0E0F0",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionLabel: { // Action label
    fontSize: 14,
    color: "#666",
  },
  actionLabelRed: { // Red action label
    fontSize: 14,
    color: "#FF6B6B",
  },
  gratitudeListContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  gratitudeCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0E0F0',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  gratitudeDate: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  gratitudeText: {
    fontSize: 14,
    color: '#333',
  },
  boardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    gap: 8,
  },
  boardPost: {
    width: '31%', // 3 columns approx
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative'
  },
  boardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  boardOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4
  },
  boardNameOverlay: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#F0E0F0',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButtonModal: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonTextModal: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
})