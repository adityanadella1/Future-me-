import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BADGES } from '@/lib/badges';
import { levelForXp, titleForLevel, xpIntoLevel } from '@/lib/level';
import { colors, fonts, radii, shadow } from '@/constants/theme';
import { useAppState } from '@/lib/store';

export default function AwardsScreen() {
  const { state } = useAppState();
  const insets = useSafeAreaInsets();
  const level = levelForXp(state.game.xp);
  const { current, needed } = xpIntoLevel(state.game.xp);
  const completed = state.tasks.filter((t) => t.done).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <Text style={styles.eyebrow}>Your journey</Text>
      <Text style={styles.heading}>Achievements</Text>

      <View style={styles.levelCard}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>Lv{level}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.levelTitle}>{titleForLevel(level)}</Text>
          <View style={styles.xpTrack}>
            <View style={[styles.xpFill, { width: `${Math.min(100, (current / needed) * 100)}%` }]} />
          </View>
          <Text style={styles.xpLabel}>
            {current} / {needed} XP to Level {level + 1}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <StatTile emoji="🔥" value={state.game.streak} label="Day streak" />
        <StatTile value={completed} label="Tasks done" color={colors.success} />
        <StatTile value={state.game.points} label="Total points" />
      </View>

      <Text style={styles.sectionLabel}>Badges</Text>
      <View style={styles.badgeGrid}>
        {BADGES.map((b) => {
          const unlocked = state.game.badges.includes(b.id);
          return (
            <View key={b.id} style={styles.badgeTile}>
              <Text style={[styles.badgeEmoji, !unlocked && styles.badgeEmojiLocked]}>{unlocked ? b.emoji : '🔒'}</Text>
              <Text style={[styles.badgeName, !unlocked && styles.badgeNameLocked]}>{b.name}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function StatTile({ emoji, value, label, color }: { emoji?: string; value: number; label: string; color?: string }) {
  return (
    <View style={styles.statTile}>
      {emoji ? <Text style={styles.statEmoji}>{emoji}</Text> : null}
      <Text style={[styles.statValue, color && { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper, paddingHorizontal: 20 },
  eyebrow: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.muted, textTransform: 'uppercase' },
  heading: { fontFamily: fonts.display, fontSize: 28, color: colors.ink, marginBottom: 16 },
  levelCard: {
    backgroundColor: colors.ink,
    borderRadius: radii.lg,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  levelBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBadgeText: { fontFamily: fonts.display, color: colors.gold, fontSize: 18 },
  levelTitle: { fontFamily: fonts.display, color: '#fff', fontSize: 18 },
  xpTrack: { height: 8, backgroundColor: '#FFFFFF33', borderRadius: 999, marginTop: 8, overflow: 'hidden' },
  xpFill: { height: 8, backgroundColor: colors.gold },
  xpLabel: { fontFamily: fonts.body, color: '#FFFFFFAA', fontSize: 12, marginTop: 6 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  statTile: { flex: 1, backgroundColor: '#fff', borderRadius: radii.md, padding: 14, alignItems: 'center', ...shadow.card },
  statEmoji: { fontSize: 18 },
  statValue: { fontFamily: fonts.display, fontSize: 22, color: colors.ink, marginTop: 2 },
  statLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 2 },
  sectionLabel: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.muted, marginTop: 24, marginBottom: 10 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingBottom: 40 },
  badgeTile: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: radii.md,
    paddingVertical: 16,
    alignItems: 'center',
    ...shadow.card,
  },
  badgeEmoji: { fontSize: 26 },
  badgeEmojiLocked: { opacity: 0.35 },
  badgeName: { fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.ink, marginTop: 6, textAlign: 'center' },
  badgeNameLocked: { opacity: 0.4 },
});
