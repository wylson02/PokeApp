import { useMemo, useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
} from 'react-native';

import Loader from '../components/Loader';
import TypeBadge from '../components/TypeBadge';
import { usePokemonList } from '../hooks/usePokemonList';
import { usePokemonDetail } from '../hooks/usePokemonDetail';
import { PokemonStat } from '../types/pokemon';

type CompareSlot = 'left' | 'right';

function formatPokemonId(id: number) {
  return `#${id.toString().padStart(3, '0')}`;
}

function formatPokemonName(name?: string) {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function formatHeight(height?: number) {
  if (height == null) return '-';
  return `${height / 10} m`;
}

function formatWeight(weight?: number) {
  if (weight == null) return '-';
  return `${weight / 10} kg`;
}

function getDisplayName(item: {
  name: string;
  frenchName?: string;
  displayName?: string;
}) {
  return item.displayName ?? item.frenchName ?? item.name;
}

function getStatValue(stats: PokemonStat[] | undefined, statName: string) {
  return stats?.find((stat) => stat.name === statName)?.value ?? 0;
}

function getBarWidth(value: number): `${number}%` {
  const maxStat = 255;
  return `${Math.min((value / maxStat) * 100, 100)}%`;
}

function formatStatLabel(name: string) {
  const labels: Record<string, string> = {
    hp: 'HP',
    attack: 'Attaque',
    defense: 'Défense',
    'special-attack': 'Attaque Spé.',
    'special-defense': 'Défense Spé.',
    speed: 'Vitesse',
  };

  return labels[name] ?? name;
}

const STAT_ORDER = [
  'hp',
  'attack',
  'defense',
  'special-attack',
  'special-defense',
  'speed',
] as const;

export default function CompareScreen() {
  const { allPokemon, loading, error, reload } = usePokemonList();

  const [leftSearch, setLeftSearch] = useState('');
  const [rightSearch, setRightSearch] = useState('');
  const [leftSelectedName, setLeftSelectedName] = useState('bulbasaur');
  const [rightSelectedName, setRightSelectedName] = useState('charmander');
  const [openDropdown, setOpenDropdown] = useState<CompareSlot | null>(null);

  const {
    pokemon: leftPokemon,
    loading: leftLoading,
    error: leftError,
  } = usePokemonDetail(leftSelectedName);

  const {
    pokemon: rightPokemon,
    loading: rightLoading,
    error: rightError,
  } = usePokemonDetail(rightSelectedName);

  const filteredLeftPokemon = useMemo(() => {
    const normalized = leftSearch.trim().toLowerCase();

    if (!normalized) {
      return allPokemon.slice(0, 12);
    }

    return allPokemon
      .filter((item) => {
        const frenchName = (item.frenchName ?? '').toLowerCase();
        const englishName = item.name.toLowerCase();

        return (
          frenchName.includes(normalized) || englishName.includes(normalized)
        );
      })
      .slice(0, 12);
  }, [allPokemon, leftSearch]);

  const filteredRightPokemon = useMemo(() => {
    const normalized = rightSearch.trim().toLowerCase();

    if (!normalized) {
      return allPokemon.slice(0, 12);
    }

    return allPokemon
      .filter((item) => {
        const frenchName = (item.frenchName ?? '').toLowerCase();
        const englishName = item.name.toLowerCase();

        return (
          frenchName.includes(normalized) || englishName.includes(normalized)
        );
      })
      .slice(0, 12);
  }, [allPokemon, rightSearch]);

  const handleSelectPokemon = (slot: CompareSlot, name: string) => {
    if (slot === 'left') {
      setLeftSelectedName(name);
      setLeftSearch('');
    } else {
      setRightSelectedName(name);
      setRightSearch('');
    }

    setOpenDropdown(null);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Loader />
      </SafeAreaView>
    );
  }

  if (error && allPokemon.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerState}>
          <View style={styles.stateCard}>
            <Text style={styles.stateEmoji}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={reload}>
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const leftStats = leftPokemon?.stats ?? [];
  const rightStats = rightPokemon?.stats ?? [];

  const leftDisplayName = leftPokemon
    ? formatPokemonName(leftPokemon.frenchName ?? leftPokemon.name)
    : 'Pokémon 1';

  const rightDisplayName = rightPokemon
    ? formatPokemonName(rightPokemon.frenchName ?? rightPokemon.name)
    : 'Pokémon 2';

  const leftHeightValue = leftPokemon?.height ?? 0;
  const rightHeightValue = rightPokemon?.height ?? 0;
  const leftWeightValue = leftPokemon?.weight ?? 0;
  const rightWeightValue = rightPokemon?.weight ?? 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.heroCard}>
          <Text style={styles.title}>Comparateur</Text>
          <Text style={styles.subtitle}>
            Compare deux Pokémon pour visualiser leurs différences
          </Text>

          <View style={styles.selectorGrid}>
            <View style={styles.selectorColumn}>
              <Text style={styles.selectorTitle}>Pokémon 1</Text>

              <Pressable
                style={styles.selectorButton}
                onPress={() =>
                  setOpenDropdown((prev) => (prev === 'left' ? null : 'left'))
                }
              >
                <Text style={styles.selectorButtonText}>
                  {leftPokemon ? leftDisplayName : 'Sélectionner'}
                </Text>
              </Pressable>

              {openDropdown === 'left' ? (
                <View style={styles.dropdownCard}>
                  <TextInput
                    value={leftSearch}
                    onChangeText={setLeftSearch}
                    placeholder="Rechercher un Pokémon..."
                    placeholderTextColor="#94A3B8"
                    style={styles.dropdownSearch}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />

                  <ScrollView
                    style={styles.dropdownList}
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="handled"
                  >
                    {filteredLeftPokemon.map((item) => (
                      <Pressable
                        key={`left-${item.name}`}
                        style={styles.dropdownItem}
                        onPress={() => handleSelectPokemon('left', item.name)}
                      >
                        <Text style={styles.dropdownItemText}>
                          {formatPokemonName(getDisplayName(item))}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              ) : null}
            </View>

            <View style={styles.selectorColumn}>
              <Text style={styles.selectorTitle}>Pokémon 2</Text>

              <Pressable
                style={styles.selectorButton}
                onPress={() =>
                  setOpenDropdown((prev) => (prev === 'right' ? null : 'right'))
                }
              >
                <Text style={styles.selectorButtonText}>
                  {rightPokemon ? rightDisplayName : 'Sélectionner'}
                </Text>
              </Pressable>

              {openDropdown === 'right' ? (
                <View style={styles.dropdownCard}>
                  <TextInput
                    value={rightSearch}
                    onChangeText={setRightSearch}
                    placeholder="Rechercher un Pokémon..."
                    placeholderTextColor="#94A3B8"
                    style={styles.dropdownSearch}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />

                  <ScrollView
                    style={styles.dropdownList}
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="handled"
                  >
                    {filteredRightPokemon.map((item) => (
                      <Pressable
                        key={`right-${item.name}`}
                        style={styles.dropdownItem}
                        onPress={() => handleSelectPokemon('right', item.name)}
                      >
                        <Text style={styles.dropdownItemText}>
                          {formatPokemonName(getDisplayName(item))}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        <View style={styles.compareRow}>
          <View style={styles.pokemonCard}>
            {leftLoading ? (
              <Loader />
            ) : leftError || !leftPokemon ? (
              <Text style={styles.inlineErrorText}>
                {leftError ?? 'Pokémon introuvable.'}
              </Text>
            ) : (
              <>
                <View style={styles.imagePanel}>
                  <Image
                    source={{ uri: leftPokemon.image }}
                    style={styles.image}
                    resizeMode="contain"
                  />
                </View>

                <Text style={styles.id}>{formatPokemonId(leftPokemon.id)}</Text>
                <Text style={styles.name}>{leftDisplayName}</Text>

                <View style={styles.typesContainer}>
                  {leftPokemon.types.map((type) => (
                    <TypeBadge key={`left-${type.name}`} type={type.name} />
                  ))}
                </View>
              </>
            )}
          </View>

          <View style={styles.pokemonCard}>
            {rightLoading ? (
              <Loader />
            ) : rightError || !rightPokemon ? (
              <Text style={styles.inlineErrorText}>
                {rightError ?? 'Pokémon introuvable.'}
              </Text>
            ) : (
              <>
                <View style={styles.imagePanel}>
                  <Image
                    source={{ uri: rightPokemon.image }}
                    style={styles.image}
                    resizeMode="contain"
                  />
                </View>

                <Text style={styles.id}>{formatPokemonId(rightPokemon.id)}</Text>
                <Text style={styles.name}>{rightDisplayName}</Text>

                <View style={styles.typesContainer}>
                  {rightPokemon.types.map((type) => (
                    <TypeBadge key={`right-${type.name}`} type={type.name} />
                  ))}
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Informations</Text>

          <View style={styles.comparisonInfoCard}>
            <Text style={styles.comparisonInfoTitle}>Taille</Text>

            <View style={styles.compareStatRow}>
              <View style={styles.compareStatHeader}>
                <Text
                  style={[
                    styles.comparePokemonName,
                    leftHeightValue > rightHeightValue &&
                      styles.comparePokemonNameWinner,
                  ]}
                  numberOfLines={1}
                >
                  {leftDisplayName}
                </Text>

                <Text
                  style={[
                    styles.statValue,
                    leftHeightValue > rightHeightValue &&
                      styles.statValueWinner,
                  ]}
                >
                  {formatHeight(leftPokemon?.height)}
                </Text>
              </View>
            </View>

            <View style={styles.compareStatRowNoMargin}>
              <View style={styles.compareStatHeader}>
                <Text
                  style={[
                    styles.comparePokemonName,
                    rightHeightValue > leftHeightValue &&
                      styles.comparePokemonNameWinner,
                  ]}
                  numberOfLines={1}
                >
                  {rightDisplayName}
                </Text>

                <Text
                  style={[
                    styles.statValue,
                    rightHeightValue > leftHeightValue &&
                      styles.statValueWinner,
                  ]}
                >
                  {formatHeight(rightPokemon?.height)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.comparisonInfoCard}>
            <Text style={styles.comparisonInfoTitle}>Poids</Text>

            <View style={styles.compareStatRow}>
              <View style={styles.compareStatHeader}>
                <Text
                  style={[
                    styles.comparePokemonName,
                    leftWeightValue > rightWeightValue &&
                      styles.comparePokemonNameWinner,
                  ]}
                  numberOfLines={1}
                >
                  {leftDisplayName}
                </Text>

                <Text
                  style={[
                    styles.statValue,
                    leftWeightValue > rightWeightValue &&
                      styles.statValueWinner,
                  ]}
                >
                  {formatWeight(leftPokemon?.weight)}
                </Text>
              </View>
            </View>

            <View style={styles.compareStatRowNoMargin}>
              <View style={styles.compareStatHeader}>
                <Text
                  style={[
                    styles.comparePokemonName,
                    rightWeightValue > leftWeightValue &&
                      styles.comparePokemonNameWinner,
                  ]}
                  numberOfLines={1}
                >
                  {rightDisplayName}
                </Text>

                <Text
                  style={[
                    styles.statValue,
                    rightWeightValue > leftWeightValue &&
                      styles.statValueWinner,
                  ]}
                >
                  {formatWeight(rightPokemon?.weight)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Comparaison des stats</Text>

          {STAT_ORDER.map((statName) => {
            const leftValue = getStatValue(leftStats, statName);
            const rightValue = getStatValue(rightStats, statName);

            const leftWins = leftValue > rightValue;
            const rightWins = rightValue > leftValue;

            return (
              <View key={statName} style={styles.statCard}>
                <Text style={styles.statTitle}>{formatStatLabel(statName)}</Text>

                <View style={styles.compareStatRow}>
                  <View style={styles.compareStatHeader}>
                    <Text
                      style={[
                        styles.comparePokemonName,
                        leftWins && styles.comparePokemonNameWinner,
                      ]}
                      numberOfLines={1}
                    >
                      {leftDisplayName}
                    </Text>

                    <Text
                      style={[
                        styles.statValue,
                        leftWins && styles.statValueWinner,
                      ]}
                    >
                      {leftValue}
                    </Text>
                  </View>

                  <View style={styles.track}>
                    <View
                      style={[
                        styles.fill,
                        leftWins && styles.fillWinner,
                        { width: getBarWidth(leftValue) },
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.compareStatRowNoMargin}>
                  <View style={styles.compareStatHeader}>
                    <Text
                      style={[
                        styles.comparePokemonName,
                        rightWins && styles.comparePokemonNameWinner,
                      ]}
                      numberOfLines={1}
                    >
                      {rightDisplayName}
                    </Text>

                    <Text
                      style={[
                        styles.statValue,
                        rightWins && styles.statValueWinner,
                      ]}
                    >
                      {rightValue}
                    </Text>
                  </View>

                  <View style={styles.track}>
                    <View
                      style={[
                        styles.fill,
                        rightWins && styles.fillWinner,
                        { width: getBarWidth(rightValue) },
                      ]}
                    />
                  </View>
                </View>
              </View>
            );
          })}
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
    zIndex: 20,
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
    marginBottom: 16,
  },
  selectorGrid: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  selectorColumn: {
    flex: 1,
  },
  selectorTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  selectorButton: {
    backgroundColor: '#F6FAF7',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D7E6DA',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  selectorButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  dropdownCard: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DCE8DF',
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    maxHeight: 260,
  },
  dropdownSearch: {
    backgroundColor: '#F6FAF7',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D7E6DA',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1E293B',
    marginBottom: 8,
  },
  dropdownList: {
    maxHeight: 180,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  compareRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  pokemonCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DCE8DF',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    alignItems: 'center',
  },
  imagePanel: {
    width: '100%',
    height: 170,
    backgroundColor: '#F6FAF7',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#D7E6DA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  image: {
    width: 130,
    height: 130,
  },
  id: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
    fontWeight: '600',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 10,
    textAlign: 'center',
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  comparisonInfoCard: {
    backgroundColor: '#F6FAF7',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#D7E6DA',
  },
  comparisonInfoTitle: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '800',
    marginBottom: 12,
  },
  statCard: {
    backgroundColor: '#F6FAF7',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#D7E6DA',
  },
  statTitle: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '800',
    marginBottom: 12,
  },
  compareStatRow: {
    marginBottom: 12,
  },
  compareStatRowNoMargin: {
    marginBottom: 0,
  },
  compareStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 6,
  },
  comparePokemonName: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
    fontWeight: '700',
  },
  comparePokemonNameWinner: {
    color: '#166534',
  },
  statValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '800',
    minWidth: 48,
    textAlign: 'right',
  },
  statValueWinner: {
    color: '#166534',
  },
  track: {
    width: '100%',
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#94A3B8',
    borderRadius: 999,
  },
  fillWinner: {
    backgroundColor: '#4CAF50',
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
  inlineErrorText: {
    fontSize: 14,
    color: '#B91C1C',
    textAlign: 'center',
    lineHeight: 20,
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