import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

type Frame =
  | 'boy_a' | 'boy_a2' | 'boy_b' | 'boy_blink'
  | 'reach_1' | 'reach_2' | 'reach_3'
  | 'rise_1' | 'rise_2' | 'rise_3' | 'rise_4' | 'rise_5' | 'rise_6'
  | 'text_1' | 'text_2' | 'text_3' | 'text_4' | 'text_blink'
  | 'gear_1' | 'gear_2' | 'gear_3' | 'gear_4' | 'gear_5' | 'gear_6'
  | 'wear_1' | 'wear_2' | 'wear_3'
  | 'hp_drop_1' | 'hp_drop_2' | 'hp_drop_3' | 'hp_drop_4' | 'hp_drop_5' | 'hp_drop_6'
  | 'hp_reach_1' | 'hp_reach_2' | 'hp_reach_3'
  | 'listen_1' | 'listen_2' | 'listen_3' | 'listen_4'
  | 'listen_5' | 'listen_6' | 'listen_7' | 'listen_8'
  | 'off_1' | 'off_2' | 'off_3' | 'off_4';

const SOURCES: Record<Frame, number> = {
  boy_a: require('@/assets/mascot/boy_a.png'),
  boy_a2: require('@/assets/mascot/boy_a2.png'),
  boy_b: require('@/assets/mascot/boy_b.png'),
  boy_blink: require('@/assets/mascot/boy_blink.png'),
  reach_1: require('@/assets/mascot/reach_1.png'),
  reach_2: require('@/assets/mascot/reach_2.png'),
  reach_3: require('@/assets/mascot/reach_3.png'),
  rise_1: require('@/assets/mascot/rise_1.png'),
  rise_2: require('@/assets/mascot/rise_2.png'),
  rise_3: require('@/assets/mascot/rise_3.png'),
  rise_4: require('@/assets/mascot/rise_4.png'),
  rise_5: require('@/assets/mascot/rise_5.png'),
  rise_6: require('@/assets/mascot/rise_6.png'),
  text_1: require('@/assets/mascot/text_1.png'),
  text_2: require('@/assets/mascot/text_2.png'),
  text_3: require('@/assets/mascot/text_3.png'),
  text_4: require('@/assets/mascot/text_4.png'),
  text_blink: require('@/assets/mascot/text_blink.png'),
  gear_1: require('@/assets/mascot/gear_1.png'),
  gear_2: require('@/assets/mascot/gear_2.png'),
  gear_3: require('@/assets/mascot/gear_3.png'),
  gear_4: require('@/assets/mascot/gear_4.png'),
  gear_5: require('@/assets/mascot/gear_5.png'),
  gear_6: require('@/assets/mascot/gear_6.png'),
  wear_1: require('@/assets/mascot/wear_1.png'),
  wear_2: require('@/assets/mascot/wear_2.png'),
  wear_3: require('@/assets/mascot/wear_3.png'),
  hp_drop_1: require('@/assets/mascot/hp_drop_1.png'),
  hp_drop_2: require('@/assets/mascot/hp_drop_2.png'),
  hp_drop_3: require('@/assets/mascot/hp_drop_3.png'),
  hp_drop_4: require('@/assets/mascot/hp_drop_4.png'),
  hp_drop_5: require('@/assets/mascot/hp_drop_5.png'),
  hp_drop_6: require('@/assets/mascot/hp_drop_6.png'),
  hp_reach_1: require('@/assets/mascot/hp_reach_1.png'),
  hp_reach_2: require('@/assets/mascot/hp_reach_2.png'),
  hp_reach_3: require('@/assets/mascot/hp_reach_3.png'),
  listen_1: require('@/assets/mascot/listen_1.png'),
  listen_2: require('@/assets/mascot/listen_2.png'),
  listen_3: require('@/assets/mascot/listen_3.png'),
  listen_4: require('@/assets/mascot/listen_4.png'),
  listen_5: require('@/assets/mascot/listen_5.png'),
  listen_6: require('@/assets/mascot/listen_6.png'),
  listen_7: require('@/assets/mascot/listen_7.png'),
  listen_8: require('@/assets/mascot/listen_8.png'),
  off_1: require('@/assets/mascot/off_1.png'),
  off_2: require('@/assets/mascot/off_2.png'),
  off_3: require('@/assets/mascot/off_3.png'),
  off_4: require('@/assets/mascot/off_4.png'),
};

// Every frame is painted onto the same 200x215 sprite canvas, so the body sits
// at one scale and one baseline no matter which pose is showing. Anything that
// reintroduces a per-frame size here brings back the jump between animations.
const FRAME_W = 200;
const FRAME_H = 215;

const TARGET_HEIGHT = 71;
const TARGET_WIDTH = Math.round(TARGET_HEIGHT * (FRAME_W / FRAME_H));

const FPS = 60;
const FRAME_MS = 1000 / FPS;

function hold(frame: Frame, count: number): Frame[] {
  return Array(count).fill(frame);
}

function run(frames: Frame[], each: number): Frame[] {
  return frames.flatMap((f) => hold(f, each));
}

const RISE: Frame[] = ['rise_1', 'rise_2', 'rise_3', 'rise_4', 'rise_5', 'rise_6'];
const GEAR: Frame[] = ['gear_1', 'gear_2', 'gear_3', 'gear_4', 'gear_5', 'gear_6'];
const DROP: Frame[] = ['hp_drop_1', 'hp_drop_2', 'hp_drop_3', 'hp_drop_4', 'hp_drop_5', 'hp_drop_6'];
const LISTEN: Frame[] = ['listen_1', 'listen_2', 'listen_3', 'listen_4',
  'listen_5', 'listen_6', 'listen_7', 'listen_8'];
const TEXT_CYCLE: Frame[] = ['text_1', 'text_2', 'text_3', 'text_4'];

// Animation 1 — idle: a three-position breath so the rise and fall eases rather
// than snapping between two poses, with an occasional blink.
const BREATH: Frame[] = ['boy_a', 'boy_a2', 'boy_b', 'boy_a2'];
const IDLE_SEQUENCE: Frame[] = [
  ...run(BREATH, 14), ...run(BREATH, 14),
  ...hold('boy_a', 10), ...hold('boy_blink', 7), ...hold('boy_a', 12),
  ...run(BREATH, 14),
];

// Animation 2 — tap: phone out of his pocket, texting, then away again.
const PHONE_SEQUENCE: Frame[] = [
  ...hold('reach_1', 5), ...hold('reach_2', 6), ...hold('reach_3', 10),
  ...run(RISE, 5),
  ...run(TEXT_CYCLE, 13), ...run(TEXT_CYCLE, 13),
  ...hold('text_1', 8), ...hold('text_blink', 7), ...hold('text_2', 10),
  ...run(TEXT_CYCLE, 13),
  ...run([...RISE].reverse(), 5),
  ...hold('reach_3', 10), ...hold('reach_2', 6), ...hold('reach_1', 5),
];

// Animation 3 — long-press: phone out, headphones plugged in and lifted on,
// phone pocketed, then a swaying head and tapping foot before they come off.
const LISTEN_CYCLES = 4;
const MUSIC_SEQUENCE: Frame[] = [
  ...hold('reach_1', 5), ...hold('reach_2', 6), ...hold('reach_3', 10),
  ...run(RISE, 5),
  ...hold('text_1', 12),
  ...run(GEAR, 8),
  ...hold('wear_1', 6), ...hold('wear_2', 6), ...hold('wear_3', 10),
  ...run(DROP, 5),
  ...hold('hp_reach_1', 8), ...hold('hp_reach_2', 6), ...hold('hp_reach_3', 6),
  ...Array.from({ length: LISTEN_CYCLES }).flatMap(() => run(LISTEN, 11)),
  ...hold('off_1', 8), ...hold('off_2', 8), ...hold('off_3', 8), ...hold('off_4', 10),
];

// Add animation 4 here: declare its frames above, list them under a new key,
// and call play('<key>') from wherever it should trigger. 'idle' is the only
// looping mode -- every other mode runs once and falls back to it.
const SEQUENCES = {
  idle: IDLE_SEQUENCE,
  phone: PHONE_SEQUENCE,
  music: MUSIC_SEQUENCE,
} satisfies Record<string, Frame[]>;

type Mode = keyof typeof SEQUENCES;

// Effects follow the POSE, not the mode, so any future sequence reusing these
// frames picks up the same bubble, notes and burst for free.
const TEXTING: Frame[] = [...TEXT_CYCLE, 'text_blink'];
const HEADPHONES_LAND: Frame = 'wear_3';

export function Mascot() {
  const [mode, setMode] = useState<Mode>('idle');
  const [frameIndex, setFrameIndex] = useState(0);
  const [burst, setBurst] = useState(0);
  const sequence = SEQUENCES[mode];
  const current = sequence[frameIndex] ?? sequence[0];

  // Drive the frame clock off elapsed time rather than an interval — at 60fps
  // setInterval drift is visible, rAF + wall clock keeps the cycle even.
  useEffect(() => {
    const start = Date.now();
    let raf = requestAnimationFrame(function tick() {
      const i = Math.floor((Date.now() - start) / FRAME_MS);
      if (i >= sequence.length && mode !== 'idle') {
        setMode('idle');
        setFrameIndex(0);
        return;
      }
      setFrameIndex(i % sequence.length);
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [mode, sequence.length]);

  // Fire the spark ring on the frame where the headphones settle.
  useEffect(() => {
    if (current === HEADPHONES_LAND) setBurst((b) => b + 1);
  }, [current]);

  // Ignored while another sequence is mid-play, so a tap can't restart it halfway.
  const play = (next: Mode) => {
    if (mode === 'idle') setMode(next);
  };

  const texting = TEXTING.includes(current);
  const listening = LISTEN.includes(current);

  return (
    <Pressable style={styles.stage} onPress={() => play('phone')} onLongPress={() => play('music')}>
      {/* All frames stay mounted (just hidden) so swapping never triggers a
          native re-decode — that was the source of the animation-1 flicker. */}
      {(Object.keys(SOURCES) as Frame[]).map((key) => (
        <Image
          key={key}
          source={SOURCES[key]}
          resizeMode="contain"
          style={[styles.image, { opacity: key === current ? 1 : 0 }]}
        />
      ))}
      {texting && <Particles anchorX={TARGET_WIDTH * 0.4} kinds={TEXT_PARTICLES} />}
      {texting && <TypingBubble />}
      {listening && <Particles anchorX={TARGET_WIDTH * 0.62} kinds={NOTE_PARTICLES} everyMs={340} />}
      {burst > 0 && <Burst key={burst} />}
    </Pressable>
  );
}

const BUBBLE_FRAMES = [
  require('@/assets/mascot/bubble_1.png'),
  require('@/assets/mascot/bubble_2.png'),
  require('@/assets/mascot/bubble_3.png'),
];

// Dots only, never words -- he communicates by action, not speech.
function TypingBubble() {
  const [dot, setDot] = useState(0);
  const pop = useSharedValue(0);

  useEffect(() => {
    pop.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.back(2)) });
    const id = setInterval(() => setDot((d) => (d + 1) % BUBBLE_FRAMES.length), 320);
    return () => clearInterval(id);
  }, [pop]);

  const style = useAnimatedStyle(() => ({ opacity: pop.value, transform: [{ scale: pop.value }] }));

  return (
    <Animated.View style={[styles.bubble, style]}>
      {BUBBLE_FRAMES.map((src, i) => (
        <Image
          key={i}
          source={src}
          resizeMode="contain"
          style={[styles.bubbleImage, { opacity: i === dot ? 1 : 0 }]}
        />
      ))}
    </Animated.View>
  );
}

const PARTICLE_SOURCES = {
  heart: require('@/assets/mascot/heart.png'),
  star: require('@/assets/mascot/star.png'),
  note_a: require('@/assets/mascot/note_a.png'),
  note_b: require('@/assets/mascot/note_b.png'),
  note_c: require('@/assets/mascot/note_c.png'),
};

type ParticleKind = keyof typeof PARTICLE_SOURCES;

const TEXT_PARTICLES: ParticleKind[] = ['heart', 'star'];
const NOTE_PARTICLES: ParticleKind[] = ['note_a', 'note_b', 'note_c'];
const PARTICLE_MS = 1400;

function Particles({ anchorX, kinds, everyMs = 550 }: { anchorX: number; kinds: ParticleKind[]; everyMs?: number }) {
  const [particles, setParticles] = useState<{ id: number; kind: ParticleKind }[]>([]);

  useEffect(() => {
    let nextId = 0;
    const id = setInterval(() => {
      const particleId = nextId++;
      const kind = kinds[Math.floor(Math.random() * kinds.length)];
      setParticles((p) => [...p, { id: particleId, kind }]);
      setTimeout(() => setParticles((p) => p.filter((x) => x.id !== particleId)), PARTICLE_MS);
    }, everyMs);
    return () => clearInterval(id);
  }, [kinds, everyMs]);

  return (
    <>
      {particles.map((p) => (
        <Particle key={p.id} kind={p.kind} anchorX={anchorX} />
      ))}
    </>
  );
}

function Particle({ kind, anchorX }: { kind: ParticleKind; anchorX: number }) {
  const progress = useSharedValue(0);
  // Each gets its own drift, swing, spin and size, so a stream of them never
  // looks like one sprite fired repeatedly up the same line.
  const [cfg] = useState(() => ({
    drift: (Math.random() - 0.5) * 12,
    swing: 5 + Math.random() * 9,
    phase: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 50,
    size: 13 + Math.random() * 6,
    rise: 42 + Math.random() * 20,
  }));

  useEffect(() => {
    progress.value = withTiming(1, { duration: PARTICLE_MS, easing: Easing.out(Easing.quad) });
  }, [progress]);

  const style = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      opacity: p < 0.12 ? p / 0.12 : 1 - (p - 0.12) / 0.88,
      transform: [
        { translateY: -p * cfg.rise },
        { translateX: cfg.drift * p + Math.sin(cfg.phase + p * Math.PI * 2) * cfg.swing },
        { rotate: `${cfg.spin * p}deg` },
        { scale: 0.65 + p * 0.5 },
      ],
    };
  });

  return (
    <Animated.Image
      source={PARTICLE_SOURCES[kind]}
      resizeMode="contain"
      style={[styles.particle, { left: anchorX, width: cfg.size, height: cfg.size }, style]}
    />
  );
}

const SPARK = require('@/assets/mascot/spark.png');
const BURST_MS = 620;
const BURST_ANGLES = [-70, -35, 0, 35, 70, 110];

// One-shot ring of sparks for the moment the headphones settle on his head.
function Burst() {
  return (
    <>
      {BURST_ANGLES.map((angle, i) => (
        <Spark key={i} angle={angle} />
      ))}
    </>
  );
}

function Spark({ angle }: { angle: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: BURST_MS, easing: Easing.out(Easing.cubic) });
  }, [progress]);

  const style = useAnimatedStyle(() => {
    const p = progress.value;
    const rad = (angle * Math.PI) / 180;
    return {
      opacity: p < 0.15 ? p / 0.15 : 1 - (p - 0.15) / 0.85,
      transform: [
        { translateX: Math.sin(rad) * 24 * p },
        { translateY: -Math.cos(rad) * 24 * p },
        { scale: 1.1 - p * 0.6 },
      ],
    };
  });

  return <Animated.Image source={SPARK} resizeMode="contain" style={[styles.spark, style]} />;
}

const styles = StyleSheet.create({
  stage: { width: TARGET_WIDTH, height: TARGET_HEIGHT, justifyContent: 'flex-end' },
  image: { position: 'absolute', bottom: 0, left: 0, width: TARGET_WIDTH, height: TARGET_HEIGHT },
  particle: { position: 'absolute', bottom: TARGET_HEIGHT * 0.5 },
  bubble: { position: 'absolute', right: 0, top: 6, width: 24, height: 18 },
  bubbleImage: { position: 'absolute', left: 0, top: 0, width: 24, height: 18 },
  spark: { position: 'absolute', left: TARGET_WIDTH * 0.36, top: 6, width: 10, height: 10 },
});
