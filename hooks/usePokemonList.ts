import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchPokemonList } from "../services/pokemon.service";
import { PokemonListItem } from "../types/pokemon";

const INITIAL_VISIBLE_COUNT = 20;
const LOAD_MORE_STEP = 20;
const TOTAL_POKEMON_LIMIT = 2000;

export function usePokemonList() {
  const [allPokemon, setAllPokemon] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  const loadInitialPokemon = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchPokemonList(TOTAL_POKEMON_LIMIT, 0);

      setAllPokemon(data);
      setVisibleCount(INITIAL_VISIBLE_COUNT);
    } catch {
      setError("Impossible de charger les Pokémon.");
      setAllPokemon([]);
      setVisibleCount(INITIAL_VISIBLE_COUNT);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMorePokemon = useCallback(async () => {
    if (loading || loadingMore || allPokemon.length === 0) {
      return;
    }

    if (visibleCount >= allPokemon.length) {
      return;
    }

    try {
      setLoadingMore(true);

      setVisibleCount((prev) =>
        Math.min(prev + LOAD_MORE_STEP, allPokemon.length)
      );
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, visibleCount, allPokemon.length]);

  useEffect(() => {
    loadInitialPokemon();
  }, [loadInitialPokemon]);

  const pokemon = useMemo(() => {
    return allPokemon.slice(0, visibleCount);
  }, [allPokemon, visibleCount]);

  return {
    allPokemon,
    pokemon,
    loading,
    loadingMore,
    error,
    reload: loadInitialPokemon,
    loadMore: loadMorePokemon,
  };
}