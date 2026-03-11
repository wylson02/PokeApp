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
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export default function PokemonCard({ pokemon, onPress }: PokemonCardProps) {
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
      <Text style={styles.name}>{formatPokemonName(pokemon.name)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    margin: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
  },
  image: {
    width: 90,
    height: 90,
  },
  id: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
});