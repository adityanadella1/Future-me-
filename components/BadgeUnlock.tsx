import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors, fonts, radii } from '@/constants/theme';
import type { Badge } from '@/lib/types';

const CONFETTI_COLORS = [colors.today, colors.tomorrow, colors.week, colors.someday, colors.gold];

export function BadgeUnlock({ badge, onDone }: { badge: Badge | null; onDone: () => void }) {
  const ringScale = useSharedValue(0);
  const medalScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    if (!badge) return;
    ringScale.value = 0;
    medalScale.value = 0;
    contentOpacity.value = 0;
    ringScale.value = withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) });
    medalScale.value = withDelay(120, withSequence(withTiming(1.15, { duration: 260 }), withTiming(1, { duration: 140 })));
    contentOpacity.value = withDelay(200, withTiming(1, { duration: 300 }));
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [badge, ringScale, medalScale, contentOpacity, onDone]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: 1 - ringScale.value * 0.4,
  }));
  const medalStyle = useAnimatedStyle(() => ({ transform: [{ scale: medalScale.value }] }));
  const contentStyle = useAnimatedStyle(() => ({ opacity: contentOpacity.value }));

  if (!badge) return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      <View style={styles.center}>
        <Animated.View style={[styles.ring, ringStyle]} />
        <Animated.View style={[styles.medal, medalStyle]}>
          <Text style={styles.emoji}>{badge.emoji}</Text>
        </Animated.View>
        <Animated.View style={contentStyle}>
          <Text style={styles.label}>BADGE UNLOCKED</Text>
          <Text style={styles.name}>{badge.name}</Text>
        </Animated.View>
        {CONFETTI_COLORS.map((color, i) => (
          <ConfettiPiece key={i} color={color} index={i} />
        ))}
      </View>
    </View>
  );
}

function ConfettiPiece({ color, index }: { color: string; index: number }) {
  const progress = useSharedValue(0);
  const angle = (index / CONFETTI_COLORS.length) * Math.PI * 2;
  const distance = 70 + (index % 3) * 20;

  useEffect(() => {
    progress.value = withDelay(150, withTiming(1, { duration: 700, easing: Easing.out(Easing.quad) }));
  }, [progress]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: Math.cos(angle) * distance * progress.value },
      { translateY: Math.sin(angle) * distance * progress.value + progress.value * 40 },
      { rotate: `${progress.value * 280}deg` },
    ],
    opacity: 1 - progress.value,
  }));

  return <Animated.View style={[styles.confetti, { backgroundColor: color }, style]} />;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00000099',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  center: { alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.gold,
  },
  medal: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emoji: { fontSize: 40 },
  label: { fontFamily: fonts.bodySemiBold, fontSize: 12, color: colors.gold, letterSpacing: 1, textAlign: 'center' },
  name: { fontFamily: fonts.display, fontSize: 22, color: '#fff', marginTop: 6, textAlign: 'center' },
  confetti: { position: 'absolute', width: 8, height: 8, borderRadius: radii.sm },
});
