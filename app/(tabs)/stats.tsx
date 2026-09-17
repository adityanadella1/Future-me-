import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { boardLabel, colors, fonts, radii, shadow } from '@/constants/theme';
import { useAppState } from '@/lib/store';
import { avgTasksPerDay, completionsByDay, laggingBoard, lastNDays, overdueCount, productivityScore } from '@/lib/stats';

export default function StatsScreen() {
  const { state } = useAppState();
  const insets = useSafeAreaInsets();
  const tasks = state.tasks;

  const score = productivityScore(tasks);
  const week = lastNDays(7);
  const byDay = completionsByDay(tasks);
  const maxWeek = Math.max(1, ...week.map((d) => byDay[d] ?? 0));
  const last28 = lastNDays(28);
  const avg = avgTasksPerDay(tasks);
  const overdue = overdueCount(tasks);
  const lagging = laggingBoard(tasks);
  const completedThisWeek = week.reduce((sum, d) => sum + (byDay[d] ?? 0), 0);

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top + 8 }]} contentContainerStyle={{ paddingBottom: 60 }}>
      <Text style={styles.eyebrow}>Personal growth tracker</Text>
      <Text style={styles.heading}>Statistics</Text>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardLabel}>PRODUCTIVITY SCORE</Text>
          <Text style={styles.score}>{score}</Text>
        </View>
        <View style={styles.barsRow}>
          {week.map((d, i) => {
            const v = byDay[d] ?? 0;
            const h = Math.max(6, (v / maxWeek) * 64);
            const isToday = i === week.length - 1;
            return (
              <View key={d} style={styles.barCol}>
                <View style={[styles.bar, { height: h, backgroundColor: isToday ? colors.success : '#E7DFCF' }]} />
                <Text style={styles.barLabel}>{new Date(d).toLocaleDateString(undefined, { weekday: 'narrow' })}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.card, styles.half]}>
          <View style={styles.streakHeader}>
            <Text style={styles.cardLabel}>STREAK MAP</Text>
            <Text style={styles.streakBadge}>🔥 {state.game.streak}</Text>
          </View>
          <View style={styles.heatmap}>
            {last28.map((d) => {
              const v = byDay[d] ?? 0;
              const opacity = v === 0 ? 0.15 : Math.min(1, 0.35 + v * 0.25);
              return <View key={d} style={[styles.heatCell, { backgroundColor: colors.success, opacity }]} />;
            })}
          </View>
        </View>
        <View style={[styles.card, styles.half, styles.centerCard]}>
          <Text style={styles.bigNumber}>{avg}</Text>
          <Text style={styles.smallLabel}>avg tasks / day</Text>
          <Text style={[styles.bigNumber, { color: colors.today, fontSize: 22, marginTop: 12 }]}>{overdue}</Text>
          <Text style={styles.smallLabel}>overdue this week</Text>
        </View>
      </View>

      <View style={styles.winsCard}>
        <Text style={styles.winsLabel}>WEEKLY WINS</Text>
        <Text style={styles.winsText}>
          You finished {completedThisWeek} task{completedThisWeek === 1 ? '' : 's'} and kept a {state.game.streak}-day
          streak{state.game.streak >= state.game.bestStreak && state.game.bestStreak > 0 ? ' — your best yet.' : '.'}
        </Text>
      </View>

      <View style={styles.insightCard}>
        <Text style={styles.insightLabel}>💡 PATTERN INSIGHT</Text>
        <Text style={styles.insightText}>
          {lagging
            ? `Tasks on ${boardLabel[lagging]} tend to sit unfinished — try moving one up.`
            : 'No stale patterns yet — keep swiping!'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper, paddingHorizontal: 20 },
  eyebrow: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.muted, textTransform: 'uppercase' },
  heading: { fontFamily: fonts.display, fontSize: 28, color: colors.ink, marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: radii.lg, padding: 16, marginBottom: 12, ...shadow.card },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel: { fontFamily: fonts.bodySemiBold, fontSize: 11, color: colors.muted, letterSpacing: 0.5 },
  score: { fontFamily: fonts.display, fontSize: 24, color: colors.success },
  barsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, alignItems: 'flex-end' },
  barCol: { alignItems: 'center', width: 24 },
  bar: { width: 14, borderRadius: 7 },
  barLabel: { fontFamily: fonts.body, fontSize: 10, color: colors.muted, marginTop: 6 },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  centerCard: { alignItems: 'center', justifyContent: 'center' },
  streakHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  streakBadge: { fontFamily: fonts.hand, fontSize: 16, color: colors.gold },
  heatmap: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 12, width: 7 * 16 + 6 * 4 },
  heatCell: { width: 16, height: 16, borderRadius: 3 },
  bigNumber: { fontFamily: fonts.display, fontSize: 28, color: colors.ink },
  smallLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 2 },
  winsCard: { backgroundColor: '#F5DFAF', borderRadius: radii.lg, padding: 18, marginTop: 4 },
  winsLabel: { fontFamily: fonts.bodySemiBold, fontSize: 11, color: colors.gold, letterSpacing: 0.5 },
  winsText: { fontFamily: fonts.display, fontSize: 17, color: colors.ink, marginTop: 8, lineHeight: 24 },
  insightCard: { backgroundColor: '#fff', borderRadius: radii.lg, padding: 16, marginTop: 12, ...shadow.card },
  insightLabel: { fontFamily: fonts.bodySemiBold, fontSize: 11, color: colors.muted, letterSpacing: 0.5 },
  insightText: { fontFamily: fonts.body, fontSize: 14, color: colors.ink, marginTop: 6 },
});
