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
  if (!name) return '';
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
          <View style={styles.stateCard}>
            <Text style={styles.stateEmoji}>⚠️</Text>
            <Text style={styles.errorText}>{error || 'Pokémon introuvable.'}</Text>
            <Pressable style={styles.retryButton} onPress={reload}>
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const favorite = isFavorite(pokemon.name);
  const displayName = pokemon.frenchName ?? pokemon.name;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.imagePanel}>
            <Image
              source={{ uri: pokemon.image }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.id}>{formatPokemonId(pokemon.id)}</Text>
            <Text style={styles.name}>{formatPokemonName(displayName)}</Text>
            <Text style={styles.subtitle}>Fiche détaillée du Pokémon</Text>
          </View>

          <View style={styles.favoriteWrapper}>
            <FavoriteButton
              isFavorite={favorite}
              onPress={() => toggleFavorite(pokemon.name)}
            />
          </View>

          <View style={styles.typesContainer}>
            {pokemon.types.map((type) => (
              <TypeBadge key={type.name} type={type.name} />
            ))}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Informations</Text>

          <View style={styles.metricsRow}>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Taille</Text>
              <Text style={styles.metricValue}>{formatHeight(pokemon.height)}</Text>
            </View>

            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Poids</Text>
              <Text style={styles.metricValue}>{formatWeight(pokemon.weight)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
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
    backgroundColor: '#EEF4F0',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DCE8DF',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  imagePanel: {
    width: '100%',
    height: 240,
    backgroundColor: '#F6FAF7',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#D7E6DA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  image: {
    width: 190,
    height: 190,
  },
  titleBlock: {
    alignItems: 'center',
    marginBottom: 6,
  },
  id: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
    fontWeight: '600',
  },
  name: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B',
    textAlign: 'center',
  },
  favoriteWrapper: {
    marginTop: 14,
    marginBottom: 14,
    alignItems: 'center',
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DCE8DF',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#F6FAF7',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D7E6DA',
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 18,
    color: '#1E293B',
    fontWeight: '800',
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  stateCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  stateEmoji: {
    fontSize: 28,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#B91C1C',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});