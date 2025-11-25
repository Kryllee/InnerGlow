"use client"
import React, { useEffect, useRef } from 'react'
import { View, Animated, StyleSheet, Dimensions, Platform } from 'react-native'

const PINK_LIGHT = '#FCC8D1'
const PINK_DARK = '#D14D72'

export default function SplashScreen({ onFinish }) {
  const screenWidth = Dimensions.get('window').width
  const screenHeight = Dimensions.get('window').height
  const bigCircleSize = Math.max(screenWidth, screenHeight) * 1.8

  const logoScale = useRef(new Animated.Value(0.04)).current
  const logoOpacity = useRef(new Animated.Value(0)).current
  const outerCircleScale = useRef(new Animated.Value(0)).current
  const outerCircleOpacity = useRef(new Animated.Value(0)).current
  const middleCircleScale = useRef(new Animated.Value(0)).current
  const middleCircleOpacity = useRef(new Animated.Value(0)).current
  const innerCircleScale = useRef(new Animated.Value(0)).current
  const innerCircleOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const logoAnimation = Animated.parallel([
      Animated.timing(logoScale, { toValue: 1, duration: 1100, useNativeDriver: true }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 900, useNativeDriver: true }),
    ])

    const outerCircleAnimation = Animated.sequence([
      Animated.delay(260),
      Animated.parallel([
        Animated.timing(outerCircleScale, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(outerCircleOpacity, { toValue: 0.32, duration: 700, useNativeDriver: true }),
      ])
    ])

    const middleCircleAnimation = Animated.sequence([
      Animated.delay(360),
      Animated.parallel([
        Animated.timing(middleCircleScale, { toValue: 1, duration: 850, useNativeDriver: true }),
        Animated.timing(middleCircleOpacity, { toValue: 0.5, duration: 650, useNativeDriver: true }),
      ])
    ])

    const innerCircleAnimation = Animated.sequence([
      Animated.delay(440),
      Animated.parallel([
        Animated.timing(innerCircleScale, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(innerCircleOpacity, { toValue: 0.75, duration: 600, useNativeDriver: true }),
      ])
    ])

    Animated.parallel([logoAnimation, outerCircleAnimation, middleCircleAnimation, innerCircleAnimation]).start(() => {
      setTimeout(() => {
        if (onFinish) {
          onFinish()
        }
      }, 600)
    })
  }, [])

  const getCenterPosition = (circleSize) => {
    const top = screenHeight / 2 - circleSize / 2
    const left = screenWidth / 2 - circleSize / 2
    return {
      position: 'absolute',
      width: circleSize,
      height: circleSize,
      borderRadius: circleSize / 2,
      top: top,
      left: left,
    }
  }

  const iosShadow = { shadowColor: PINK_DARK, shadowOpacity: 0.35, shadowRadius: 30 }
  const androidShadow = { elevation: 12 }

  return (
    <View style={styles.container}>
      <Animated.View style={[getCenterPosition(bigCircleSize), { backgroundColor: PINK_DARK, opacity: outerCircleOpacity, transform: [{ scale: outerCircleScale }] }, Platform.OS === 'ios' ? iosShadow : androidShadow]} />
      <Animated.View style={[getCenterPosition(bigCircleSize * 0.95), { backgroundColor: PINK_DARK, opacity: middleCircleOpacity, transform: [{ scale: middleCircleScale }] }, Platform.OS === 'ios' ? iosShadow : androidShadow]} />
      <Animated.View style={[getCenterPosition(bigCircleSize * 0.7), { backgroundColor: PINK_DARK, opacity: innerCircleOpacity, transform: [{ scale: innerCircleScale }] }, Platform.OS === 'ios' ? iosShadow : androidShadow]} />
      <Animated.Image source={require('../../assets/images/logo.png')} style={{ width: 300, height: 300, position: 'absolute', opacity: logoOpacity, transform: [{ scale: logoScale }] }} resizeMode="contain" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { // Main container
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PINK_LIGHT,
  },
})