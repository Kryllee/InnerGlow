import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from "expo-router";
import { useState } from "react";
import { Pressable, Modal, View, StyleSheet, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { FontAwesome } from '@expo/vector-icons';
import { Subheading, BodyText } from '../components/CustomText';
import Create from './create';
import Gratitude from '../components/Gratitude';

export default function TabLayout() {
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  const handleJournalClick = () => {
    setSelectedType('journal');
    setShowModal(false);
  };

  const handleGratitudeClick = () => {
    setSelectedType('gratitude');
    setShowModal(false);
  };

  const handleCloseJournal = () => {
    setSelectedType(null);
  };

  const handleCloseGratitude = () => {
    setSelectedType(null);
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#d14d72",
          tabBarStyle: {
            borderTopWidth: 1,
            borderTopColor: "black",
            height: 100,
            paddingBottom: 30,
            paddingTop: 10,
          },
          tabBarLabelStyle: {
            fontSize: 12,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Search",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: "Create",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="add-outline" size={size} color={color} />
            ),
            tabBarButton: (props) => (
              <Pressable
                {...props}
                onPress={(e) => {
                  e.preventDefault();
                  setShowModal(true);
                }}
                android_ripple={null}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: "progress",
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="line-chart" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>

      <Modal
        transparent
        visible={showModal}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setShowModal(false)}
          />
          <View style={styles.modalContent}>
            <Subheading style={styles.modalTitle}>Start creating now</Subheading>
            <View style={styles.boxesContainer}>
              <TouchableOpacity style={styles.modalBox}>
                <View style={styles.boxContent}>
                  <MaterialCommunityIcons name="pin-outline" size={24} color="#d14d72" />
                  <BodyText style={styles.boxText}>Pin</BodyText>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalBox} onPress={handleJournalClick}>
                <View style={styles.boxContent}>
                  <MaterialCommunityIcons name="book-open-page-variant-outline" size={24} color="#d14d72" />
                  <BodyText style={styles.boxText}>Journal</BodyText>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalBox} onPress={handleGratitudeClick}>
                <View style={styles.boxContent}>
                  <MaterialCommunityIcons name="cards-playing-heart-multiple-outline" size={24} color="#d14d72" />
                  <BodyText style={styles.boxText}>Gratitude</BodyText>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={selectedType === 'journal'}
        animationType="slide"
        onRequestClose={handleCloseJournal}
      >
        <Create onClose={handleCloseJournal} />
      </Modal>

      <Modal
        visible={selectedType === 'gratitude'}
        animationType="slide"
        onRequestClose={handleCloseGratitude}
      >
        <Gratitude onClose={handleCloseGratitude} />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fef2f4",
    padding: 15,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    height: "35%",
  },
  modalTitle: {
    fontSize: 18,
    color: "#000",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 25,
  },
  boxesContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  modalBox: {
    width: 90,
    height: 80,
    backgroundColor: "#fff",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#d14d72",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  boxContent: {
    alignItems: "center",
  },
  boxText: {
    fontSize: 12,
    color: "#000000ff",
    marginTop: 5,
  },
});