import { useCallback, useEffect, useState } from 'react';
import { fetchPokemonList } from '../services/pokemon.service';
import { PokemonListItem } from '../types/pokemon';

const PAGE_SIZE = 20;

export function usePokemonList() {
  const [pokemon, setPokemon] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  const loadInitialPokemon = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchPokemonList(PAGE_SIZE, 0);
      setPokemon(data);
      setOffset(PAGE_SIZE);
    } catch (err) {
      setError('Impossible de charger les Pokémon.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMorePokemon = useCallback(async () => {
    if (loadingMore || loading) {
      return;
    }

    try {
      setLoadingMore(true);
      setError(null);

      const data = await fetchPokemonList(PAGE_SIZE, offset);
      setPokemon((prev) => [...prev, ...data]);
      setOffset((prev) => prev + PAGE_SIZE);
    } catch (err) {
      setError('Impossible de charger plus de Pokémon.');
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, offset]);

  useEffect(() => {
    loadInitialPokemon();
  }, [loadInitialPokemon]);

  return {
    pokemon,
    loading,
    loadingMore,
    error,
    reload: loadInitialPokemon,
    loadMore: loadMorePokemon,
  };
}