import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import {
  getStoredFavorites,
  saveStoredFavorites,
} from '../storage/favorites.storage';

type FavoritesContextType = {
  favorites: string[];
  isFavorite: (name: string) => boolean;
  toggleFavorite: (name: string) => Promise<void>;
  loadingFavorites: boolean;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

type FavoritesProviderProps = {
  children: ReactNode;
};

function normalizePokemonName(name: string) {
  return name.trim().toLowerCase();
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      try {
        const storedFavorites = await getStoredFavorites();
        const normalizedFavorites = storedFavorites.map(normalizePokemonName);
        setFavorites(normalizedFavorites);
      } finally {
        setLoadingFavorites(false);
      }
    }

    loadFavorites();
  }, []);

  const favoritesSet = useMemo(() => {
    return new Set(favorites);
  }, [favorites]);

  const isFavorite = useCallback(
    (name: string) => {
      return favoritesSet.has(normalizePokemonName(name));
    },
    [favoritesSet]
  );

  const toggleFavorite = useCallback(async (name: string) => {
    const normalizedName = normalizePokemonName(name);

    let nextFavorites: string[] = [];

    setFavorites((prev) => {
      nextFavorites = prev.includes(normalizedName)
        ? prev.filter((favoriteName) => favoriteName !== normalizedName)
        : [...prev, normalizedName];

      return nextFavorites;
    });

    await saveStoredFavorites(nextFavorites);
  }, []);

  const value = useMemo(
    () => ({
      favorites,
      isFavorite,
      toggleFavorite,
      loadingFavorites,
    }),
    [favorites, isFavorite, toggleFavorite, loadingFavorites]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }

  return context;
}