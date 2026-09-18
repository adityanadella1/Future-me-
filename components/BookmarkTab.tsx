import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { PressableScale } from '@/components/PressableScale';
import { boardColor, boardTint, colors, fonts } from '@/constants/theme';
import type { Task } from '@/lib/types';

export function BookmarkTab({ task, onRestore }: { task: Task; onRestore: (id: string) => void }) {
  return (
    <Animated.View entering={FadeIn} exiting={FadeOut}>
      <PressableScale
        scaleTo={0.97}
        style={[styles.tab, { backgroundColor: boardTint[task.board] }]}
        onPress={() => onRestore(task.id)}
      >
        <Ionicons name="bookmark" size={20} color={boardColor(task.board)} style={styles.icon} />
        <Text style={styles.title} numberOfLines={1}>
          {task.title}
        </Text>
        <Text style={styles.hint}>tap to resume</Text>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  icon: { marginRight: 10 },
  title: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.ink, opacity: 0.7 },
  hint: { fontFamily: fonts.body, fontSize: 11, color: colors.muted },
});
