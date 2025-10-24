"use client"
import React, { useEffect, useRef } from 'react'
import { View, Animated, StyleSheet, Dimensions, Platform } from 'react-native'

const COLORS = { frame: '#FCC8D1', splash: '#D14D72' }

export default function SplashScreen({ onFinish }) {
  const { width: W, height: H } = Dimensions.get('window')
  const big = Math.max(W, H) * 1.8 // large size that will cover screen when scale=1

  const logoScale = useRef(new Animated.Value(9 / 217)).current
  const logoOpacity = useRef(new Animated.Value(0)).current

  const outerScale = useRef(new Animated.Value(0)).current
  const outerOpacity = useRef(new Animated.Value(0)).current
  const middleScale = useRef(new Animated.Value(0)).current
  const middleOpacity = useRef(new Animated.Value(0)).current
  const innerScale = useRef(new Animated.Value(0)).current
  const innerOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // logo grows first
    const logoAnim = Animated.parallel([
      Animated.timing(logoScale, { toValue: 1, duration: 1100, useNativeDriver: true }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 900, useNativeDriver: true }),
    ])

    // ellipses grow/fade to cover screen — start shortly after logo begins, staggered but not waiting outer to finish
    const outerAnimSeq = Animated.sequence([Animated.delay(260), Animated.parallel([
      Animated.timing(outerScale, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(outerOpacity, { toValue: 0.32, duration: 700, useNativeDriver: true }),
    ])])

    const middleAnimSeq = Animated.sequence([Animated.delay(360), Animated.parallel([
      Animated.timing(middleScale, { toValue: 1, duration: 850, useNativeDriver: true }),
      Animated.timing(middleOpacity, { toValue: 0.5, duration: 650, useNativeDriver: true }),
    ])])

    const innerAnimSeq = Animated.sequence([Animated.delay(440), Animated.parallel([
      Animated.timing(innerScale, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(innerOpacity, { toValue: 0.75, duration: 600, useNativeDriver: true }),
    ])])

    Animated.parallel([logoAnim, outerAnimSeq, middleAnimSeq, innerAnimSeq]).start(() => {
      setTimeout(() => onFinish?.(), 600)
    })
  }, [logoScale, logoOpacity, outerScale, outerOpacity, middleScale, middleOpacity, innerScale, innerOpacity, onFinish])

  const centerStyle = (size) => ({
    position: 'absolute',
    width: size,
    height: size,
    borderRadius: size / 2,
    top: H / 2 - size / 2,
    left: W / 2 - size / 2,
  })

  return (
    <View style={[styles.container, { backgroundColor: COLORS.frame }]}>
      <Animated.View
        style={[
          centerStyle(big),
          { backgroundColor: COLORS.splash, transform: [{ scale: outerScale }], opacity: outerOpacity },
          Platform.select({ ios: { shadowColor: COLORS.splash, shadowOpacity: 0.35, shadowRadius: 30 }, android: { elevation: 12 } }),
        ]}
      />
      <Animated.View
        style={[
          centerStyle(big * 0.95),
          { backgroundColor: COLORS.splash, transform: [{ scale: middleScale }], opacity: middleOpacity },
          Platform.select({ ios: { shadowColor: COLORS.splash, shadowOpacity: 0.38, shadowRadius: 24 }, android: { elevation: 10 } }),
        ]}
      />
      <Animated.View
        style={[
          centerStyle(big * 0.7),
          { backgroundColor: COLORS.splash, transform: [{ scale: innerScale }], opacity: innerOpacity },
          Platform.select({ ios: { shadowColor: COLORS.splash, shadowOpacity: 0.45, shadowRadius: 16 }, android: { elevation: 8 } }),
        ]}
      />

      <Animated.Image
        source={require('../../assets/images/logo.png')}
        style={{
          width: 300,
          height: 300,
          position: 'absolute',
          transform: [{ scale: logoScale }],
          opacity: logoOpacity,
        }}
        resizeMode="contain"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
})