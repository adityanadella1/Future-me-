import React, { createContext, useContext, useMemo } from 'react';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';

export type Rect = { x: number; y: number; width: number; height: number };

type BinZone = {
  binRect: SharedValue<Rect>;
  binActive: SharedValue<number>;
};

const BinZoneContext = createContext<BinZone | null>(null);

export function BinZoneProvider({ children }: { children: React.ReactNode }) {
  const binRect = useSharedValue<Rect>({ x: 0, y: 0, width: 0, height: 0 });
  const binActive = useSharedValue(0);
  const value = useMemo(() => ({ binRect, binActive }), [binRect, binActive]);
  return <BinZoneContext.Provider value={value}>{children}</BinZoneContext.Provider>;
}

export function useBinZone() {
  const ctx = useContext(BinZoneContext);
  if (!ctx) throw new Error('useBinZone must be used within BinZoneProvider');
  return ctx;
}

export function rectsIntersect(px: number, py: number, r: Rect): boolean {
  'worklet';
  return px >= r.x && px <= r.x + r.width && py >= r.y && py <= r.y + r.height;
}
