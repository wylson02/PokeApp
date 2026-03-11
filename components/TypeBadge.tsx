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

const typeLabelsFr: Record<string, string> = {
  normal: 'Normal',
  fire: 'Feu',
  water: 'Eau',
  electric: 'Électrik',
  grass: 'Plante',
  ice: 'Glace',
  fighting: 'Combat',
  poison: 'Poison',
  ground: 'Sol',
  flying: 'Vol',
  psychic: 'Psy',
  bug: 'Insecte',
  rock: 'Roche',
  ghost: 'Spectre',
  dragon: 'Dragon',
  dark: 'Ténèbres',
  steel: 'Acier',
  fairy: 'Fée',
};

function getTypeLabel(type: string) {
  return typeLabelsFr[type] ?? type.charAt(0).toUpperCase() + type.slice(1);
}

export default function TypeBadge({ type }: TypeBadgeProps) {
  const color = typeColors[type] || '#9CA3AF';

  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.text}>{getTypeLabel(type)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
    minWidth: 70,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});