export type PokemonListItem = {
  id: number;
  name: string;
  frenchName?: string;
  displayName?: string;
  image: string;

  generationId?: number;
  types?: string[];
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
  frenchName?: string;
  image: string;

  generationId?: number;

  height: number;
  weight: number;

  types: {
    name: string;
  }[];

  stats: {
    name: string;
    value: number;
  }[];
};