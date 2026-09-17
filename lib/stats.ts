import type { BoardId, Task } from './types';

function dayKey(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

export function lastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    days.push(dayKey(Date.now() - i * 86400000));
  }
  return days;
}

export function completionsByDay(tasks: Task[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const t of tasks) {
    if (t.done && t.completedAt) {
      const k = dayKey(t.completedAt);
      map[k] = (map[k] ?? 0) + 1;
    }
  }
  return map;
}

export function productivityScore(tasks: Task[]): number {
  const days = lastNDays(7);
  const byDay = completionsByDay(tasks);
  const createdInWindow = tasks.filter((t) => days.includes(dayKey(t.createdAt))).length;
  const completedInWindow = days.reduce((sum, d) => sum + (byDay[d] ?? 0), 0);
  if (createdInWindow === 0 && completedInWindow === 0) return 0;
  return Math.min(100, Math.round((completedInWindow / Math.max(1, createdInWindow)) * 100));
}

export function avgTasksPerDay(tasks: Task[]): number {
  const byDay = completionsByDay(tasks);
  const activeDays = Object.keys(byDay).length || 1;
  const total = Object.values(byDay).reduce((a, b) => a + b, 0);
  return Math.round((total / activeDays) * 10) / 10;
}

export function overdueCount(tasks: Task[]): number {
  const today = dayKey(Date.now());
  return tasks.filter((t) => !t.done && t.board === 'today' && dayKey(t.createdAt) !== today).length;
}

export function laggingBoard(tasks: Task[]): BoardId | null {
  const boards: BoardId[] = ['today', 'tomorrow', 'week', 'someday'];
  let worst: { board: BoardId; ratio: number } | null = null;
  for (const board of boards) {
    const boardTasks = tasks.filter((t) => t.board === board);
    if (boardTasks.length < 2) continue;
    const stale = boardTasks.filter((t) => !t.done && Date.now() - t.createdAt > 3 * 86400000).length;
    const ratio = stale / boardTasks.length;
    if (ratio > 0.4 && (!worst || ratio > worst.ratio)) worst = { board, ratio };
  }
  return worst?.board ?? null;
}
