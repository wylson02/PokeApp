import { StyleSheet, Text, View } from 'react-native';
import { PokemonStat } from '../types/pokemon';

type StatsListProps = {
  stats: PokemonStat[];
};

function formatStatName(name: string) {
  const labels: Record<string, string> = {
    hp: 'HP',
    attack: 'Attaque',
    defense: 'Défense',
    'special-attack': 'Attaque Spé.',
    'special-defense': 'Défense Spé.',
    speed: 'Vitesse',
  };

  return labels[name] || name;
}

export default function StatsList({ stats }: StatsListProps) {
  return (
    <View style={styles.container}>
      {stats.map((stat) => (
        <View key={stat.name} style={styles.row}>
          <Text style={styles.label}>{formatStatName(stat.name)}</Text>
          <Text style={styles.value}>{stat.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  row: {
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  value: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '700',
  },
});