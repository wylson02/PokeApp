import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
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

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      try {
        const storedFavorites = await getStoredFavorites();
        setFavorites(storedFavorites);
      } finally {
        setLoadingFavorites(false);
      }
    }

    loadFavorites();
  }, []);

  const isFavorite = (name: string) => {
    return favorites.includes(name);
  };

  const toggleFavorite = async (name: string) => {
    const normalizedName = name.toLowerCase();

    const updatedFavorites = favorites.includes(normalizedName)
      ? favorites.filter((favoriteName) => favoriteName !== normalizedName)
      : [...favorites, normalizedName];

    setFavorites(updatedFavorites);
    await saveStoredFavorites(updatedFavorites);
  };

  const value = useMemo(
    () => ({
      favorites,
      isFavorite,
      toggleFavorite,
      loadingFavorites,
    }),
    [favorites, loadingFavorites]
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