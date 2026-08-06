/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    background: '#0F1115', // Deep Charcoal
    cardBackground: '#1A1C23', // Elevated Flat Dark Grey
    tint: '#F59E0B', // Gold/Yellow Accent
    icon: '#9CA3AF',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#F59E0B',
    primary: '#F59E0B', // Gold
    secondary: '#FFFFFF', // White for secondary accents
    status: '#F59E0B',
    accent: '#F59E0B',
    borderGlow: 'transparent', // No glow
  },
  dark: {
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    background: '#0F1115', // Deep Charcoal
    cardBackground: '#1A1C23', // Elevated Flat Dark Grey
    tint: '#F59E0B', // Gold/Yellow Accent
    icon: '#9CA3AF',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#F59E0B',
    primary: '#F59E0B', // Gold
    secondary: '#FFFFFF', // White for secondary accents
    status: '#F59E0B',
    accent: '#F59E0B',
    borderGlow: 'transparent', // No glow
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
