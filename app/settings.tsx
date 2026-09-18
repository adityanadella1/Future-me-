import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import React from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Switch, Text, View } from 'react-native';
import { colors, fonts, radii } from '@/constants/theme';
import type { AppSettings } from '@/lib/types';
import { useAppState } from '@/lib/store';

const FEEL: { key: keyof AppSettings; label: string }[] = [
  { key: 'hapticsEnabled', label: 'Haptic feedback on gestures' },
  { key: 'soundEnabled', label: 'Sound effects' },
  { key: 'reduceMotion', label: 'Reduce motion' },
];

const NOTIFICATIONS: { key: keyof AppSettings; label: string }[] = [
  { key: 'dailySummary', label: 'Daily summary' },
  { key: 'weeklyReview', label: 'Weekly review' },
  { key: 'motivationNudges', label: 'Motivation nudges' },
];

export default function SettingsScreen() {
  const { state, updateSettings } = useAppState();

  const renderRow = (row: { key: keyof AppSettings; label: string }) => (
    <View style={styles.row} key={row.key}>
      <Text style={styles.rowLabel}>{row.label}</Text>
      <Switch
        value={state.settings[row.key]}
        onValueChange={(v) => updateSettings({ [row.key]: v })}
        trackColor={{ true: colors.gold, false: '#E5DCC8' }}
      />
    </View>
  );

  const exportData = () => {
    Share.share({ message: JSON.stringify(state, null, 2), title: 'Future Me data export' });
  };

  const showAbout = () => {
    Alert.alert('Future Me', `Version ${Constants.expoConfig?.version ?? '1.0.0'}\nA paper-inspired productivity app.`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.sectionLabel}>FEEL</Text>
      <View style={styles.card}>{FEEL.map(renderRow)}</View>

      <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
      <View style={styles.card}>{NOTIFICATIONS.map(renderRow)}</View>

      <Text style={styles.sectionLabel}>GENERAL</Text>
      <View style={styles.card}>
        <Pressable style={styles.row} onPress={exportData}>
          <Text style={styles.linkLabel}>Export my data</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </Pressable>
        <Pressable style={[styles.row, { borderBottomWidth: 0 }]} onPress={showAbout}>
          <Text style={styles.linkLabel}>About Future Me</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  sectionLabel: { fontFamily: fonts.bodySemiBold, fontSize: 12, color: colors.muted, marginBottom: 8, marginTop: 12 },
  card: { backgroundColor: '#fff', borderRadius: radii.md, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#00000012',
  },
  rowLabel: { fontFamily: fonts.body, fontSize: 15, color: colors.ink },
  linkLabel: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.tomorrow },
});
