import { Pressable, StyleSheet, Text } from 'react-native';

type FavoriteButtonProps = {
  isFavorite: boolean;
  onPress: () => void;
};

export default function FavoriteButton({
  isFavorite,
  onPress,
}: FavoriteButtonProps) {
  return (
    <Pressable
      style={[styles.button, isFavorite && styles.buttonActive]}
      onPress={onPress}
    >
      <Text style={styles.text}>
        {isFavorite ? '★ Retirer des favoris' : '☆ Ajouter aux favoris'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 16,
    backgroundColor: '#111827',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonActive: {
    backgroundColor: '#EF5350',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});