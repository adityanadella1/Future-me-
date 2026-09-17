import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { colors, fonts, radii } from '@/constants/theme';

export function Toast({ message, onHide }: { message: string | null; onHide: () => void }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onHide, 1800);
    return () => clearTimeout(t);
  }, [message, onHide]);

  if (!message) return null;
  return (
    <Animated.View entering={FadeInDown} exiting={FadeOutUp} style={styles.toast}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: colors.ink,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radii.lg,
    zIndex: 20,
  },
  text: { fontFamily: fonts.bodySemiBold, color: '#fff', fontSize: 14 },
});
