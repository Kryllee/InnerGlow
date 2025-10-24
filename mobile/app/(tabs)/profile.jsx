"use client"
import { useState } from "react"
import { View, ScrollView, Image, StyleSheet, TouchableOpacity } from "react-native"
import { FontAwesome5 } from "@expo/vector-icons"
import { Subheading, BodyText } from '../components/CustomText'; 

export default function ProfileScreen() {
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

      {/* Profile Header */}
      <View style={s.profileHeader}>
        <View style={[s.avatar, s.shadow]} />
        <Subheading style={s.profileName}>Nuxczy Schutz</Subheading>
        <BodyText style={s.profileTagline}>"Becoming the best version of yourself, one day at a time"</BodyText>
        <TouchableOpacity style={[s.editButton, s.shadow]}>
          <BodyText style={s.editButtonText}>Edit Profile</BodyText>
        </TouchableOpacity>
      </View>

      {/* Achievements */}
      <Subheading style={s.sectionTitle}>Achievements</Subheading>
      <View style={[s.achievementsContainer, s.shadow]}>
        <View style={s.achievementsGrid}>
          {achievements.map((item) => (
            <View key={item.id} style={s.achievementCard}>
              <FontAwesome5 name={item.icon} size={28} color={item.color} />
              {/* Custom BodyText */}
              <BodyText style={s.achievementLabel}>{item.label}</BodyText>
            </View>
          ))}
        </View>

        {/* Thermometer */}
        <View style={s.thermometerContainer}>
          <View style={s.thermometerLabel}>
            {/* Custom BodyText */}
            <BodyText style={s.thermometerText}>Next: 30 Day Streak</BodyText>
            {/* Custom Subheading */}
            <Subheading style={s.thermometerProgress}>7/30</Subheading>
          </View>
          <View style={[s.thermometerBar, s.shadow]}>
            <View style={[s.thermometerFill, { width: "23%" }]} />
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={s.tabsContainer}>
        {["Pins", "Boards", "Journals", "Gratitude"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[s.tabButton, activeTab === tab && s.tabButtonActive]}
            onPress={() => setActiveTab(tab)}
          >
            {/* Custom BodyText */}
            <BodyText style={[s.tabLabel, activeTab === tab && s.tabLabelActive]}>{tab}</BodyText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content - Pins */}
      {activeTab === "Pins" && (
        <View style={s.gridContainer}>
          {/* Left Column */}
          <View style={s.column}>
            {leftImages.map((item) => (
              <TouchableOpacity key={item.id}>
                <Image source={item.image} style={[s.image, { height: item.height }]} />
              </TouchableOpacity>
            ))}
          </View>
          {/* Right Column */}
          <View style={s.column}>
            {rightImages.map((item) => (
              <TouchableOpacity key={item.id}>
                <Image source={item.image} style={[s.image, { height: item.height }]} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      {/* Tab Content - Other Tabs (Using BodyText for content) */}
      {activeTab === "Boards" && (
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <BodyText style={{ fontSize: 16, color: "#999", textAlign: "center", paddingVertical: 40 }}>
            Boards content coming soon
          </BodyText>
        </View>
      )}
      {activeTab === "Journals" && (
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <BodyText style={{ fontSize: 16, color: "#999", textAlign: "center", paddingVertical: 40 }}>
            Journals content coming soon
          </BodyText>
        </View>
      )}
      {activeTab === "Gratitude" && (
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <BodyText style={{ fontSize: 16, color: "#999", textAlign: "center", paddingVertical: 40 }}>
            Gratitude content coming soon
          </BodyText>
        </View>
      )}

      {/* This Week's Mood */}
      <Subheading style={s.sectionTitle}>This Week's Mood</Subheading>
      <View style={[s.moodContainer, s.shadow]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.moodScrollContent}>
          {moods.map((item) => (
            <View key={item.id} style={s.moodItem}>
              {/* Mood Image */}
              <Image source={item.emoji} style={s.moodEmoji} /> 
              {/* Mood Name */}
              <BodyText style={s.moodLabel}>
                {item.label}
              </BodyText>             
              {/* Day */}
              <BodyText style={s.moodDay}>
                {item.day}
              </BodyText>
            </View>
          ))}
        </ScrollView>
        
        {/* Separator for Most Common Mood section */}
        <View style={s.moodSeparator} />

        {/* Most Common Mood */}
        <View style={s.mostCommonContainer}>
          <Image source={require("../(tabs)/assets/images/Great Emote.png")} style={s.mostCommonEmoji} />
          {/* Custom BodyText */}
          <BodyText style={s.mostCommonLabel}>Most Common</BodyText>
          {/* Custom Subheading */}
          <Subheading style={s.mostCommonMood}>Great</Subheading>
        </View>
      </View>

      {/* Bottom Actions */}
      <View style={s.bottomActions}>
        <TouchableOpacity style={[s.actionButton, s.shadow]}>
          <FontAwesome5 name="cog" size={20} color="#666" />
          {/* Custom BodyText */}
          <BodyText style={s.actionLabel}>Settings</BodyText>
        </TouchableOpacity>
        <TouchableOpacity style={[s.actionButton, s.shadow]}>
          <FontAwesome5 name="sign-out-alt" size={20} color="#FF6B6B" />
          {/* Custom BodyText */}
          <BodyText style={[s.actionLabel, { color: "#FF6B6B" }]}>Log out</BodyText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  container: { // General styles
    flex: 1,
    backgroundColor: "#FFF5F7",
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: 300,
    opacity: 0.7,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: { // Profile Header
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E8D5E8",
    borderWidth: 3,
    borderColor: "#FFB6C1",
    marginBottom: 12,
  },
  profileName: {
    fontSize: 24,
    color: "#333",
    marginBottom: 8,
  },
  profileTagline: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    marginHorizontal: 20,
    marginBottom: 16,
  },
  editButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: "#FFB6C1",
    borderRadius: 20,
  },
  editButtonText: {
    color: "#FFF",
    fontSize: 16,
  },
  sectionTitle: { // Achievements Section
    fontSize: 18,
    color: "#333",
    marginBottom: 12,
    marginHorizontal: 16,
  },
  achievementsContainer: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0E0F0",
    marginHorizontal: 16,
    marginBottom: 24,
  },
  achievementsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  achievementCard: {
    alignItems: "center",
    backgroundColor: "#FFE8F0",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    width: "30%",
    borderWidth: 1,
    borderColor: "#FFD0E0",
  },
  achievementLabel: {
    fontSize: 14,
    color: "#333",
    marginTop: 8,
    textAlign: "center",
  },
  thermometerContainer: { // Thermometer (Streak Progress Bar)
    borderTopWidth: 1,
    borderTopColor: "#F0E0F0",
    paddingTop: 12,
  },
  thermometerLabel: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  thermometerText: {
    fontSize: 15,
    color: "#333",
  },
  thermometerProgress: {
    fontSize: 15,
    color: "#FFB6C1",
  },
  thermometerBar: {
    height: 8,
    backgroundColor: "#F0E0F0",
    borderRadius: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8D5E8",
  },
  thermometerFill: {
    height: "100%",
    backgroundColor: "#FFB6C1",
    borderRadius: 4,
  },
  tabsContainer: {  // Tabs (Pins, Boards, etc.)
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0E0F0",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: {
    borderBottomColor: "#FFB6C1",
  },
  tabLabel: {
    fontSize: 18,
    color: "#999",
  },
  tabLabelActive: {
    color: "#FFB6C1",
  },
  gridContainer: {  // Tab Content (Pin Grid)
    flexDirection: "row",
    paddingHorizontal: 10,
    marginBottom: 24,
    gap: 8,
  },
  column: {
    flex: 1,
    gap: 8,
  },
  image: {
    width: "100%",
    borderRadius: 10,
    resizeMode: "cover",
  },
  moodContainer: {  // Mood Section Scroll Styles
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    paddingBottom: 24, 
    borderWidth: 1,
    borderColor: "#F0E0F0",
    marginHorizontal: 16,
    marginBottom: 24,
  },
  moodScrollContent: {
    flexDirection: 'row',
    paddingHorizontal: 8, 
    paddingTop: 10,
  },
  moodItem: {
    alignItems: 'center',
    width: 80, 
    marginHorizontal: 4, 
  },
  moodEmoji: {
    width: 60, // Adjusted size to fit fixed width item
    height: 60,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 13,
    color: "#D14D72", // Using the primary color
    textAlign: "center",
    marginBottom: 4,
  },
  moodDay: {
    fontSize: 14,
    color: "#999",
    marginBottom: 12,
  },
  moodSeparator: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0E0F0",
    marginHorizontal: -16, // Extend separator across the full container width
  },
  mostCommonContainer: {
    alignItems: "center",
    marginTop: 18,
  },
  mostCommonEmoji: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  mostCommonLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  mostCommonMood: {
    fontSize: 14,
    color: "#FFB6C1",
  },
  bottomActions: {  // Bottom Actions (Settings, Logout)
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
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
  },
  actionLabel: {
    fontSize: 14,
    color: "#666",
  },
})