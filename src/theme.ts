import { useColorScheme } from 'react-native';

/**
 * A trimmed-down Material 3 colour scheme (baseline teal), hand-written so the
 * app needs no UI library. Only the roles the app actually uses are defined.
 */
export interface Theme {
  dark: boolean;
  colors: {
    background: string;
    surface: string;
    surfaceContainer: string;
    surfaceContainerHigh: string;
    onSurface: string;
    onSurfaceVariant: string;
    outline: string;
    outlineVariant: string;
    primary: string;
    onPrimary: string;
    primaryContainer: string;
    onPrimaryContainer: string;
    secondaryContainer: string;
    onSecondaryContainer: string;
    ripple: string;
  };
}

export const lightTheme: Theme = {
  dark: false,
  colors: {
    background: '#F4FBFA',
    surface: '#FFFFFF',
    surfaceContainer: '#FFFFFF',
    surfaceContainerHigh: '#E7F0EF',
    onSurface: '#141D1C',
    onSurfaceVariant: '#3F4948',
    outline: '#6F7978',
    outlineVariant: '#BEC9C8',
    primary: '#00696B',
    onPrimary: '#FFFFFF',
    primaryContainer: '#9CF1F0',
    onPrimaryContainer: '#002020',
    secondaryContainer: '#CCE8E6',
    onSecondaryContainer: '#051F1F',
    ripple: 'rgba(0, 105, 107, 0.16)',
  },
};

export const darkTheme: Theme = {
  dark: true,
  colors: {
    background: '#0E1514',
    surface: '#131A1A',
    surfaceContainer: '#1B2322',
    surfaceContainerHigh: '#252D2C',
    onSurface: '#DDE4E3',
    onSurfaceVariant: '#BEC9C8',
    outline: '#889392',
    outlineVariant: '#3F4948',
    primary: '#80D5D4',
    onPrimary: '#003737',
    primaryContainer: '#004F50',
    onPrimaryContainer: '#9CF1F0',
    secondaryContainer: '#324B4B',
    onSecondaryContainer: '#CCE8E6',
    ripple: 'rgba(128, 213, 212, 0.20)',
  },
};

/** Follows the system light/dark setting; no in-app override. */
export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? darkTheme : lightTheme;
}

/** Shared spacing scale, in px. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 24,
  full: 999,
} as const;
