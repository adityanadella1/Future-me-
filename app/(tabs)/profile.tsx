import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BADGES } from '@/lib/badges';
import { colors, fonts, radii, shadow } from '@/constants/theme';
import { levelForXp, titleForLevel } from '@/lib/level';
import { useAppState } from '@/lib/store';

export default function ProfileScreen() {
  const { state } = useAppState();
  const insets = useSafeAreaInsets();
  const level = levelForXp(state.game.xp);
  const completed = state.tasks.filter((t) => t.done).length;
  const unlockedBadges = BADGES.filter((b) => state.game.badges.includes(b.id));

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <Pressable style={styles.settingsButton} onPress={() => router.push('/settings')}>
        <Ionicons name="settings-outline" size={22} color={colors.ink} />
      </Pressable>

      <View style={styles.avatar}>
        <Text style={styles.avatarLetter}>A</Text>
      </View>
      <Text style={styles.name}>Aditya</Text>
      <View style={styles.levelPill}>
        <Text style={styles.levelPillText}>
          Level {level} · {titleForLevel(level)}
        </Text>
      </View>
      <Text style={styles.streakLine}>🔥 {state.game.streak}-day current streak</Text>

      <View style={styles.statsRow}>
        <View style={styles.statTile}>
          <Text style={styles.statValue}>{completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={styles.statValue}>{state.game.streak}</Text>
          <Text style={styles.statLabel}>Day streak</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={styles.statValue}>{unlockedBadges.map((b) => b.emoji).join(' ') || '—'}</Text>
          <Text style={styles.statLabel}>Badges</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper, alignItems: 'center', paddingHorizontal: 20 },
  settingsButton: { position: 'absolute', top: 16, right: 20, padding: 8 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: colors.gold,
    backgroundColor: '#FBE7BE',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  avatarLetter: { fontFamily: fonts.display, fontSize: 40, color: colors.gold },
  name: { fontFamily: fonts.display, fontSize: 26, color: colors.ink, marginTop: 16 },
  levelPill: { backgroundColor: '#FBE7BE', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6, marginTop: 10 },
  levelPillText: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.gold },
  streakLine: { fontFamily: fonts.body, fontSize: 14, color: colors.ink, marginTop: 10 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 28, width: '100%' },
  statTile: { flex: 1, backgroundColor: '#fff', borderRadius: radii.md, paddingVertical: 18, alignItems: 'center', ...shadow.card },
  statValue: { fontFamily: fonts.display, fontSize: 22, color: colors.ink },
  statLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 4 },
});
