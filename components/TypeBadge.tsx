import { StyleSheet, Text, View } from 'react-native';

type TypeBadgeProps = {
  type: string;
};

const typeColors: Record<string, string> = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

function formatTypeName(type: string) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export default function TypeBadge({ type }: TypeBadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: typeColors[type] || '#9CA3AF' }]}>
      <Text style={styles.text}>{formatTypeName(type)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});