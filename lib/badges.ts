import type { Badge, BadgeId, GameState, Task } from './types';

export const BADGES: Badge[] = [
  { id: 'first_task', name: 'First Task', tier: 'bronze', emoji: '🌱', description: 'Complete your first task' },
  { id: 'first_streak_day', name: 'Day One', tier: 'bronze', emoji: '☀️', description: 'Start a streak' },
  { id: 'early_bird', name: 'Early Bird', tier: 'bronze', emoji: '🌅', description: 'Complete a task before 9am' },
  { id: 'streak_7', name: '7-Day Streak', tier: 'silver', emoji: '🔥', description: 'Keep a 7-day streak' },
  { id: 'tasks_50', name: 'Sharp Shooter', tier: 'silver', emoji: '🎯', description: 'Complete 50 tasks' },
  { id: 'streak_30', name: '30-Day King', tier: 'gold', emoji: '👑', description: 'Keep a 30-day streak' },
  { id: 'future_me_goal', name: 'Goal Getter', tier: 'gold', emoji: '⛰️', description: 'Write a Future Me entry' },
  { id: 'streak_100', name: 'Deep Focus', tier: 'legendary', emoji: '🌙', description: 'Keep a 100-day streak' },
];

export function checkNewBadges(
  game: GameState,
  tasksCompleted: number,
  justCompletedAt: Date,
  futureMeCount: number
): BadgeId[] {
  const have = new Set(game.badges);
  const earned: BadgeId[] = [];
  const earn = (id: BadgeId, condition: boolean) => {
    if (condition && !have.has(id)) earned.push(id);
  };

  earn('first_task', tasksCompleted >= 1);
  earn('first_streak_day', game.streak >= 1);
  earn('early_bird', justCompletedAt.getHours() < 9);
  earn('streak_7', game.streak >= 7);
  earn('tasks_50', tasksCompleted >= 50);
  earn('streak_30', game.streak >= 30);
  earn('future_me_goal', futureMeCount >= 1);
  earn('streak_100', game.streak >= 100);

  return earned;
}

export function countCompleted(tasks: Task[]): number {
  return tasks.filter((t) => t.done).length;
}
