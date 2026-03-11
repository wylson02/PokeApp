import { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import { useAudioPlayer } from 'expo-audio';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const startSound = require('../assets/sounds/start.wav');

export default function IntroScreen() {
  const [isStarting, setIsStarting] = useState(false);

  const buttonScale = useRef(new Animated.Value(1)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(18)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const player = useAudioPlayer(startSound);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, {
          toValue: -8,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoFloat, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [cardOpacity, cardTranslateY, logoFloat]);

  const handleStart = async () => {
    if (isStarting) return;
    setIsStarting(true);

    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await player.seekTo(0);
      player.play();
    } catch {
      // pas bloquant si le son n'est pas disponible
    }

    setTimeout(() => {
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }).start(() => {
        router.replace('/pokedex');
      });
    }, 1600);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.heroCard,
            {
              opacity: cardOpacity,
              transform: [{ translateY: cardTranslateY }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.imagePanel,
              {
                transform: [{ translateY: logoFloat }],
              },
            ]}
          >
            <Image
              source={{
                uri: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
              }}
              style={styles.image}
              resizeMode="contain"
            />
          </Animated.View>

          <Text style={styles.title}> Bienvenue sur le Pokédex !</Text>
          <Text style={styles.subtitle}>
            Explore les Pokémon, filtre par génération, compare leurs stats et
            construis ta propre équipe.
          </Text>

          <Animated.View
            style={[
              styles.buttonWrapper,
              {
                transform: [{ scale: buttonScale }],
              },
            ]}
          >
            <Pressable
              style={[styles.startButton, isStarting && styles.startButtonDisabled]}
              onPress={handleStart}
              disabled={isStarting}
            >
              <Text style={styles.startButtonText}>C'est parti !</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[styles.overlay, { opacity: overlayOpacity }]}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#3ea56041',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: '#DCE8DF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    alignItems: 'center',
  },
  imagePanel: {
    width: '100%',
    height: 220,
    backgroundColor: '#F6FAF7',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#D7E6DA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
  },
  image: {
    width: 170,
    height: 170,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 10,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonWrapper: {
    width: '100%',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonDisabled: {
    opacity: 0.8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#EEF4F0',
  },
});