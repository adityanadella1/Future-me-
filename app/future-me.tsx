import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fonts, radii, shadow } from '@/constants/theme';
import { useAppState } from '@/lib/store';

export default function FutureMeScreen() {
  const { state, addFutureMe } = useAppState();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const save = () => {
    if (!title.trim() || !body.trim()) return;
    addFutureMe(title.trim(), body.trim());
    setTitle('');
    setBody('');
    router.back();
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={state.futureMe}
        keyExtractor={(e) => e.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.composer}>
            <Text style={styles.heading}>Write a letter to your future self</Text>
            <Text style={styles.subheading}>A plan, a dream, a reminder — this space is just for you.</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="Title, e.g. Learn to sail"
              placeholderTextColor={colors.muted}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={styles.bodyInput}
              placeholder="Dear future me..."
              placeholderTextColor={colors.muted}
              value={body}
              onChangeText={setBody}
              multiline
              textAlignVertical="top"
            />
            <Pressable style={styles.saveButton} onPress={save}>
              <Text style={styles.saveButtonText}>Save entry</Text>
            </Pressable>
            {state.futureMe.length > 0 && <Text style={styles.pastHeading}>Past entries</Text>}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.entryCard}>
            <Text style={styles.entryTitle}>{item.title}</Text>
            <Text style={styles.entryBody}>{item.body}</Text>
            <Text style={styles.entryDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  list: { padding: 20, paddingBottom: 60 },
  composer: { marginBottom: 8 },
  heading: { fontFamily: fonts.display, fontSize: 22, color: colors.ink },
  subheading: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 4, marginBottom: 16 },
  titleInput: {
    backgroundColor: '#fff',
    borderRadius: radii.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.ink,
    marginBottom: 10,
  },
  bodyInput: {
    backgroundColor: '#fff',
    borderRadius: radii.sm,
    padding: 14,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
    minHeight: 120,
    marginBottom: 14,
  },
  saveButton: { backgroundColor: colors.ink, borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
  saveButtonText: { fontFamily: fonts.bodySemiBold, color: '#fff' },
  pastHeading: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.muted, marginTop: 24, marginBottom: 4 },
  entryCard: { backgroundColor: '#fff', borderRadius: radii.md, padding: 16, marginBottom: 12, ...shadow.card },
  entryTitle: { fontFamily: fonts.display, fontSize: 17, color: colors.ink },
  entryBody: { fontFamily: fonts.body, fontSize: 14, color: colors.ink, opacity: 0.8, marginTop: 6 },
  entryDate: { fontFamily: fonts.body, fontSize: 11, color: colors.muted, marginTop: 8 },
});
