import { apiFetch } from './api';
import {
  PokemonListItem,
  PokemonDetail,
  PokemonEvolution,
} from '../types/pokemon';

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
  evolution_chain?: {
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

type EvolutionChainResponse = {
  chain: EvolutionNode;
};

type EvolutionNode = {
  species: {
    name: string;
    url: string;
  };
  evolves_to: EvolutionNode[];
  evolution_details: EvolutionDetail[];
};

type EvolutionDetail = {
  min_level?: number | null;
  min_happiness?: number | null;
  time_of_day?: string;
  trigger?: {
    name: string;
  };
  item?: {
    name: string;
  } | null;
  held_item?: {
    name: string;
  } | null;
};

const pokemonListCache = new Map<string, PokemonListItem[]>();
const pokemonSpeciesCache = new Map<number, PokemonSpeciesResponse>();
const pokemonDataCache = new Map<number, PokemonResponse>();
const pokemonDetailCache = new Map<string, PokemonDetail>();
const evolutionChainCache = new Map<string, PokemonEvolution[]>();

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

function formatItemName(name?: string | null) {
  if (!name) return null;
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
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

async function getFrenchNameFromSpeciesId(id: number, fallbackName: string) {
  try {
    const speciesData = await getPokemonSpecies(id);
    const frenchEntry = speciesData.names?.find(
      (entry) => entry.language.name === 'fr'
    );
    return frenchEntry?.name ?? fallbackName;
  } catch {
    return fallbackName;
  }
}

async function buildEvolutionChain(
  evolutionChainUrl: string
): Promise<PokemonEvolution[]> {
  const cached = evolutionChainCache.get(evolutionChainUrl);
  if (cached) {
    return cached;
  }

  const evolutionPath = evolutionChainUrl.replace(
    'https://pokeapi.co/api/v2',
    ''
  );

  const evolutionChainData =
    await apiFetch<EvolutionChainResponse>(evolutionPath);

  const evolutions: PokemonEvolution[] = [];

  async function walkChain(
    node: EvolutionNode,
    inheritedDetail?: EvolutionDetail
  ) {
    const id = extractIdFromUrl(node.species.url);
    const pokemonData = await getPokemonData(id);
    const frenchName = await getFrenchNameFromSpeciesId(id, node.species.name);

    evolutions.push({
      name: node.species.name,
      frenchName,
      image: getOfficialArtwork(id, pokemonData),
      trigger: inheritedDetail?.trigger?.name,
      minLevel: inheritedDetail?.min_level ?? null,
      item: formatItemName(inheritedDetail?.item?.name),
      heldItem: formatItemName(inheritedDetail?.held_item?.name),
      minHappiness: inheritedDetail?.min_happiness ?? null,
      timeOfDay: inheritedDetail?.time_of_day || null,
    });

    for (const nextNode of node.evolves_to) {
      const detail = nextNode.evolution_details?.[0];
      await walkChain(nextNode, detail);
    }
  }

  await walkChain(evolutionChainData.chain);
  evolutionChainCache.set(evolutionChainUrl, evolutions);

  return evolutions;
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
  let evolutions: PokemonEvolution[] = [];

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

    if (speciesData.evolution_chain?.url) {
      evolutions = await buildEvolutionChain(speciesData.evolution_chain.url);
    }
  } catch {
    frenchName = data.name;
    generationId = undefined;
    evolutions = [];
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
    evolutions,
  };

  pokemonDetailCache.set(normalizedName, result);
  return result;
}