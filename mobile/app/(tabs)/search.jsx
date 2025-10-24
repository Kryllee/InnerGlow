import React, { useRef, useState } from 'react';
import { View, ScrollView, Image, Dimensions, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Subheading, BodyText } from '../components/CustomText'; 


const { width } = Dimensions.get('window');

const topImages = [
  require('../(tabs)/assets/images/top1.png'),
  require('../(tabs)/assets/images/top2.png'),
  require('../(tabs)/assets/images/top3.png'),
];

const lowerImages1 = [
  require('../(tabs)/assets/images/id1.png'),
  require('../(tabs)/assets/images/id2.png'),
];

const lowerImages2 = [
  require('../(tabs)/assets/images/wong1.png'),
  require('../(tabs)/assets/images/wong2.png'),
  require('../(tabs)/assets/images/wong3.png'),
  require('../(tabs)/assets/images/wong4.png'),
  require('../(tabs)/assets/images/wong5.png'),
];

const lowerImages3 = [
  require('../(tabs)/assets/images/b1.png'),
  require('../(tabs)/assets/images/b2.png'),
  require('../(tabs)/assets/images/b3.png'),
  require('../(tabs)/assets/images/b4.png'),
  require('../(tabs)/assets/images/b5.png'),
];

const Search = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const topScrollRef = useRef(null);

  const onTopMomentumScrollEnd = (e) => {
    const x = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(x / width);
    setActiveIndex(newIndex);
  };

  return (
    <View style={s.container1}>
      {/* Search Bar */}
      <View style={s.searchBar}>
        <Ionicons name="search" size={21} color="black" />
        <TextInput
          style={s.searchInput}
          placeholder="Search for ideas"
          placeholderTextColor="#777"
        />
        <TouchableOpacity style={s.iconTouchable}>
          <Ionicons name="camera-outline" size={22} color="black" />
        </TouchableOpacity>
      </View>

      <View style={s.container2}>
        <ScrollView style={{ flex: 1, backgroundColor: '#fef2f4' }}>
          
          <View style={s.container3}>
            {/* Top Slider */}
            <ScrollView
              ref={topScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onTopMomentumScrollEnd}
            >
              {topImages.map((img, index) => (
                <TouchableOpacity key={index}>
                  <Image source={img} style={s.slideImage} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Pagination Dots */}
            <View style={s.pagination}>
              {topImages.map((_, i) => (
                <View
                  key={i}
                  style={[
                    s.dot,
                    i === activeIndex ? s.dotActive : s.dotInactive,
                  ]}
                />
              ))}
            </View>

            {/* Trending Text */}
            <View style={s.topText}>
              {/* BodyText for smaller label */}
              <BodyText style={s.trendingLabel}>Trending now</BodyText>
              {/* Subheading for main title */}
              <Subheading style={s.trendingTitle}>Soft glam makeup</Subheading>
            </View>
          </View>

          {/* Ideas 1 */}
          <View style={s.sectionContainer}>
            {/* BodyText for introductory text */}
            <BodyText style={s.sectionIntroText}>
              Explore featured boards
            </BodyText>
            {/* Subheading for section title */}
            <Subheading style={s.sectionTitle}>
              Ideas you might like
            </Subheading>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.horizontalScroll}>
              {lowerImages1.map((img, index) => (
              <TouchableOpacity key={index}>
                <Image source={img} style={s.idea} />
              </TouchableOpacity> 
              ))}
            </ScrollView>
          </View>

          {/* Ideas 2 (Wonyoungism) */}
          <View style={s.sectionContainer}>
            {/* BodyText for introductory text */}
            <BodyText style={s.sectionIntroText}>
              Ideas for you
            </BodyText>
            {/* Subheading for section title */}
            <Subheading style={s.sectionTitle}>
              Wonyoungism
            </Subheading>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.horizontalScroll}>
              {lowerImages2.map((img, index) => (
              <TouchableOpacity key={index}>
                <Image source={img} style={s.smallImage} />
              </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Ideas 3 (Bible Verse) */}
          <View style={s.sectionContainer}>
            {/* BodyText for introductory text */}
            <BodyText style={s.sectionIntroText}>
              Ideas for you
            </BodyText>
            {/* Subheading for section title */}
            <Subheading style={s.sectionTitle}>
              Bible Verse
            </Subheading>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.horizontalScroll}>
              {lowerImages3.map((img, index) => (
              <TouchableOpacity key={index}>
                <Image source={img} style={s.smallImage} />
              </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};


const s = StyleSheet.create({
  container1: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: '#ffffffff',
  },
  container2: {
    flex: 1,
  },
  container3: {
    height: 325,
    width: '100%',
    backgroundColor: '#fef2f4',
  },
  
  // Search Bar
  searchBar: {
    height: 45,
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    fontStyle: 'italic',
    fontSize: 16,
    color: '#000',
    paddingHorizontal: 5,
  },
  iconTouchable: {
    padding: 5,
  },

  // Top Slider and Text
  slideImage: {
    width: width,
    height: 300,
    resizeMode: 'cover',
  },
  topText: {
    position: 'absolute',
    top: 245,
    left: 15,
  },
  trendingLabel: { 
    color: 'white',
    fontSize: 14, 
  },
  trendingTitle: { 
    fontSize: 18, 
    color: 'white' 
  },
  
  // Pagination
  pagination: {
    position: 'absolute',
    bottom: 1,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    marginHorizontal: 5,
  },
  dotActive: { backgroundColor: '#d14d72', opacity: 1 },
  dotInactive: { backgroundColor: '#999999ff', opacity: 0.35 },

  // Content Sections
  sectionContainer: { 
    backgroundColor: '#fef2f4', 
    paddingVertical: 8
  },
  sectionIntroText: { 
    fontSize: 14, 
    marginLeft: 15, 
    marginTop: 5 
  },
  sectionTitle: {
    fontSize: 18, 
    marginHorizontal: 15, 
    marginBottom: 8
  },
  horizontalScroll: { 
    paddingLeft: 15 
  },
  smallImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginRight: 12,
  },
  idea: {
    width: 200,
    height: 180,
    borderRadius: 10,
    marginRight: 12,
  },
});
export default Search;