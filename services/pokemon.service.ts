import { apiFetch } from "./api";
import { PokemonListItem, PokemonDetail } from "../types/pokemon";

type PokemonListResponse = {
  results: {
    name: string;
    url: string;
  }[];
};

export async function fetchPokemonList(
  limit: number,
  offset: number
): Promise<PokemonListItem[]> {
  const data = await apiFetch<PokemonListResponse>(
    `/pokemon?limit=${limit}&offset=${offset}`
  );

  return data.results.map((pokemon) => {
    const parts = pokemon.url.split("/");
    const id = Number(parts[parts.length - 2]);

    return {
      id,
      name: pokemon.name,
      image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
    };
  });
}

export async function fetchPokemonDetail(
  name: string
): Promise<PokemonDetail> {
  const data = await apiFetch<any>(`/pokemon/${name}`);

  return {
    id: data.id,
    name: data.name,
    image:
      data.sprites.other["official-artwork"].front_default,
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