export type BoardId = 'today' | 'tomorrow' | 'week' | 'someday';

export type Task = {
  id: string;
  board: BoardId;
  title: string;
  note?: string;
  time?: string; // free-form label, e.g. "9:00 AM" or "Anytime"
  done: boolean;
  createdAt: number;
  completedAt?: number;
  bookmarked?: boolean;
};

export type FutureMeEntry = {
  id: string;
  title: string;
  body: string;
  createdAt: number;
};

export type BadgeId =
  | 'first_task'
  | 'first_streak_day'
  | 'streak_7'
  | 'tasks_50'
  | 'streak_30'
  | 'future_me_goal'
  | 'streak_100'
  | 'early_bird';

export type Badge = {
  id: BadgeId;
  name: string;
  tier: 'bronze' | 'silver' | 'gold' | 'legendary';
  emoji: string;
  description: string;
};

export type GameState = {
  points: number;
  xp: number;
  level: number;
  streak: number;
  bestStreak: number;
  lastCompletedDate: string | null; // YYYY-MM-DD
  streakFreezes: number;
  badges: BadgeId[];
};

export type AppSettings = {
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  reduceMotion: boolean;
  dailySummary: boolean;
  weeklyReview: boolean;
  motivationNudges: boolean;
};

export type AppState = {
  tasks: Task[];
  futureMe: FutureMeEntry[];
  game: GameState;
  settings: AppSettings;
  hydrated: boolean;
};
