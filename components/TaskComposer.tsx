import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { boardColor, boardLabel, colors, fonts, radii } from '@/constants/theme';
import type { BoardId, Task } from '@/lib/types';

export function TaskComposer({
  visible,
  board,
  editing,
  onClose,
  onSave,
}: {
  visible: boolean;
  board: BoardId;
  editing?: Task | null;
  onClose: () => void;
  onSave: (title: string, note: string, time: string) => void;
}) {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    if (visible) {
      setTitle(editing?.title ?? '');
      setNote(editing?.note ?? '');
      setTime(editing?.time ?? '');
    }
  }, [visible, editing]);

  const save = () => {
    if (!title.trim()) return;
    onSave(title.trim(), note.trim(), time.trim());
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={[styles.badge, { backgroundColor: boardColor(board) }]}>
            <Text style={styles.badgeText}>{boardLabel[board]}</Text>
          </View>
          <Text style={styles.heading}>{editing ? 'Edit task' : 'New sticky note'}</Text>
          <TextInput
            style={styles.input}
            placeholder="What needs doing?"
            placeholderTextColor="#9A9184"
            value={title}
            onChangeText={setTitle}
            autoFocus
          />
          <TextInput
            style={styles.input}
            placeholder="Details (optional)"
            placeholderTextColor="#9A9184"
            value={note}
            onChangeText={setNote}
          />
          <TextInput
            style={styles.input}
            placeholder="Time label, e.g. 9:00 AM (optional)"
            placeholderTextColor="#9A9184"
            value={time}
            onChangeText={setTime}
          />
          <View style={styles.row}>
            <Pressable style={styles.secondary} onPress={onClose}>
              <Text style={styles.secondaryText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.primary} onPress={save}>
              <Text style={styles.primaryText}>{editing ? 'Save' : 'Stick it on the board'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#00000055', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.paper, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg, padding: 22 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, marginBottom: 10 },
  badgeText: { fontFamily: fonts.bodySemiBold, fontSize: 12, color: '#fff' },
  heading: { fontFamily: fonts.display, fontSize: 22, color: colors.ink, marginBottom: 14 },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
    marginBottom: 10,
  },
  row: { flexDirection: 'row', gap: 10, marginTop: 8 },
  secondary: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 999, backgroundColor: '#FFFFFF' },
  secondaryText: { fontFamily: fonts.bodySemiBold, color: colors.ink },
  primary: { flex: 2, alignItems: 'center', paddingVertical: 14, borderRadius: 999, backgroundColor: colors.ink },
  primaryText: { fontFamily: fonts.bodySemiBold, color: '#fff' },
});
