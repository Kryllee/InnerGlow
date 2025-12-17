import React, { useRef, useState, useEffect } from 'react';
import { View, ScrollView, Image, Dimensions, TextInput, TouchableOpacity, StyleSheet, FlatList, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Subheading, BodyText } from '../components/CustomText';
import { MOCK_PINS } from '../data/pins';
import { useUser } from '../context/UserContext';
import { API_BASE_URL } from '../config';

const { width } = Dimensions.get('window');

const Search = () => {
  const router = useRouter();
  const { token } = useUser();
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const topScrollRef = useRef(null);

  // Debounced Search Effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchText.trim()) {
        performSearch(searchText);
      } else {
        setSearchResults([]);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [searchText]);

  const performSearch = async (query) => {
    setSearching(true);
    try {
      const res = await fetch(`${API_BASE_URL}/pins?search=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Transform if needed (backend matches UI structure mostly)
        // UI expects: id, image, board, description. 
        // Backend returns: _id, images[{url}], board, description, title
        const transformed = data.map(p => ({
          id: p._id,
          image: { uri: p.images[0]?.url },
          description: p.title || p.description,
          board: p.board
        }));
        setSearchResults(transformed);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  };


  const onTopMomentumScrollEnd = (e) => {
    const x = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(x / width);
    setActiveIndex(newIndex);
  };

  // Filtered Data for Sections
  const trendingPins = MOCK_PINS.filter(p => p.board === 'Trending');
  const wonyoungismPins = MOCK_PINS.filter(p => p.board === 'Wonyoungism');
  const faithPins = MOCK_PINS.filter(p => p.board === 'Faith');

  // "Ideas you might like" - mixing some other boards or picking specific IDs
  // Original code used id1.png (id:1) and id2.png (id:2)
  // "Ideas you might like" - mixing some other boards or picking specific IDs
  // Original code used id1.png (id:1) and id2.png (id:2)
  const featuredPins = MOCK_PINS.filter(p => [1, 2].includes(p.id));

  // Remove local filtering - we use searchResults state now

  const handlePinPress = (id) => {
    router.push({ pathname: '/pin-detail', params: { id } });
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
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText ? (
          <TouchableOpacity onPress={() => setSearchText('')} style={s.iconTouchable}>
            <Ionicons name="close-circle" size={22} color="#999" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={s.iconTouchable}>
            <Ionicons name="camera-outline" size={22} color="black" />
          </TouchableOpacity>
        )}
      </View>

      <View style={s.container2}>
        {searchText ? (
          // Search Results View
          <FlatList
            data={searchResults}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={s.searchResultsRow}
            contentContainerStyle={s.searchResultsContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={s.emptyState}>
                <BodyText style={{ color: '#666', textAlign: 'center' }}>
                  {searching ? "Searching..." : `No results found for "${searchText}"`}
                </BodyText>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handlePinPress(item.id)} style={s.searchResultItem}>
                <Image source={item.image} style={s.searchResultImage} />
              </TouchableOpacity>
            )}
          />
        ) : (
          // Default Categorized View
          <ScrollView style={{ flex: 1, backgroundColor: '#fef2f4' }}>

            <View style={s.container3}>
              {/* Top Slider (Trending) */}
              <ScrollView
                ref={topScrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onTopMomentumScrollEnd}
              >
                {trendingPins.map((pin) => (
                  <TouchableOpacity key={pin.id} onPress={() => handlePinPress(pin.id)}>
                    <Image source={pin.image} style={s.slideImage} />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Pagination Dots */}
              <View style={s.pagination}>
                {trendingPins.map((_, i) => (
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
                <BodyText style={s.trendingLabel}>Trending now</BodyText>
                <Subheading style={s.trendingTitle}>Soft glam makeup</Subheading>
              </View>
            </View>

            {/* Ideas 1 (Featured) */}
            <View style={s.sectionContainer}>
              <BodyText style={s.sectionIntroText}>Explore featured boards</BodyText>
              <Subheading style={s.sectionTitle}>Ideas you might like</Subheading>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.horizontalScroll}>
                {featuredPins.map((pin) => (
                  <TouchableOpacity key={pin.id} onPress={() => handlePinPress(pin.id)}>
                    <Image source={pin.image} style={s.idea} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Ideas 2 (Wonyoungism) */}
            <View style={s.sectionContainer}>
              <BodyText style={s.sectionIntroText}>Ideas for you</BodyText>
              <Subheading style={s.sectionTitle}>Wonyoungism</Subheading>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.horizontalScroll}>
                {wonyoungismPins.map((pin) => (
                  <TouchableOpacity key={pin.id} onPress={() => handlePinPress(pin.id)}>
                    <Image source={pin.image} style={s.smallImage} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Ideas 3 (Bible Verse / Faith) */}
            <View style={s.sectionContainer}>
              <BodyText style={s.sectionIntroText}>Ideas for you</BodyText>
              <Subheading style={s.sectionTitle}>Bible Verse</Subheading>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.horizontalScroll}>
                {faithPins.map((pin) => (
                  <TouchableOpacity key={pin.id} onPress={() => handlePinPress(pin.id)}>
                    <Image source={pin.image} style={s.smallImage} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </ScrollView>
        )}
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
    backgroundColor: '#fef2f4',
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
    top: 40,
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
  // Search Results
  searchResultsContainer: {
    paddingTop: 65, // Add padding to push content below the absolute search bar
    paddingHorizontal: 10,
    paddingBottom: 20
  },
  searchResultsRow: {
    justifyContent: 'space-between',
  },
  searchResultItem: {
    width: (width - 30) / 2,
    height: 200,
    marginBottom: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  searchResultImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  emptyState: {
    flex: 1,
    marginTop: 100, // Push down below search bar
    justifyContent: 'center',
    alignItems: 'center',
  }
});
export default Search;