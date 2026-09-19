import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mascot } from '@/components/Mascot';
import { useAppState } from '@/lib/store';

// The dock renders in the root layout, above the tab navigator, so its offset
// has to rebuild the FAB's from the window edge: tab bar, then the FAB's own
// insets.bottom + 24 inside the screen.
// ponytail: 49 is react-navigation's default bar height; read it with
// useBottomTabBarHeight if the dock ever moves inside a tab screen.
const TAB_BAR_HEIGHT = 49;

// A small pixel companion in the bottom-left corner, sitting on the same
// baseline as the + button. Idles forever; tap him for the phone bit.
export function MascotDock() {
  const { state } = useAppState();
  const insets = useSafeAreaInsets();
  if (state.settings.reduceMotion) return null;

  return (
    <View style={[styles.wrap, { bottom: TAB_BAR_HEIGHT + insets.bottom * 2 + 24 }]} pointerEvents="box-none">
      <Mascot />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 20, zIndex: 40 },
});
