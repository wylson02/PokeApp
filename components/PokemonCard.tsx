import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { PokemonListItem } from '../types/pokemon';

type PokemonCardProps = {
  pokemon: PokemonListItem;
  onPress: () => void;
};

function formatPokemonId(id: number) {
  return `#${id.toString().padStart(3, '0')}`;
}

function formatPokemonName(name: string) {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function formatTypeName(type?: string) {
  if (!type) return '';
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function getTypeLabel(type?: string) {
  if (!type) return '';

  const typeMap: Record<string, string> = {
    normal: 'Normal',
    fire: 'Feu',
    water: 'Eau',
    electric: 'Électrik',
    grass: 'Plante',
    ice: 'Glace',
    fighting: 'Combat',
    poison: 'Poison',
    ground: 'Sol',
    flying: 'Vol',
    psychic: 'Psy',
    bug: 'Insecte',
    rock: 'Roche',
    ghost: 'Spectre',
    dragon: 'Dragon',
    dark: 'Ténèbres',
    steel: 'Acier',
    fairy: 'Fée',
  };

  return typeMap[type] ?? formatTypeName(type);
}

export default function PokemonCard({ pokemon, onPress }: PokemonCardProps) {
  const displayName = pokemon.displayName ?? pokemon.frenchName ?? pokemon.name;
  const primaryType = pokemon.types?.[0];

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: pokemon.image }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.id}>{formatPokemonId(pokemon.id)}</Text>
      <Text style={styles.name} numberOfLines={2}>
        {formatPokemonName(displayName)}
      </Text>

      {primaryType ? (
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{getTypeLabel(primaryType)}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 12,
    margin: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DCE8DF',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 118,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#F6FAF7',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D7E6DA',
  },
  image: {
    width: 92,
    height: 92,
  },
  id: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
    fontWeight: '600',
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    minHeight: 42,
    marginBottom: 8,
  },
  typeBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2E7D32',
  },
});