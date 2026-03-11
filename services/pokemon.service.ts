import { apiFetch } from './api';
import { PokemonListItem, PokemonDetail } from '../types/pokemon';

type PokemonListResponse = {
  results: {
    name: string;
    url: string;
  }[];
};

type PokemonSpeciesResponse = {
  generation?: {
    name: string;
    url: string;
  };
  names?: {
    name: string;
    language: {
      name: string;
    };
  }[];
};

type PokemonResponse = {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    other?: {
      'official-artwork'?: {
        front_default: string | null;
      };
    };
  };
  types: {
    type: {
      name: string;
    };
  }[];
  stats: {
    base_stat: number;
    stat: {
      name: string;
    };
  }[];
};

const pokemonListCache = new Map<string, PokemonListItem[]>();
const pokemonSpeciesCache = new Map<number, PokemonSpeciesResponse>();
const pokemonDataCache = new Map<number, PokemonResponse>();
const pokemonDetailCache = new Map<string, PokemonDetail>();

function extractIdFromUrl(url: string) {
  const parts = url.split('/').filter(Boolean);
  return Number(parts[parts.length - 1]);
}

function getOfficialArtwork(id: number, pokemonData?: PokemonResponse) {
  return (
    pokemonData?.sprites?.other?.['official-artwork']?.front_default ??
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
  );
}

async function getPokemonSpecies(id: number): Promise<PokemonSpeciesResponse> {
  const cached = pokemonSpeciesCache.get(id);
  if (cached) {
    return cached;
  }

  const data = await apiFetch<PokemonSpeciesResponse>(`/pokemon-species/${id}`);
  pokemonSpeciesCache.set(id, data);
  return data;
}

async function getPokemonData(id: number): Promise<PokemonResponse> {
  const cached = pokemonDataCache.get(id);
  if (cached) {
    return cached;
  }

  const data = await apiFetch<PokemonResponse>(`/pokemon/${id}`);
  pokemonDataCache.set(id, data);
  return data;
}

export async function fetchPokemonList(
  limit: number,
  offset: number
): Promise<PokemonListItem[]> {
  const cacheKey = `${limit}-${offset}`;
  const cachedList = pokemonListCache.get(cacheKey);

  if (cachedList) {
    return cachedList;
  }

  const data = await apiFetch<PokemonListResponse>(
    `/pokemon?limit=${limit}&offset=${offset}`
  );

  const enrichedPokemon = await Promise.all(
    data.results.map(async (pokemon) => {
      const parts = pokemon.url.split('/');
      const id = Number(parts[parts.length - 2]);

      let frenchName = pokemon.name;
      let generationId: number | undefined = undefined;
      let types: string[] = [];

      try {
        const [speciesData, pokemonData] = await Promise.all([
          getPokemonSpecies(id),
          getPokemonData(id),
        ]);

        const frenchEntry = speciesData.names?.find(
          (entry) => entry.language.name === 'fr'
        );

        if (frenchEntry?.name) {
          frenchName = frenchEntry.name;
        }

        if (speciesData.generation?.url) {
          generationId = extractIdFromUrl(speciesData.generation.url);
        }

        types = pokemonData.types.map((t) => t.type.name);

        return {
          id,
          name: pokemon.name,
          frenchName,
          generationId,
          types,
          image: getOfficialArtwork(id, pokemonData),
        };
      } catch {
        return {
          id,
          name: pokemon.name,
          frenchName: pokemon.name,
          generationId: undefined,
          types: [],
          image: getOfficialArtwork(id),
        };
      }
    })
  );

  pokemonListCache.set(cacheKey, enrichedPokemon);
  return enrichedPokemon;
}

export async function fetchPokemonDetail(
  name: string
): Promise<PokemonDetail> {
  const normalizedName = name.trim().toLowerCase();
  const cachedDetail = pokemonDetailCache.get(normalizedName);

  if (cachedDetail) {
    return cachedDetail;
  }

  const data = await apiFetch<PokemonResponse>(`/pokemon/${normalizedName}`);
  pokemonDataCache.set(data.id, data);

  let frenchName = data.name;
  let generationId: number | undefined = undefined;

  try {
    const speciesData = await getPokemonSpecies(data.id);

    const frenchEntry = speciesData.names?.find(
      (entry) => entry.language.name === 'fr'
    );

    if (frenchEntry?.name) {
      frenchName = frenchEntry.name;
    }

    if (speciesData.generation?.url) {
      generationId = extractIdFromUrl(speciesData.generation.url);
    }
  } catch {
    frenchName = data.name;
    generationId = undefined;
  }

  const result: PokemonDetail = {
    id: data.id,
    name: data.name,
    frenchName,
    generationId,
    image: getOfficialArtwork(data.id, data),
    height: data.height,
    weight: data.weight,
    types: data.types.map((t) => ({
      name: t.type.name,
    })),
    stats: data.stats.map((s) => ({
      name: s.stat.name,
      value: s.base_stat,
    })),
  };

  pokemonDetailCache.set(normalizedName, result);
  return result;
}