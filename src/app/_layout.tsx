import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { useFonts } from 'expo-font';
import { VT323_400Regular } from '@expo-google-fonts/vt323';
import { ShareTechMono_400Regular } from '@expo-google-fonts/share-tech-mono';
import { PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { Orbitron_400Regular, Orbitron_700Bold, Orbitron_900Black } from '@expo-google-fonts/orbitron';
import { useEffect } from 'react';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Stack } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  
  const [loaded, error] = useFonts({
    VT323: VT323_400Regular,
    ShareTechMono: ShareTechMono_400Regular,
    Orbitron: Orbitron_400Regular,
    OrbitronBold: Orbitron_700Bold,
    OrbitronBlack: Orbitron_900Black,
    PressStart2P: PressStart2P_400Regular,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  // Custom retro arcade theme
  const arcadeTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: '#271C22',
      card: '#4A2832',
      text: '#FFD600',
      border: '#D52B5D',
      notification: '#FFD600',
    },
  };

  return (
    <ThemeProvider value={arcadeTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
