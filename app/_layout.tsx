import { Stack } from 'expo-router';
import { FavoritesProvider } from '../context/FavoritesContext';

export default function RootLayout() {
  return (
    <FavoritesProvider>
      <Stack
        screenOptions={{
          headerTitleAlign: 'center',
          contentStyle: {
            backgroundColor: '#F7F8FA',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Pokédex',
          }}
        />
        <Stack.Screen
          name="pokemon/[name]"
          options={{
            title: 'Détail Pokémon',
          }}
        />
        <Stack.Screen
          name="favorites"
          options={{
            title: 'Favoris',
          }}
        />
      </Stack>
    </FavoritesProvider>
  );
}