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

function getBarWidth(value: number): `${number}%` {
  const maxStat = 255;
  const percentage = Math.min((value / maxStat) * 100, 100);
  return `${percentage}%`;
}

export default function StatsList({ stats }: StatsListProps) {
  return (
    <View style={styles.container}>
      {stats.map((stat) => (
        <View key={stat.name} style={styles.card}>
          <View style={styles.topRow}>
            <Text style={styles.label}>{formatStatName(stat.name)}</Text>
            <Text style={styles.value}>{stat.value}</Text>
          </View>

          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                {
                  width: getBarWidth(stat.value),
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  card: {
    backgroundColor: '#F6FAF7',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#D7E6DA',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    fontWeight: '700',
  },
  value: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '800',
    marginLeft: 12,
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
    backgroundColor: '#4CAF50',
    borderRadius: 999,
  },
});