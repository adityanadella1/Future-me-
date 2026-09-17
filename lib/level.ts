// Level table straight from the design doc's gamification strategy.
type Tier = { levels: [number, number]; xpRange: [number, number]; title: string };

const TIERS: Tier[] = [
  { levels: [1, 3], xpRange: [0, 600], title: 'Fresh Start' },
  { levels: [4, 6], xpRange: [600, 2400], title: 'Building Momentum' },
  { levels: [7, 10], xpRange: [2400, 6000], title: 'Steady Achiever' },
  { levels: [11, 20], xpRange: [6000, 18000], title: 'Consistency Master' },
  { levels: [21, 21], xpRange: [18000, 18000 + 2000 * 100], title: 'Future Self' },
];

function tierForXp(xp: number): Tier {
  return TIERS.find((t) => xp < t.xpRange[1]) ?? TIERS[TIERS.length - 1];
}

export function levelForXp(xp: number): number {
  const tier = tierForXp(xp);
  const [lvLo, lvHi] = tier.levels;
  const [xpLo, xpHi] = tier.xpRange;
  if (lvLo === lvHi) return lvLo + Math.floor((xp - xpLo) / 2000);
  const levelSpan = lvHi - lvLo + 1;
  const xpPerLevel = (xpHi - xpLo) / levelSpan;
  return Math.min(lvHi, lvLo + Math.floor((xp - xpLo) / xpPerLevel));
}

export function xpIntoLevel(xp: number): { current: number; needed: number } {
  const tier = tierForXp(xp);
  const [lvLo, lvHi] = tier.levels;
  const [xpLo, xpHi] = tier.xpRange;
  const xpPerLevel = lvLo === lvHi ? 2000 : (xpHi - xpLo) / (lvHi - lvLo + 1);
  const level = levelForXp(xp);
  const levelStartXp = xpLo + (level - lvLo) * xpPerLevel;
  return { current: Math.round(xp - levelStartXp), needed: Math.round(xpPerLevel) };
}

export function titleForLevel(level: number): string {
  const tier = TIERS.find((t) => level >= t.levels[0] && level <= t.levels[1]);
  return tier?.title ?? TIERS[TIERS.length - 1].title;
}
