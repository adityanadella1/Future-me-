import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { boardTint, colors, fonts, shadow } from '@/constants/theme';
import { rectsIntersect, useBinZone, type Rect } from '@/lib/binZone';
import { fireHaptic } from '@/lib/haptics';
import type { Task } from '@/lib/types';

const SWIPE_THRESHOLD = 110;
const SETTLE = Easing.bezier(0.22, 1, 0.36, 1);

function logDropDebug(px: number, py: number, bin: Rect, hit: boolean, origin: Rect) {
  console.log('DROP_DEBUG', JSON.stringify({ px, py, bin, hit, origin }));
}

export function StickyNote({
  task,
  hapticsEnabled,
  onComplete,
  onDoLater,
  onDelete,
  onPress,
}: {
  task: Task;
  hapticsEnabled: boolean;
  onComplete: (id: string) => void;
  onDoLater: (id: string) => void;
  onDelete: (id: string) => void;
  onPress: (task: Task) => void;
}) {
  const { binRect, binActive } = useBinZone();
  const [crumpledJS, setCrumpledJS] = useState(false);
  const rotationSeed = useMemo(() => (Math.random() * 6 - 3).toFixed(2), [task.id]);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const crumple = useSharedValue(0);
  const isCrumpled = useSharedValue(0);
  const gone = useSharedValue(false);

  const origin = useSharedValue<Rect>({ x: 0, y: 0, width: 0, height: 0 });
  const viewRef = useRef<View>(null);

  const measure = () => {
    viewRef.current?.measureInWindow((x, y, width, height) => {
      origin.value = { x, y, width, height };
    });
  };

  const springBack = () => {
    'worklet';
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    crumple.value = withTiming(0, { duration: 200 });
    isCrumpled.value = 0;
    binActive.value = withTiming(0, { duration: 180 });
    runOnJS(setCrumpledJS)(false);
  };

  const confirmDelete = () => {
    'worklet';
    const rect = origin.value;
    translateX.value = withTiming(binRect.value.x + binRect.value.width / 2 - rect.x - rect.width / 2, {
      duration: 180,
    });
    translateY.value = withTiming(
      binRect.value.y + binRect.value.height / 2 - rect.y - rect.height / 2,
      { duration: 180 },
      (finished) => {
        if (finished) {
          gone.value = true;
          runOnJS(onDelete)(task.id);
        }
      }
    );
    crumple.value = withTiming(1.4, { duration: 180 });
    binActive.value = withTiming(0, { duration: 200 });
    runOnJS(fireHaptic)(hapticsEnabled, 'heavy');
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (isCrumpled.value) {
        translateX.value = e.translationX;
        translateY.value = e.translationY;
      } else {
        translateX.value = e.translationX;
      }
    })
    .onEnd((e) => {
      if (isCrumpled.value) {
        const rect = origin.value;
        const px = rect.x + rect.width / 2 + translateX.value;
        const py = rect.y + rect.height / 2 + translateY.value;
        const hit = binRect.value.width > 0 && rectsIntersect(px, py, binRect.value);
        runOnJS(logDropDebug)(Math.round(px), Math.round(py), binRect.value, hit, rect);
        if (hit) {
          confirmDelete();
        } else {
          runOnJS(fireHaptic)(hapticsEnabled, 'light');
          springBack();
        }
        return;
      }
      if (e.translationX <= -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-500, { duration: 300, easing: Easing.inOut(Easing.cubic) });
        runOnJS(fireHaptic)(hapticsEnabled, 'light');
        runOnJS(onDoLater)(task.id);
      } else if (e.translationX >= SWIPE_THRESHOLD) {
        translateX.value = withTiming(500, { duration: 260, easing: Easing.out(Easing.cubic) });
        runOnJS(fireHaptic)(hapticsEnabled, 'success');
        runOnJS(onComplete)(task.id);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const longPress = Gesture.LongPress()
    .minDuration(400)
    .maxDistance(12)
    .onStart(() => {
      isCrumpled.value = 1;
      crumple.value = withTiming(1, { duration: 300, easing: SETTLE });
      binActive.value = withTiming(1, { duration: 220 });
      runOnJS(setCrumpledJS)(true);
      runOnJS(fireHaptic)(hapticsEnabled, 'medium');
    });

  const composed = Gesture.Simultaneous(pan, longPress);

  const cardStyle = useAnimatedStyle(() => {
    const scale = 1 - crumple.value * 0.65;
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${(1 - crumple.value) * Number(rotationSeed)}deg` },
        { scaleX: scale },
        { scaleY: scale },
      ],
      opacity: gone.value ? 0 : 1,
      borderRadius: 22 + crumple.value * 40,
    };
  });

  const contentStyle = useAnimatedStyle(() => ({
    opacity: 1 - crumple.value,
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View
        ref={viewRef}
        onLayout={measure}
        style={[styles.card, { backgroundColor: boardTint[task.board] }, shadow.note, cardStyle]}
      >
        <Animated.View style={[styles.tape, contentStyle]} />
        <Animated.View style={contentStyle}>
          <Pressable onPress={() => onPress(task)} disabled={crumpledJS}>
            <View style={styles.headerRow}>
              <Text style={[styles.eyebrow, { color: boardColorFor(task.board) }]}>
                {task.time ? task.time.toUpperCase() : 'ANYTIME'}
              </Text>
            </View>
            <Text style={styles.title}>{task.title}</Text>
            <Text style={styles.note}>{task.note || 'Hold to crumple & discard'}</Text>
          </Pressable>
          <View style={styles.actionsRow}>
            <Text style={styles.hintLeft}>{'<'} Do later</Text>
            <Text style={styles.hintRight}>Complete {'>'}</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

function boardColorFor(board: Task['board']) {
  return colors[board];
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    padding: 18,
    marginBottom: 16,
  },
  tape: {
    position: 'absolute',
    top: -8,
    left: '50%',
    marginLeft: -22,
    width: 44,
    height: 18,
    backgroundColor: '#FFFFFFB0',
    transform: [{ rotate: '-2deg' }],
    borderRadius: 2,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { fontFamily: fonts.bodySemiBold, fontSize: 12, letterSpacing: 0.5 },
  title: { fontFamily: fonts.display, fontSize: 20, color: colors.ink, marginTop: 6 },
  note: { fontFamily: fonts.body, fontSize: 14, color: colors.ink, opacity: 0.7, marginTop: 4 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  hintLeft: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.ink, opacity: 0.55 },
  hintRight: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.success },
});
