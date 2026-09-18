import type { BoardId } from '@/lib/types';

export const colors = {
  today: '#F2703F',
  tomorrow: '#4B9FCC',
  week: '#5F9E68',
  someday: '#8D6DB8',
  paper: '#F6EFE1',
  ink: '#1E1A16',
  gold: '#C5952E',
  success: '#39825C',
  danger: '#A8402F',
  muted: '#867A6B',
} as const;

export const boardColor = (board: BoardId): string => colors[board];

// Each board's note gets a soft pastel wash of its accent color as background.
export const boardTint: Record<BoardId, string> = {
  today: '#F8D9C4',
  tomorrow: '#CFE6F2',
  week: '#D5E8D6',
  someday: '#E2D6EF',
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
