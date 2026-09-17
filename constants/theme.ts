import type { BoardId } from '@/lib/types';

export const colors = {
  today: '#FF9466',
  tomorrow: '#74C6E8',
  week: '#8FBF8A',
  someday: '#B39DDB',
  paper: '#F7F2E7',
  ink: '#2B2620',
  gold: '#E0A526',
  success: '#4CAF7D',
  danger: '#C1594B',
  muted: '#9A9184',
} as const;

export const boardColor = (board: BoardId): string => colors[board];

// Each board's note gets a soft pastel wash of its accent color as background.
export const boardTint: Record<BoardId, string> = {
  today: '#FFE7DA',
  tomorrow: '#DCF0FA',
  week: '#E3F1E1',
  someday: '#EDE6F7',
};

export const boardLabel: Record<BoardId, string> = {
  today: 'Today',
  tomorrow: 'Tomorrow',
  week: 'This Week',
  someday: 'Someday',
};

export const fonts = {
  display: 'Fraunces_700Bold',
  displayMedium: 'Fraunces_600SemiBold',
  body: 'WorkSans_400Regular',
  bodyMedium: 'WorkSans_500Medium',
  bodySemiBold: 'WorkSans_600SemiBold',
  hand: 'Caveat_600SemiBold',
};

export const radii = { sm: 10, md: 16, lg: 22 };

export const shadow = {
  note: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
} as const;
