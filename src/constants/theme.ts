/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  light: {
    text: '#FFD600', // Pacman Yellow
    background: '#271C22', // Surface
    backgroundElement: '#4A2832', // Tertiary Variant
    backgroundSelected: '#D52B5D', // Arcade Pink
    textSecondary: '#99CFD4', // Ghost Cyan
  },
  dark: {
    text: '#FFD600',
    background: '#271C22',
    backgroundElement: '#4A2832',
    backgroundSelected: '#D52B5D',
    textSecondary: '#99CFD4',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'PressStart2P',
    serif: 'PressStart2P',
    rounded: 'PressStart2P',
    mono: 'PressStart2P',
  },
  default: {
    sans: 'PressStart2P',
    serif: 'PressStart2P',
    rounded: 'PressStart2P',
    mono: 'PressStart2P',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
