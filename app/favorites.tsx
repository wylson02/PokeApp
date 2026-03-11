import { router } from 'expo-router';
import {
  FlatList,
  Pressable,
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
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Mes favoris</Text>
        <Text style={styles.subtitle}>
          Retrouve ici les Pokémon que tu as sauvegardés
        </Text>

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
              <Text style={styles.emptyTitle}>Aucun favori pour le moment</Text>
              <Text style={styles.emptyText}>
                Ajoute des Pokémon en favoris depuis leur page détail.
              </Text>
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
    backgroundColor: '#F7F8FA',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
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
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  row: {
    gap: 0,
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
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});