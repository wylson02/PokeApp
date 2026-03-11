import { useEffect, useState } from 'react';
import { fetchPokemonDetail } from '../services/pokemon.service';
import { PokemonListItem } from '../types/pokemon';
import { useFavorites } from '../context/FavoritesContext';

export function useFavoritePokemon() {
  const { favorites, loadingFavorites } = useFavorites();
  const [pokemon, setPokemon] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFavoritePokemon() {
      if (loadingFavorites) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (favorites.length === 0) {
          setPokemon([]);
          setLoading(false);
          return;
        }

        const details = await Promise.all(
          favorites.map((name) => fetchPokemonDetail(name))
        );

        const mappedPokemon: PokemonListItem[] = details.map((item) => ({
          id: item.id,
          name: item.name,
          frenchName: item.frenchName,
          image: item.image,
          generationId: item.generationId,
          types: item.types.map((type) => type.name),
        }));

        mappedPokemon.sort((a, b) => a.id - b.id);
        setPokemon(mappedPokemon);
      } catch {
        setError('Impossible de charger les favoris.');
        setPokemon([]);
      } finally {
        setLoading(false);
      }
    }

    loadFavoritePokemon();
  }, [favorites, loadingFavorites]);

  return {
    pokemon,
    loading: loading || loadingFavorites,
    error,
  };
}