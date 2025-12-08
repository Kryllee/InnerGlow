"use client"
import { useState } from "react"
import { View, ScrollView, Image, StyleSheet, TouchableOpacity } from "react-native"
import { FontAwesome5 } from "@expo/vector-icons"
import { Subheading, BodyText } from '../components/CustomText';

import { useRouter } from "expo-router";
import { useUser } from "../context/UserContext";

export default function ProfileScreen() {
  const router = useRouter();
  const { userProfile } = useUser();
  const [activeTab, setActiveTab] = useState("Pins")

  const achievements = [
    { id: 1, label: "7 Day\nStreak", icon: "fire", color: "#D14D72" },
    { id: 2, label: "First\nEntry", icon: "pen", color: "#D14D72" },
    { id: 3, label: "10\nGratitudes", icon: "heart", color: "#D14D72" },
  ]

  const moods = [
    { id: 1, day: "Mon", emoji: require("../(tabs)/assets/images/Great Emote.png"), label: "Great" },
    { id: 2, day: "Tue", emoji: require("../(tabs)/assets/images/good emote.png"), label: "Good" },
    { id: 3, day: "Wed", emoji: require("../(tabs)/assets/images/okay emote.png"), label: "Okay" },
    { id: 4, day: "Thu", emoji: require("../(tabs)/assets/images/low emote.png"), label: "Low" },
    { id: 5, day: "Fri", emoji: require("../(tabs)/assets/images/good emote.png"), label: "Good" },
    { id: 6, day: "Sat", emoji: require("../(tabs)/assets/images/Great Emote.png"), label: "Great" },
    { id: 7, day: "Sun", emoji: require("../(tabs)/assets/images/okay emote.png"), label: "Okay" },
  ]

  const pinImages = [
    { id: 1, image: require("../(tabs)/assets/images/1image.png"), column: "left", height: 174 },
    { id: 2, image: require("../(tabs)/assets/images/2image.png"), column: "right", height: 280 },
    { id: 3, image: require("../(tabs)/assets/images/3image.png"), column: "left", height: 280 },
    { id: 4, image: require("../(tabs)/assets/images/4image.png"), column: "right", height: 101 },
    { id: 5, image: require("../(tabs)/assets/images/5image.png"), column: "left", height: 174 },
  ]

  const leftImages = pinImages.filter((img) => img.column === "left")
  const rightImages = pinImages.filter((img) => img.column === "right")

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      <Image source={require("../(tabs)/assets/images/flower.png")} style={s.backgroundImage} />
      <View style={s.profileHeader}>
        <View style={s.avatar} />
        <Subheading style={s.profileName}>{userProfile.firstName} {userProfile.surname}</Subheading>
        {userProfile.bio && <BodyText style={s.profileTagline}>{userProfile.bio}</BodyText>}
        <TouchableOpacity style={s.editButton} onPress={() => router.push("/edit-profile")}>
          <BodyText style={s.editButtonText}>Edit Profile</BodyText>
        </TouchableOpacity>
      </View>

      <Subheading style={s.sectionTitle}>Achievements</Subheading>
      <View style={s.achievementsContainer}>
        <View style={s.achievementsGrid}>
          {achievements.map((item) => (
            <View key={item.id} style={s.achievementCard}>
              <FontAwesome5 name={item.icon} size={28} color={item.color} />
              <BodyText style={s.achievementLabel}>{item.label}</BodyText>
            </View>
          ))}
        </View>
        <View style={s.thermometerContainer}>
          <View style={s.thermometerLabel}>
            <BodyText style={s.thermometerText}>Next: 30 Day Streak</BodyText>
            <Subheading style={s.thermometerProgress}>7/30</Subheading>
          </View>
          <View style={s.thermometerBar}>
            <View style={s.thermometerFill} />
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
        <TouchableOpacity style={activeTab === "Journals" ? s.tabButtonActive : s.tabButton} onPress={() => setActiveTab("Journals")}>
          <BodyText style={activeTab === "Journals" ? s.tabLabelActive : s.tabLabel}>Journals</BodyText>
        </TouchableOpacity>
        <TouchableOpacity style={activeTab === "Gratitude" ? s.tabButtonActive : s.tabButton} onPress={() => setActiveTab("Gratitude")}>
          <BodyText style={activeTab === "Gratitude" ? s.tabLabelActive : s.tabLabel}>Gratitude</BodyText>
        </TouchableOpacity>
      </View>

      {activeTab === "Pins" && (
        <View style={s.gridContainer}>
          <View style={s.column}>
            {leftImages.map((item) => {
              const imageStyle = { width: "100%", borderRadius: 10, resizeMode: "cover", height: item.height }
              return <TouchableOpacity key={item.id}><Image source={item.image} style={imageStyle} /></TouchableOpacity>
            })}
          </View>
          <View style={s.column}>
            {rightImages.map((item) => {
              const imageStyle = { width: "100%", borderRadius: 10, resizeMode: "cover", height: item.height }
              return <TouchableOpacity key={item.id}><Image source={item.image} style={imageStyle} /></TouchableOpacity>
            })}
          </View>
        </View>
      )}
      {activeTab === "Boards" && <View style={s.comingSoonContainer}><BodyText style={s.comingSoonText}>Boards content coming soon</BodyText></View>}
      {activeTab === "Journals" && <View style={s.comingSoonContainer}><BodyText style={s.comingSoonText}>Journals content coming soon</BodyText></View>}
      {activeTab === "Gratitude" && <View style={s.comingSoonContainer}><BodyText style={s.comingSoonText}>Gratitude content coming soon</BodyText></View>}

      <Subheading style={s.sectionTitle}>This Week's Mood</Subheading>
      <View style={s.moodContainer}>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={s.moodScrollContent}>
          {moods.map((item) => (
            <View key={item.id} style={s.moodItem}>
              <Image source={item.emoji} style={s.moodEmoji} />
              <BodyText style={s.moodLabel}>{item.label}</BodyText>
              <BodyText style={s.moodDay}>{item.day}</BodyText>
            </View>
          ))}
        </ScrollView>
        <View style={s.moodSeparator} />
        <View style={s.mostCommonContainer}>
          <Image source={require("../(tabs)/assets/images/Great Emote.png")} style={s.mostCommonEmoji} />
          <BodyText style={s.mostCommonLabel}>Most Common</BodyText>
          <Subheading style={s.mostCommonMood}>Great</Subheading>
        </View>
      </View>

      <View style={s.bottomActions}>
        <TouchableOpacity style={s.actionButton}>
          <FontAwesome5 name="cog" size={20} color="#666" />
          <BodyText style={s.actionLabel}>Settings</BodyText>
        </TouchableOpacity>
        <TouchableOpacity style={s.actionButton}>
          <FontAwesome5 name="sign-out-alt" size={20} color="#FF6B6B" />
          <BodyText style={s.actionLabelRed}>Log out</BodyText>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    borderRadius: 16,
    padding: 16,
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
  achievementsGrid: { // Achievements grid
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  achievementCard: { // Achievement card
    alignItems: "center",
    backgroundColor: "#FFE8F0",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    width: "30%",
    borderWidth: 1,
    borderColor: "#FFD0E0",
  },
  achievementLabel: { // Achievement label
    fontSize: 14,
    color: "#333",
    marginTop: 8,
    textAlign: "center",
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
  column: { // Grid column
    flex: 1,
    gap: 8,
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
})