import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
} from 'react-native';

import PokemonCard from '../components/PokemonCard';
import Loader from '../components/Loader';
import { usePokemonList } from '../hooks/usePokemonList';
import { PokemonListItem } from '../types/pokemon';

export default function HomeScreen() {
  const { pokemon, loading, loadingMore, error, reload, loadMore } =
    usePokemonList();

  const [search, setSearch] = useState('');

  const filteredPokemon = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return pokemon;
    }

    return pokemon.filter((item) =>
      item.name.toLowerCase().includes(normalizedSearch)
    );
  }, [pokemon, search]);

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

  if (error && pokemon.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={reload}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextBlock}>
            <Text style={styles.title}>Pokédex</Text>
            <Text style={styles.subtitle}>
              Recherche un Pokémon et ouvre sa fiche détail
            </Text>
          </View>

          <Pressable
            style={styles.favoritesButton}
            onPress={() => router.push('/favorites')}
          >
            <Text style={styles.favoritesButtonText}>Favoris</Text>
          </Pressable>
        </View>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher par nom..."
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <FlatList
          data={filteredPokemon}
          keyExtractor={(item) => item.name}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucun Pokémon trouvé.</Text>
            </View>
          }
          ListFooterComponent={
            <View style={styles.footer}>
              <Pressable
                style={styles.loadMoreButton}
                onPress={loadMore}
                disabled={loadingMore}
              >
                <Text style={styles.loadMoreButtonText}>
                  {loadingMore ? 'Chargement...' : 'Charger plus'}
                </Text>
              </Pressable>

              {error && pokemon.length > 0 ? (
                <Text style={styles.inlineErrorText}>{error}</Text>
              ) : null}
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  headerTextBlock: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  favoritesButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  favoritesButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  listContent: {
    paddingBottom: 24,
  },
  row: {
    gap: 0,
  },
  footer: {
    paddingTop: 12,
    paddingBottom: 24,
    alignItems: 'center',
  },
  loadMoreButton: {
    backgroundColor: '#EF5350',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  loadMoreButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
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
  emptyContainer: {
    paddingTop: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  inlineErrorText: {
    marginTop: 10,
    fontSize: 13,
    color: '#B91C1C',
    textAlign: 'center',
  },
});