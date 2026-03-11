export type PokemonListItem = {
  id: number;
  name: string;
  image: string;
};

export type PokemonType = {
  name: string;
};

export type PokemonStat = {
  name: string;
  value: number;
};

export type PokemonDetail = {
  id: number;
  name: string;
  image: string;
  types: PokemonType[];
  stats: PokemonStat[];
  height: number;
  weight: number;
};