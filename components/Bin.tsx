import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors } from '@/constants/theme';
import { useBinZone } from '@/lib/binZone';

export function Bin() {
  const { binRect, binActive } = useBinZone();
  const ref = useRef<View>(null);

  // Position is measured from this static wrapper so the slide/opacity animation
  // on the inner view can never skew the drop-zone rect mid-transition.
  const innerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withTiming(binActive.value ? 0 : 120, { duration: 220 }) }],
    opacity: withTiming(binActive.value ? 1 : 0, { duration: 180 }),
  }));

  const measure = () => {
    ref.current?.measureInWindow((x, y, width, height) => {
      binRect.value = { x, y, width, height };
    });
  };

  return (
    <View ref={ref} style={styles.bin} pointerEvents="none" onLayout={measure}>
      <Animated.View style={[styles.inner, innerStyle]}>
        <Ionicons name="trash" size={28} color={colors.paper} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  bin: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    width: 72,
    height: 72,
  },
  inner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
