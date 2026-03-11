import { router, useLocalSearchParams } from 'expo-router';
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

function formatEvolutionCondition(evolution: {
  trigger?: string;
  minLevel?: number | null;
  item?: string | null;
  heldItem?: string | null;
  minHappiness?: number | null;
  timeOfDay?: string | null;
}) {
  if (evolution.item) {
    return `Objet : ${evolution.item}`;
  }

  if (evolution.heldItem) {
    return `Objet tenu : ${evolution.heldItem}`;
  }

  if (evolution.minLevel) {
    return `Niveau ${evolution.minLevel}`;
  }

  if (evolution.minHappiness) {
    return `Bonheur ${evolution.minHappiness}`;
  }

  if (evolution.timeOfDay) {
    return `Moment : ${evolution.timeOfDay}`;
  }

  if (evolution.trigger === 'trade') {
    return 'Échange';
  }

  return 'Évolution spéciale';
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

            <Pressable
              style={styles.backToPokedexButton}
              onPress={() => router.replace('/pokedex')}
            >
              <Text style={styles.backToPokedexButtonText}>Retour au Pokédex</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const favorite = isFavorite(pokemon.name);
  const displayName = pokemon.frenchName ?? pokemon.name;

  const baseEvolution = pokemon.evolutions?.[0];
  const nextEvolutions = pokemon.evolutions?.slice(1) ?? [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
          onPress={() => router.replace('/pokedex')}
        >
          <Text style={styles.backButtonText}>← Retour au Pokédex</Text>
        </Pressable>

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

        {pokemon.evolutions && pokemon.evolutions.length > 0 ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Évolutions</Text>

            {baseEvolution ? (
              <Pressable
                style={({ pressed }) => [
                  styles.baseEvolutionCard,
                  pressed && styles.evolutionCardPressed,
                ]}
                onPress={() => router.push(`/pokemon/${baseEvolution.name}`)}
              >
                <View style={styles.baseEvolutionImagePanel}>
                  <Image
                    source={{ uri: baseEvolution.image }}
                    style={styles.baseEvolutionImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.baseEvolutionLabel}>Base</Text>
                <Text style={styles.baseEvolutionName}>
                  {formatPokemonName(baseEvolution.frenchName ?? baseEvolution.name)}
                </Text>
              </Pressable>
            ) : null}

            {nextEvolutions.length > 0 ? (
              <View style={styles.evolutionGrid}>
                {nextEvolutions.map((evolution, index) => {
                  const condition = formatEvolutionCondition(evolution);

                  return (
                    <Pressable
                      key={`${evolution.name}-${index}`}
                      style={({ pressed }) => [
                        styles.evolutionBranchCard,
                        pressed && styles.evolutionCardPressed,
                      ]}
                      onPress={() => router.push(`/pokemon/${evolution.name}`)}
                    >
                      <Text style={styles.branchArrow}>↓</Text>

                      <View style={styles.conditionBadge}>
                        <Text style={styles.conditionBadgeText}>{condition}</Text>
                      </View>

                      <View style={styles.evolutionImagePanel}>
                        <Image
                          source={{ uri: evolution.image }}
                          style={styles.evolutionImage}
                          resizeMode="contain"
                        />
                      </View>

                      <Text style={styles.evolutionName}>
                        {formatPokemonName(evolution.frenchName ?? evolution.name)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>
        ) : null}

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
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DCE8DF',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  backButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  backButtonText: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '700',
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
  baseEvolutionCard: {
    backgroundColor: '#F6FAF7',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#D7E6DA',
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  baseEvolutionImagePanel: {
    width: 130,
    height: 130,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  baseEvolutionImage: {
    width: 95,
    height: 95,
  },
  baseEvolutionLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
    marginBottom: 4,
  },
  baseEvolutionName: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '800',
    textAlign: 'center',
  },
  evolutionGrid: {
    gap: 12,
  },
  evolutionBranchCard: {
    backgroundColor: '#F6FAF7',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#D7E6DA',
    padding: 16,
    alignItems: 'center',
  },
  evolutionCardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
  branchArrow: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4CAF50',
    marginBottom: 8,
  },
  conditionBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  conditionBadgeText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#2E7D32',
    fontWeight: '800',
    textAlign: 'center',
  },
  evolutionImagePanel: {
    width: 120,
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  evolutionImage: {
    width: 90,
    height: 90,
  },
  evolutionName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
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
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  backToPokedexButton: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },
  backToPokedexButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});