import { Pressable, StyleSheet, Text, View } from 'react-native';

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
      <View style={styles.content}>
        <Text style={styles.icon}>{isFavorite ? '★' : '☆'}</Text>

        <Text style={styles.text}>
          {isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 14,
    backgroundColor: '#1E293B',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonActive: {
    backgroundColor: '#EF5350',
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  icon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});