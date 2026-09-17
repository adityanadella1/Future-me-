import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type Tick = 'light' | 'medium' | 'heavy' | 'success' | 'warning';

export function fireHaptic(enabled: boolean, tick: Tick) {
  if (!enabled || Platform.OS === 'web') return;
  switch (tick) {
    case 'light':
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    case 'medium':
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    case 'heavy':
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    case 'success':
      return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    case 'warning':
      return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }
}
