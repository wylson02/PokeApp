import { useCallback, useEffect, useState } from 'react';
import { fetchPokemonDetail } from '../services/pokemon.service';
import { PokemonDetail } from '../types/pokemon';

export function usePokemonDetail(name?: string) {
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPokemon = useCallback(async () => {
    if (!name) {
      setError('Pokémon introuvable.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await fetchPokemonDetail(name);
      setPokemon(data);
    } catch (err) {
      setError('Impossible de charger ce Pokémon.');
    } finally {
      setLoading(false);
    }
  }, [name]);

  useEffect(() => {
    loadPokemon();
  }, [loadPokemon]);

  return {
    pokemon,
    loading,
    error,
    reload: loadPokemon,
  };
}