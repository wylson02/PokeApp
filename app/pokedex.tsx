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
  ScrollView,
} from "react-native";

import PokemonCard from "../components/PokemonCard";
import Loader from "../components/Loader";
import { usePokemonList } from "../hooks/usePokemonList";
import { PokemonListItem } from "../types/pokemon";
import { useFavorites } from "../context/FavoritesContext";

type Language = "fr" | "en";

const GENERATION_OPTIONS = [
  { id: null, labelFr: "Toutes", labelEn: "All" },
  { id: 1, labelFr: "Gen 1", labelEn: "Gen 1" },
  { id: 2, labelFr: "Gen 2", labelEn: "Gen 2" },
  { id: 3, labelFr: "Gen 3", labelEn: "Gen 3" },
  { id: 4, labelFr: "Gen 4", labelEn: "Gen 4" },
  { id: 5, labelFr: "Gen 5", labelEn: "Gen 5" },
  { id: 6, labelFr: "Gen 6", labelEn: "Gen 6" },
  { id: 7, labelFr: "Gen 7", labelEn: "Gen 7" },
  { id: 8, labelFr: "Gen 8", labelEn: "Gen 8" },
  { id: 9, labelFr: "Gen 9", labelEn: "Gen 9" },
];

const TYPE_OPTIONS = [
  { value: null, labelFr: "Tous", labelEn: "All" },
  { value: "normal", labelFr: "Normal", labelEn: "Normal" },
  { value: "fire", labelFr: "Feu", labelEn: "Fire" },
  { value: "water", labelFr: "Eau", labelEn: "Water" },
  { value: "electric", labelFr: "Électrik", labelEn: "Electric" },
  { value: "grass", labelFr: "Plante", labelEn: "Grass" },
  { value: "ice", labelFr: "Glace", labelEn: "Ice" },
  { value: "fighting", labelFr: "Combat", labelEn: "Fighting" },
  { value: "poison", labelFr: "Poison", labelEn: "Poison" },
  { value: "ground", labelFr: "Sol", labelEn: "Ground" },
  { value: "flying", labelFr: "Vol", labelEn: "Flying" },
  { value: "psychic", labelFr: "Psy", labelEn: "Psychic" },
  { value: "bug", labelFr: "Insecte", labelEn: "Bug" },
  { value: "rock", labelFr: "Roche", labelEn: "Rock" },
  { value: "ghost", labelFr: "Spectre", labelEn: "Ghost" },
  { value: "dragon", labelFr: "Dragon", labelEn: "Dragon" },
  { value: "dark", labelFr: "Ténèbres", labelEn: "Dark" },
  { value: "steel", labelFr: "Acier", labelEn: "Steel" },
  { value: "fairy", labelFr: "Fée", labelEn: "Fairy" },
];

function getGenerationFromId(id: number) {
  if (id >= 1 && id <= 151) return 1;
  if (id >= 152 && id <= 251) return 2;
  if (id >= 252 && id <= 386) return 3;
  if (id >= 387 && id <= 493) return 4;
  if (id >= 494 && id <= 649) return 5;
  if (id >= 650 && id <= 721) return 6;
  if (id >= 722 && id <= 809) return 7;
  if (id >= 810 && id <= 905) return 8;
  if (id >= 906 && id <= 1025) return 9;
  return undefined;
}

export default function HomeScreen() {
  const { allPokemon, pokemon, loading, loadingMore, error, reload, loadMore } =
    usePokemonList();
  const { isFavorite } = useFavorites();

  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState<Language>("fr");
  const [selectedGeneration, setSelectedGeneration] = useState<number | null>(
    null,
  );
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [generationMenuOpen, setGenerationMenuOpen] = useState(false);
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);

  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const headerVisible = useRef(true);
  const [headerHeight, setHeaderHeight] = useState(0);

  const filteredPokemon = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const hasActiveFilters =
      normalizedSearch.length > 0 ||
      selectedGeneration !== null ||
      selectedType !== null ||
      favoritesOnly;

    const baseList = hasActiveFilters ? allPokemon : pokemon;

    return baseList.filter((item) => {
      const frenchName = (item.frenchName ?? "").toLowerCase();
      const englishName = item.name.toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        frenchName.includes(normalizedSearch) ||
        englishName.includes(normalizedSearch);

      const resolvedGenerationId =
        item.generationId ?? getGenerationFromId(item.id);

      const matchesGeneration =
        selectedGeneration === null ||
        resolvedGenerationId === selectedGeneration;

      const matchesType =
        selectedType === null ||
        (item.types ?? []).some((type) => type === selectedType);

      const matchesFavorite = !favoritesOnly || isFavorite(item.name);

      return (
        matchesSearch && matchesGeneration && matchesType && matchesFavorite
      );
    });
  }, [
    allPokemon,
    pokemon,
    search,
    selectedGeneration,
    selectedType,
    favoritesOnly,
    isFavorite,
  ]);

  const activeGenerationLabel =
    GENERATION_OPTIONS.find((option) => option.id === selectedGeneration)?.[
      language === "fr" ? "labelFr" : "labelEn"
    ] ?? (language === "fr" ? "Toutes" : "All");

  const activeTypeLabel =
    TYPE_OPTIONS.find((option) => option.value === selectedType)?.[
      language === "fr" ? "labelFr" : "labelEn"
    ] ?? (language === "fr" ? "Tous" : "All");

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
      toValue: -(headerHeight + 16),
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

  const closeMenus = () => {
    setGenerationMenuOpen(false);
    setTypeMenuOpen(false);
  };

  const renderItem = ({ item }: { item: PokemonListItem }) => {
    const displayName =
      language === "fr" ? (item.frenchName ?? item.name) : item.name;

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
          onLayout={(event) => {
            setHeaderHeight(event.nativeEvent.layout.height);
          }}
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
                onFocus={closeMenus}
              />
            </View>

            <View style={styles.toolbarTop}>
              <View style={styles.infoBadge}>
                <Text style={styles.infoBadgeText}>
                  {filteredPokemon.length}{" "}
                  {language === "fr"
                    ? `résultat${filteredPokemon.length > 1 ? "s" : ""}`
                    : `result${filteredPokemon.length > 1 ? "s" : ""}`}
                </Text>
              </View>

              <Pressable
                style={styles.compareButton}
                onPress={() => router.push("/compare")}
              >
                <Text style={styles.compareButtonText}>
                  {language === "fr" ? "Comparer" : "Compare"}
                </Text>
              </Pressable>
            </View>

            <View style={styles.filtersRow}>
              <View style={styles.filterBlock}>
                <Pressable
                  style={styles.filterButton}
                  onPress={() => {
                    setGenerationMenuOpen((prev) => !prev);
                    setTypeMenuOpen(false);
                  }}
                >
                  <Text style={styles.filterButtonLabel}>
                    {language === "fr" ? "Génération" : "Generation"}
                  </Text>
                  <Text style={styles.filterButtonValue}>
                    {activeGenerationLabel}
                  </Text>
                </Pressable>

                {generationMenuOpen ? (
                  <View style={styles.dropdown}>
                    <ScrollView
                      style={styles.dropdownScroll}
                      contentContainerStyle={styles.dropdownContent}
                      nestedScrollEnabled
                      showsVerticalScrollIndicator
                    >
                      {GENERATION_OPTIONS.map((option) => (
                        <Pressable
                          key={`${option.id ?? "all"}-generation`}
                          style={[
                            styles.dropdownItem,
                            selectedGeneration === option.id &&
                              styles.dropdownItemActive,
                          ]}
                          onPress={() => {
                            setSelectedGeneration(option.id);
                            setGenerationMenuOpen(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.dropdownItemText,
                              selectedGeneration === option.id &&
                                styles.dropdownItemTextActive,
                            ]}
                          >
                            {language === "fr"
                              ? option.labelFr
                              : option.labelEn}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                ) : null}
              </View>

              <View style={styles.filterBlock}>
                <Pressable
                  style={styles.filterButton}
                  onPress={() => {
                    setTypeMenuOpen((prev) => !prev);
                    setGenerationMenuOpen(false);
                  }}
                >
                  <Text style={styles.filterButtonLabel}>Type</Text>
                  <Text style={styles.filterButtonValue}>
                    {activeTypeLabel}
                  </Text>
                </Pressable>

                {typeMenuOpen ? (
                  <View style={styles.dropdown}>
                    <ScrollView
                      style={styles.dropdownScroll}
                      contentContainerStyle={styles.dropdownContent}
                      nestedScrollEnabled
                      showsVerticalScrollIndicator
                    >
                      {TYPE_OPTIONS.map((option) => (
                        <Pressable
                          key={`${option.value ?? "all"}-type`}
                          style={[
                            styles.dropdownItem,
                            selectedType === option.value &&
                              styles.dropdownItemActive,
                          ]}
                          onPress={() => {
                            setSelectedType(option.value);
                            setTypeMenuOpen(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.dropdownItemText,
                              selectedType === option.value &&
                                styles.dropdownItemTextActive,
                            ]}
                          >
                            {language === "fr"
                              ? option.labelFr
                              : option.labelEn}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                ) : null}
              </View>
            </View>

            <View style={styles.filtersBottomRow}>
              <Pressable
                style={[
                  styles.toggleChip,
                  favoritesOnly && styles.toggleChipActive,
                ]}
                onPress={() => setFavoritesOnly((prev) => !prev)}
              >
                <Text
                  style={[
                    styles.toggleChipText,
                    favoritesOnly && styles.toggleChipTextActive,
                  ]}
                >
                  {language === "fr" ? "Favoris uniquement" : "Favorites only"}
                </Text>
              </Pressable>

              <Pressable
                style={styles.resetChip}
                onPress={() => {
                  setSelectedGeneration(null);
                  setSelectedType(null);
                  setFavoritesOnly(false);
                  setGenerationMenuOpen(false);
                  setTypeMenuOpen(false);
                }}
              >
                <Text style={styles.resetChipText}>
                  {language === "fr" ? "Réinitialiser" : "Reset"}
                </Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>

        <Animated.FlatList
          data={filteredPokemon}
          keyExtractor={(item) => item.name}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[
            styles.listContent,
            { paddingTop: headerHeight + 16 },
          ]}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onTouchStart={closeMenus}
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
                    ? "Essaie un autre nom ou ajuste les filtres."
                    : "Try another name or adjust the filters."}
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
  toolbarTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 12,
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
  compareButton: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  compareButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  filtersRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    marginBottom: 10,
    zIndex: 20,
  },
  filterBlock: {
    flex: 1,
    position: "relative",
  },
  filterButton: {
    backgroundColor: "#F6FAF7",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D7E6DA",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  filterButtonLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 4,
  },
  filterButtonValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },
  dropdown: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#DCE8DF",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    maxHeight: 320,
    overflow: "hidden",
  },
  dropdownScroll: {
    maxHeight: 320,
  },
  dropdownContent: {
    paddingVertical: 6,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  dropdownItemActive: {
    backgroundColor: "#E8F5E9",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "600",
  },
  dropdownItemTextActive: {
    color: "#2E7D32",
    fontWeight: "700",
  },
  filtersBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  toggleChip: {
    flex: 1,
    backgroundColor: "#F6FAF7",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D7E6DA",
    paddingHorizontal: 14,
    paddingVertical: 11,
    alignItems: "center",
  },
  toggleChipActive: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  toggleChipText: {
    color: "#2E7D32",
    fontSize: 13,
    fontWeight: "700",
  },
  toggleChipTextActive: {
    color: "#FFFFFF",
  },
  resetChip: {
    backgroundColor: "#EEF2F7",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  resetChipText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "700",
  },
  listContent: {
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
