import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { checkNewBadges, countCompleted } from './badges';
import { loadState, saveState } from './storage';
import type { AppSettings, AppState, BadgeId, BoardId, FutureMeEntry, GameState, Task } from './types';

function todayStr(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

const initialGame: GameState = {
  points: 0,
  xp: 0,
  level: 1,
  streak: 0,
  bestStreak: 0,
  lastCompletedDate: null,
  streakFreezes: 0,
  badges: [],
};

const initialSettings: AppSettings = {
  hapticsEnabled: true,
  soundEnabled: true,
  reduceMotion: false,
  dailySummary: true,
  weeklyReview: true,
  motivationNudges: true,
};

const initialState: AppState = {
  tasks: [],
  futureMe: [],
  game: initialGame,
  settings: initialSettings,
  hydrated: false,
};

type Action =
  | { type: 'HYDRATE'; state: AppState }
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'EDIT_TASK'; id: string; title: string; note?: string; time?: string }
  | { type: 'COMPLETE_TASK'; id: string; earnedBadges: BadgeId[]; pointsGained: number; now: number }
  | { type: 'DO_LATER'; id: string }
  | { type: 'RESTORE_BOOKMARK'; id: string }
  | { type: 'DELETE_TASK'; id: string; pointsGained: number }
  | { type: 'ADD_FUTURE_ME'; entry: FutureMeEntry; earnedBadges: BadgeId[] }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<AppSettings> }
  | { type: 'CLEAR_CELEBRATION' };

function applyStreak(game: GameState, on: Date): GameState {
  const today = todayStr(on);
  if (game.lastCompletedDate === today) return game;
  const yesterday = todayStr(new Date(on.getTime() - 86400000));
  let streak = 1;
  let bestStreak = game.bestStreak;
  if (game.lastCompletedDate === yesterday) {
    streak = game.streak + 1;
  } else if (game.lastCompletedDate !== null) {
    bestStreak = Math.max(bestStreak, game.streak);
  }
  bestStreak = Math.max(bestStreak, streak);
  return { ...game, streak, bestStreak, lastCompletedDate: today };
}

function applyXp(game: GameState, xpGained: number): GameState {
  const xp = game.xp + xpGained;
  // level/level-title derivation is view-layer (see lib/level.ts); here we just accumulate.
  return { ...game, xp };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...action.state, hydrated: true };

    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.task] };

    case 'EDIT_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id ? { ...t, title: action.title, note: action.note, time: action.time } : t
        ),
      };

    case 'COMPLETE_TASK': {
      const now = new Date(action.now);
      const tasks = state.tasks.map((t) =>
        t.id === action.id ? { ...t, done: true, completedAt: now.getTime() } : t
      );
      let game = applyStreak(state.game, now);
      game = applyXp(game, action.pointsGained);
      game = {
        ...game,
        points: game.points + action.pointsGained,
        badges: [...game.badges, ...action.earnedBadges.filter((b) => !game.badges.includes(b))],
      };
      return { ...state, tasks, game };
    }

    case 'DO_LATER':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.id ? { ...t, bookmarked: true } : t)),
      };

    case 'RESTORE_BOOKMARK':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.id ? { ...t, bookmarked: false } : t)),
      };

    case 'DELETE_TASK': {
      let game = applyXp(state.game, action.pointsGained);
      game = { ...game, points: game.points + action.pointsGained };
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id), game };
    }

    case 'ADD_FUTURE_ME': {
      const game = {
        ...state.game,
        badges: [...state.game.badges, ...action.earnedBadges.filter((b) => !state.game.badges.includes(b))],
      };
      return { ...state, futureMe: [action.entry, ...state.futureMe], game };
    }

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } };

    default:
      return state;
  }
}

const StoreContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    loadState<AppState>().then((saved) => {
      dispatch({ type: 'HYDRATE', state: saved ?? initialState });
    });
  }, []);

  useEffect(() => {
    if (state.hydrated) saveState(state);
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

const STREAK_MULTIPLIER_THRESHOLD = 7;

export function useAppState() {
  const { state, dispatch } = useStore();

  const actions = useMemo(
    () => ({
      addTask: (board: BoardId, title: string, note?: string, time?: string) => {
        dispatch({
          type: 'ADD_TASK',
          task: {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            board,
            title,
            note,
            time,
            done: false,
            createdAt: Date.now(),
          },
        });
      },
      editTask: (id: string, title: string, note?: string, time?: string) =>
        dispatch({ type: 'EDIT_TASK', id, title, note, time }),
      completeTask: (id: string) => {
        const now = new Date();
        const projectedGame = applyStreak(state.game, now);
        const basePoints = 10;
        const multiplier = projectedGame.streak >= STREAK_MULTIPLIER_THRESHOLD ? 1.5 : 1;
        const pointsGained = Math.round(basePoints * multiplier);
        const earnedBadges = checkNewBadges(
          projectedGame,
          countCompleted(state.tasks) + 1,
          now,
          state.futureMe.length
        );
        dispatch({ type: 'COMPLETE_TASK', id, earnedBadges, pointsGained, now: now.getTime() });
        return { pointsGained, earnedBadges };
      },
      doLater: (id: string) => dispatch({ type: 'DO_LATER', id }),
      restoreBookmark: (id: string) => dispatch({ type: 'RESTORE_BOOKMARK', id }),
      deleteTask: (id: string) => {
        const pointsGained = 3;
        dispatch({ type: 'DELETE_TASK', id, pointsGained });
        return { pointsGained };
      },
      addFutureMe: (title: string, body: string) => {
        const earnedBadges = checkNewBadges(state.game, countCompleted(state.tasks), new Date(), 1);
        dispatch({
          type: 'ADD_FUTURE_ME',
          entry: { id: `${Date.now()}`, title, body, createdAt: Date.now() },
          earnedBadges,
        });
        return { earnedBadges };
      },
      updateSettings: (settings: Partial<AppSettings>) => dispatch({ type: 'UPDATE_SETTINGS', settings }),
    }),
    [state, dispatch]
  );

  return { state, ...actions };
}
