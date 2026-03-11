import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@pokedexmobile:favorites';

export async function getStoredFavorites(): Promise<string[]> {
  try {
    const value = await AsyncStorage.getItem(FAVORITES_KEY);

    if (!value) {
      return [];
    }

    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch {
    return [];
  }
}

export async function saveStoredFavorites(favorites: string[]): Promise<void> {
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}