import { useLocalSearchParams } from 'expo-router';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import FavoriteButton from '../../components/FavoriteButton';
import Loader from '../../components/Loader';
import StatsList from '../../components/StatsList';
import TypeBadge from '../../components/TypeBadge';
import { useFavorites } from '../../context/FavoritesContext';
import { usePokemonDetail } from '../../hooks/usePokemonDetail';

function formatPokemonId(id: number) {
  return `#${id.toString().padStart(3, '0')}`;
}

function formatPokemonName(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function formatHeight(height: number) {
  return `${height / 10} m`;
}

function formatWeight(weight: number) {
  return `${weight / 10} kg`;
}

export default function PokemonDetailScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const { pokemon, loading, error, reload } = usePokemonDetail(name);
  const { isFavorite, toggleFavorite } = useFavorites();

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Loader />
      </SafeAreaView>
    );
  }

  if (error || !pokemon) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error || 'Pokémon introuvable.'}</Text>
          <Pressable style={styles.retryButton} onPress={reload}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const favorite = isFavorite(pokemon.name);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <Image
            source={{ uri: pokemon.image }}
            style={styles.image}
            resizeMode="contain"
          />

          <Text style={styles.id}>{formatPokemonId(pokemon.id)}</Text>
          <Text style={styles.name}>{formatPokemonName(pokemon.name)}</Text>

          <View style={styles.typesContainer}>
            {pokemon.types.map((type) => (
              <TypeBadge key={type.name} type={type.name} />
            ))}
          </View>

          <FavoriteButton
            isFavorite={favorite}
            onPress={() => toggleFavorite(pokemon.name)}
          />
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Informations</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Taille</Text>
            <Text style={styles.infoValue}>{formatHeight(pokemon.height)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Poids</Text>
            <Text style={styles.infoValue}>{formatWeight(pokemon.weight)}</Text>
          </View>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Stats principales</Text>
          <StatsList stats={pokemon.stats} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 3,
  },
  image: {
    width: 180,
    height: 180,
    marginBottom: 12,
  },
  id: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 14,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 3,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 15,
    color: '#374151',
  },
  infoValue: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '700',
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#B91C1C',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#EF5350',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});