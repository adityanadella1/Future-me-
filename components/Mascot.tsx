import React, { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

type Frame = 'boy_a' | 'boy_b' | 'boy_blink' | 'phone_a' | 'phone_blink';

const SOURCES: Record<Frame, number> = {
  boy_a: require('@/assets/mascot/boy_a.png'),
  boy_b: require('@/assets/mascot/boy_b.png'),
  boy_blink: require('@/assets/mascot/boy_blink.png'),
  phone_a: require('@/assets/mascot/phone_a.png'),
  phone_blink: require('@/assets/mascot/phone_blink.png'),
};

// Natural pixel size of each source crop, used to render every pose at the
// same on-screen HEIGHT without distorting its own aspect ratio.
const NATURAL_SIZE: Record<Frame, { w: number; h: number }> = {
  boy_a: { w: 200, h: 215 },
  boy_b: { w: 200, h: 215 },
  boy_blink: { w: 200, h: 215 },
  phone_a: { w: 336, h: 434 },
  phone_blink: { w: 336, h: 434 },
};

const TARGET_HEIGHT = 71;
const MAX_WIDTH = Math.round(TARGET_HEIGHT * (434 / 336)); // widest pose sets the stage size

const FPS = 30;
const FRAME_MS = 1000 / FPS;

function hold(frame: Frame, count: number): Frame[] {
  return Array(count).fill(frame);
}

// Idle: slow breathing cycle with an occasional blink. Loops forever.
const IDLE_SEQUENCE: Frame[] = [
  ...hold('boy_a', 16), ...hold('boy_b', 16),
  ...hold('boy_a', 16), ...hold('boy_b', 16),
  ...hold('boy_a', 6), ...hold('boy_blink', 4), ...hold('boy_a', 6),
  ...hold('boy_a', 16), ...hold('boy_b', 16),
];

// Phone: texting with floating hearts/stars, a happy blink, then it plays out
// and the caller switches back to idle ("puts the phone away").
const PHONE_SEQUENCE: Frame[] = [
  ...hold('phone_a', 60),
  ...hold('phone_blink', 10),
  ...hold('phone_a', 30),
];

const PHONE_TRIGGER_MIN_MS = 30_000;
const PHONE_TRIGGER_MAX_MS = 60_000;

export function Mascot() {
  const [mode, setMode] = useState<'idle' | 'phone'>('idle');
  const [frameIndex, setFrameIndex] = useState(0);
  const sequence = mode === 'idle' ? IDLE_SEQUENCE : PHONE_SEQUENCE;
  const current = sequence[frameIndex];

  // Advance the frame clock at a fixed 30fps tick.
  useEffect(() => {
    const id = setInterval(() => {
      setFrameIndex((i) => {
        const next = i + 1;
        if (next >= sequence.length) {
          if (mode === 'phone') setMode('idle');
          return 0;
        }
        return next;
      });
    }, FRAME_MS);
    return () => clearInterval(id);
  }, [mode, sequence.length]);

  // Randomly start the phone vignette while idle.
  useEffect(() => {
    if (mode !== 'idle') return;
    const delay = PHONE_TRIGGER_MIN_MS + Math.random() * (PHONE_TRIGGER_MAX_MS - PHONE_TRIGGER_MIN_MS);
    const t = setTimeout(() => {
      setMode('phone');
      setFrameIndex(0);
    }, delay);
    return () => clearTimeout(t);
  }, [mode]);

  const size = NATURAL_SIZE[current];
  const width = Math.round(TARGET_HEIGHT * (size.w / size.h));

  return (
    <View style={[styles.stage, { width: MAX_WIDTH }]}>
      {/* All frames stay mounted (just hidden) so swapping never triggers a
          native re-decode — that was the source of the animation-1 flicker. */}
      {(Object.keys(SOURCES) as Frame[]).map((key) => {
        const s = NATURAL_SIZE[key];
        const w = Math.round(TARGET_HEIGHT * (s.w / s.h));
        return (
          <Image
            key={key}
            source={SOURCES[key]}
            resizeMode="contain"
            style={[
              styles.image,
              { width: w, height: TARGET_HEIGHT, opacity: key === current ? 1 : 0 },
            ]}
          />
        );
      })}
      {mode === 'phone' && <Particles anchorX={width * 0.28} />}
    </View>
  );
}

function Particles({ anchorX }: { anchorX: number }) {
  const [particles, setParticles] = useState<{ id: number; kind: 'heart' | 'star' }[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      const kind = Math.random() < 0.5 ? 'heart' : 'star';
      const particleId = nextId.current++;
      setParticles((p) => [...p, { id: particleId, kind }]);
      setTimeout(() => {
        setParticles((p) => p.filter((x) => x.id !== particleId));
      }, 1300);
    }, 550);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {particles.map((p) => (
        <Particle key={p.id} kind={p.kind} anchorX={anchorX} />
      ))}
    </>
  );
}

function Particle({ kind, anchorX }: { kind: 'heart' | 'star'; anchorX: number }) {
  const progress = useSharedValue(0);
  const driftX = useRef((Math.random() - 0.5) * 16).current;

  useEffect(() => {
    progress.value = withTiming(1, { duration: 1300, easing: Easing.out(Easing.quad) });
  }, [progress]);

  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { translateY: -progress.value * 46 },
      { translateX: driftX * progress.value },
      { scale: 0.6 + progress.value * 0.4 },
    ],
  }));

  return (
    <Animated.Image
      source={kind === 'heart' ? require('@/assets/mascot/heart.png') : require('@/assets/mascot/star.png')}
      resizeMode="contain"
      style={[styles.particle, { left: anchorX }, style]}
    />
  );
}

const styles = StyleSheet.create({
  stage: { height: TARGET_HEIGHT, justifyContent: 'flex-end' },
  image: { position: 'absolute', bottom: 0, left: 0 },
  particle: { position: 'absolute', bottom: TARGET_HEIGHT * 0.5, width: 16, height: 16 },
});
