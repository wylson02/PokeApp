import { useMemo, useRef, useState } from "react";
import { router } from "expo-router";
import {
  Animated,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";

import PokemonCard from "../components/PokemonCard";
import Loader from "../components/Loader";
import { usePokemonList } from "../hooks/usePokemonList";
import { PokemonListItem } from "../types/pokemon";

type Language = "fr" | "en";

const HEADER_HEIGHT = 240;

export default function HomeScreen() {
  const { allPokemon, pokemon, loading, loadingMore, error, reload, loadMore } =
    usePokemonList();

  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState<Language>("fr");

  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const headerVisible = useRef(true);

  const filteredPokemon = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return pokemon;
    }

    return allPokemon.filter((item) => {
      const frenchName = (item.frenchName ?? "").toLowerCase();
      const englishName = item.name.toLowerCase();

      return (
        frenchName.includes(normalizedSearch) ||
        englishName.includes(normalizedSearch)
      );
    });
  }, [allPokemon, pokemon, search]);

  const showHeader = () => {
    if (headerVisible.current) return;

    headerVisible.current = true;
    Animated.timing(headerTranslateY, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const hideHeader = () => {
    if (!headerVisible.current) return;

    headerVisible.current = false;
    Animated.timing(headerTranslateY, {
      toValue: -HEADER_HEIGHT,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;

    if (currentY <= 0) {
      showHeader();
      lastScrollY.current = currentY;
      return;
    }

    if (diff > 8 && currentY > 40) {
      hideHeader();
    } else if (diff < -8) {
      showHeader();
    }

    lastScrollY.current = currentY;
  };

  const renderItem = ({ item }: { item: PokemonListItem }) => {
    const displayName =
      language === "fr" ? item.frenchName ?? item.name : item.name;

    return (
      <PokemonCard
        pokemon={{
          ...item,
          displayName,
        }}
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
          <View style={styles.stateCard}>
            <Text style={styles.stateEmoji}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={reload}>
              <Text style={styles.retryButtonText}>
                {language === "fr" ? "Réessayer" : "Retry"}
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.headerOverlay,
            {
              transform: [{ translateY: headerTranslateY }],
            },
          ]}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroTextBlock}>
                <Text style={styles.title}>Pokédex</Text>
                <Text style={styles.subtitle}>
                  {language === "fr"
                    ? "Explore, recherche et consulte tes Pokémon"
                    : "Explore, search and browse your Pokémon"}
                </Text>
              </View>

              <View style={styles.rightActions}>
                <View style={styles.languageSwitch}>
                  <Pressable
                    style={[
                      styles.languageButton,
                      language === "fr" && styles.languageButtonActive,
                    ]}
                    onPress={() => setLanguage("fr")}
                  >
                    <Text
                      style={[
                        styles.languageButtonText,
                        language === "fr" && styles.languageButtonTextActive,
                      ]}
                    >
                      VF
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.languageButton,
                      language === "en" && styles.languageButtonActive,
                    ]}
                    onPress={() => setLanguage("en")}
                  >
                    <Text
                      style={[
                        styles.languageButtonText,
                        language === "en" && styles.languageButtonTextActive,
                      ]}
                    >
                      VE
                    </Text>
                  </Pressable>
                </View>

                <Pressable
                  style={styles.favoritesButton}
                  onPress={() => router.push("/favorites")}
                >
                  <Text style={styles.favoritesButtonText}>
                    {language === "fr" ? "Favoris" : "Favorites"}
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.searchWrapper}>
              <Text style={styles.searchIcon}>🔎</Text>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={
                  language === "fr"
                    ? "Rechercher un Pokémon..."
                    : "Search a Pokémon..."
                }
                placeholderTextColor="#94A3B8"
                style={styles.searchInput}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoBadge}>
                <Text style={styles.infoBadgeText}>
                  {filteredPokemon.length}{" "}
                  {language === "fr"
                    ? `résultat${filteredPokemon.length > 1 ? "s" : ""}`
                    : `result${filteredPokemon.length > 1 ? "s" : ""}`}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.FlatList
          data={filteredPokemon}
          keyExtractor={(item) => item.name}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onEndReached={() => {
            if (!loadingMore && !search.trim()) {
              loadMore();
            }
          }}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>🔍</Text>
                <Text style={styles.emptyTitle}>
                  {language === "fr"
                    ? "Aucun Pokémon trouvé"
                    : "No Pokémon found"}
                </Text>
                <Text style={styles.emptyText}>
                  {language === "fr"
                    ? "Essaie un autre nom pour lancer une nouvelle recherche."
                    : "Try another name to start a new search."}
                </Text>
              </View>
            </View>
          }
          ListFooterComponent={
            <View style={styles.footer}>
              {loadingMore && !search.trim() ? (
                <Text style={styles.footerLoadingText}>
                  {language === "fr" ? "Chargement..." : "Loading..."}
                </Text>
              ) : null}

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
    backgroundColor: "#EEF4F0",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerOverlay: {
    position: "absolute",
    top: 12,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: "#DCE8DF",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  heroTextBlock: {
    flex: 1,
  },
  rightActions: {
    alignItems: "flex-end",
    gap: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
  },
  languageSwitch: {
    flexDirection: "row",
    backgroundColor: "#E8F5E9",
    borderRadius: 999,
    padding: 4,
    borderWidth: 1,
    borderColor: "#D7E6DA",
  },
  languageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  languageButtonActive: {
    backgroundColor: "#4CAF50",
  },
  languageButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2E7D32",
  },
  languageButtonTextActive: {
    color: "#FFFFFF",
  },
  favoritesButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 86,
  },
  favoritesButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6FAF7",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D7E6DA",
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1E293B",
    paddingVertical: 13,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  infoBadgeText: {
    color: "#2E7D32",
    fontSize: 13,
    fontWeight: "700",
  },
  listContent: {
    paddingTop: HEADER_HEIGHT + 16,
    paddingBottom: 28,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  footer: {
    paddingTop: 16,
    paddingBottom: 28,
    alignItems: "center",
  },
  footerLoadingText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2E7D32",
  },
  centerState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  stateCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  stateEmoji: {
    fontSize: 28,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: "#B91C1C",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  emptyContainer: {
    paddingTop: 28,
    paddingBottom: 12,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emptyEmoji: {
    fontSize: 28,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
    textAlign: "center",
  },
  inlineErrorText: {
    marginTop: 12,
    fontSize: 13,
    color: "#B91C1C",
    textAlign: "center",
    lineHeight: 18,
  },
});