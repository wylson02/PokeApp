import { apiFetch } from './api';
import { PokemonListItem, PokemonDetail } from '../types/pokemon';

type PokemonListResponse = {
  results: {
    name: string;
    url: string;
  }[];
};

type PokemonSpeciesResponse = {
  names?: {
    name: string;
    language: {
      name: string;
    };
  }[];
};

export async function fetchPokemonList(
  limit: number,
  offset: number
): Promise<PokemonListItem[]> {
  const data = await apiFetch<PokemonListResponse>(
    `/pokemon?limit=${limit}&offset=${offset}`
  );

  const enrichedPokemon = await Promise.all(
    data.results.map(async (pokemon) => {
      const parts = pokemon.url.split('/');
      const id = Number(parts[parts.length - 2]);

      let frenchName = pokemon.name;

      try {
        const speciesData = await apiFetch<PokemonSpeciesResponse>(
          `/pokemon-species/${id}`
        );

        const frenchEntry = speciesData.names?.find(
          (entry) => entry.language.name === 'fr'
        );

        if (frenchEntry?.name) {
          frenchName = frenchEntry.name;
        }
      } catch {
        frenchName = pokemon.name;
      }

      return {
        id,
        name: pokemon.name,
        frenchName,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
      };
    })
  );

  return enrichedPokemon;
}

export async function fetchPokemonDetail(
  name: string
): Promise<PokemonDetail> {
  const data = await apiFetch<any>(`/pokemon/${name}`);

  let frenchName = data.name;

  try {
    const speciesData = await apiFetch<PokemonSpeciesResponse>(
      `/pokemon-species/${data.id}`
    );

    const frenchEntry = speciesData.names?.find(
      (entry) => entry.language.name === 'fr'
    );

    if (frenchEntry?.name) {
      frenchName = frenchEntry.name;
    }
  } catch {
    frenchName = data.name;
  }

  return {
    id: data.id,
    name: data.name,
    frenchName,
    image: data.sprites.other['official-artwork'].front_default,
    height: data.height,
    weight: data.weight,
    types: data.types.map((t: any) => ({
      name: t.type.name,
    })),
    stats: data.stats.map((s: any) => ({
      name: s.stat.name,
      value: s.base_stat,
    })),
  };
}