import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'future-me:v1';

export async function loadState<T>(): Promise<T | null> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function saveState<T>(state: T): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
}
