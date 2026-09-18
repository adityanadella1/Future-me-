import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BadgeUnlock } from '@/components/BadgeUnlock';
import { Bin } from '@/components/Bin';
import { BookmarkTab } from '@/components/BookmarkTab';
import { BoardTabs } from '@/components/BoardTabs';
import { PressableScale } from '@/components/PressableScale';
import { StickyNote } from '@/components/StickyNote';
import { TaskComposer } from '@/components/TaskComposer';
import { Toast } from '@/components/Toast';
import { colors, fonts } from '@/constants/theme';
import { BADGES } from '@/lib/badges';
import { useAppState } from '@/lib/store';
import type { Badge, BadgeId, BoardId, Task } from '@/lib/types';

const EYEBROWS: Partial<Record<BoardId, string>> = {
  tomorrow: 'Coming up',
  week: 'Plan ahead',
  someday: 'Someday & goals',
};

const HEADINGS: Record<BoardId, string> = {
  today: 'Good morning ☀️',
  tomorrow: 'Tomorrow',
  week: 'This Week',
  someday: 'Future Board',
};

export default function BoardsScreen() {
  const { state, addTask, editTask, completeTask, doLater, deleteTask, restoreBookmark } = useAppState();
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState<BoardId>('today');
  const [composerOpen, setComposerOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState<Badge | null>(null);

  const tasks = useMemo(() => state.tasks.filter((t) => t.board === active && !t.done), [state.tasks, active]);
  const totalToday = state.tasks.filter((t) => t.board === active).length;
  const doneToday = totalToday - tasks.length;

  const celebrateBadges = (earnedBadges: BadgeId[]) => {
    if (!earnedBadges.length) return;
    const badge = BADGES.find((b) => b.id === earnedBadges[0]);
    if (badge) setCelebrating(badge);
  };

  const handleComplete = (id: string) => {
    const { pointsGained, earnedBadges } = completeTask(id);
    setToast(`+${pointsGained} pts`);
    celebrateBadges(earnedBadges);
  };

  const handleDelete = (id: string) => {
    const { pointsGained } = deleteTask(id);
    setToast(`Swish! +${pointsGained} pts`);
  };

  const openComposer = (task?: Task) => {
    setEditing(task ?? null);
    setComposerOpen(true);
  };

  const handleSave = (title: string, note: string, time: string) => {
    if (editing) editTask(editing.id, title, note, time);
    else addTask(active, title, note, time);
    setComposerOpen(false);
  };

  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <Toast message={toast} onHide={() => setToast(null)} />
      <BadgeUnlock badge={celebrating} onDone={() => setCelebrating(null)} />
      <View style={styles.header}>
        <View>
          <Text style={styles.date}>{EYEBROWS[active] ?? dateLabel}</Text>
          <Text style={styles.greeting}>{HEADINGS[active]}</Text>
        </View>
        <View style={styles.streak}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakNumber}>{state.game.streak}</Text>
        </View>
      </View>

      <BoardTabs active={active} onChange={setActive} />

      {totalToday > 0 && (
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(doneToday / totalToday) * 100}%` }]} />
          </View>
          <Text style={styles.progressLabel}>
            {doneToday} / {totalToday} done
          </Text>
        </View>
      )}

      <FlatList
        data={tasks}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState board={active} />}
        ListFooterComponent={
          active === 'someday' ? (
            <FutureMeCard count={state.futureMe.length} onPress={() => router.push('/future-me')} />
          ) : null
        }
        renderItem={({ item }) =>
          item.bookmarked ? (
            <BookmarkTab task={item} onRestore={restoreBookmark} />
          ) : (
            <StickyNote
              task={item}
              hapticsEnabled={state.settings.hapticsEnabled}
              onComplete={handleComplete}
              onDoLater={doLater}
              onDelete={handleDelete}
              onPress={openComposer}
            />
          )
        }
      />

      <Bin />

      <PressableScale style={[styles.fab, { bottom: insets.bottom + 24 }]} onPress={() => openComposer()}>
        <Ionicons name="add" size={28} color="#fff" />
      </PressableScale>

      <TaskComposer
        visible={composerOpen}
        board={active}
        editing={editing}
        onClose={() => setComposerOpen(false)}
        onSave={handleSave}
      />
    </View>
  );
}

function EmptyState({ board }: { board: BoardId }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>Nothing on the {board} board yet.</Text>
      <Text style={styles.emptyHint}>Tap + to stick a new note.</Text>
    </View>
  );
}

function FutureMeCard({ count, onPress }: { count: number; onPress: () => void }) {
  return (
    <Pressable style={styles.futureCard} onPress={onPress}>
      <View style={styles.futureCardHeader}>
        <Ionicons name="chatbox-ellipses" size={16} color={colors.paper} />
        <Text style={styles.futureCardEyebrow}>FUTURE ME</Text>
      </View>
      <Text style={styles.futureCardTitle}>Write a letter to your future self</Text>
      <Text style={styles.futureCardBody}>
        Capture a plan, a dream, or a reminder. {count > 0 ? `${count} ${count === 1 ? 'entry' : 'entries'} so far.` : ''}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20 },
  date: { fontFamily: fonts.body, color: colors.muted, fontSize: 13 },
  greeting: { fontFamily: fonts.display, fontSize: 26, color: colors.ink, marginTop: 2 },
  streak: { alignItems: 'center' },
  streakEmoji: { fontSize: 22 },
  streakNumber: { fontFamily: fonts.hand, fontSize: 18, color: colors.gold },
  progressRow: { paddingHorizontal: 20, marginTop: 4, marginBottom: 8 },
  progressTrack: { height: 6, backgroundColor: '#00000012', borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: colors.success },
  progressLabel: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.muted, marginTop: 6, textAlign: 'right' },
  list: { paddingHorizontal: 20, paddingBottom: 120 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.ink },
  emptyHint: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 4 },
  fab: {
    position: 'absolute',
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  futureCard: { backgroundColor: colors.ink, borderRadius: 22, padding: 18, marginTop: 4 },
  futureCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  futureCardEyebrow: { fontFamily: fonts.bodySemiBold, fontSize: 11, color: colors.paper, letterSpacing: 0.5 },
  futureCardTitle: { fontFamily: fonts.display, fontSize: 18, color: '#fff', marginTop: 8 },
  futureCardBody: { fontFamily: fonts.body, fontSize: 13, color: '#FFFFFFCC', marginTop: 4 },
});
