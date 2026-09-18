import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Mascot } from '@/components/Mascot';
import { useAppState } from '@/lib/store';

// A small pixel companion that just sits at the left edge of the screen,
// always animating — no popups, no text, purely visual company.
export function MascotDock() {
  const { state } = useAppState();
  if (state.settings.reduceMotion) return null;

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Mascot />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: -4, bottom: 100, zIndex: 40 },
});
