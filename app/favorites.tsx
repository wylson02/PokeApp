import { router } from 'expo-router';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Loader from '../components/Loader';
import PokemonCard from '../components/PokemonCard';
import { useFavoritePokemon } from '../hooks/useFavoritePokemon';
import { PokemonListItem } from '../types/pokemon';

export default function FavoritesScreen() {
  const { pokemon, loading, error } = useFavoritePokemon();

  const renderItem = ({ item }: { item: PokemonListItem }) => {
    return (
      <PokemonCard
        pokemon={item}
        onPress={() => router.push(`/pokemon/${item.name}`)}
      />
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Loader />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerState}>
          <View style={styles.stateCard}>
            <Text style={styles.stateEmoji}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.heroCard}>
          <Text style={styles.title}>Mes favoris</Text>
          <Text style={styles.subtitle}>
            Retrouve ici les Pokémon que tu as sauvegardés
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.infoBadge}>
              <Text style={styles.infoBadgeText}>
                {pokemon.length} favori{pokemon.length > 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>

        <FlatList
          data={pokemon}
          keyExtractor={(item) => item.name}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[
            styles.listContent,
            pokemon.length === 0 && styles.emptyListContent,
          ]}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>⭐</Text>
                <Text style={styles.emptyTitle}>Aucun favori pour le moment</Text>
                <Text style={styles.emptyText}>
                  Ajoute des Pokémon en favoris depuis leur page détail pour les
                  retrouver ici rapidement.
                </Text>
              </View>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EEF4F0',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
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
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B',
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  infoBadgeText: {
    color: '#2E7D32',
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 28,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
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
    lineHeight: 22,
  },
  emptyContainer: {
    paddingTop: 12,
    paddingBottom: 12,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyEmoji: {
    fontSize: 28,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
});