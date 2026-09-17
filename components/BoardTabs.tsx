import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { boardColor, colors, fonts } from '@/constants/theme';
import type { BoardId } from '@/lib/types';

const BOARDS: { id: BoardId; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'tomorrow', label: 'Tomorrow' },
  { id: 'week', label: 'Week' },
  { id: 'someday', label: 'Someday' },
];

export function BoardTabs({ active, onChange }: { active: BoardId; onChange: (b: BoardId) => void }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}
    >
      {BOARDS.map(({ id, label }) => {
        const isActive = id === active;
        return (
          <Pressable
            key={id}
            onPress={() => onChange(id)}
            style={[styles.pill, isActive && { backgroundColor: boardColor(id) }]}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 10 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  label: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.ink, opacity: 0.55 },
  labelActive: { color: '#FFFFFF', opacity: 1 },
});
