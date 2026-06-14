/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#F8FAFC',
    textSecondary: '#A1A1AA',
    background: '#000000', // OLED Black
    cardBackground: '#121212', // Dark Grey
    tint: '#3B82F6', // Neon Blue
    icon: '#A1A1AA',
    tabIconDefault: '#A1A1AA',
    tabIconSelected: '#3B82F6',
    primary: '#1E3A8A', // Midnight Blue
    secondary: '#3B82F6', // Lighter Blue Accent
    status: '#3B82F6',
    accent: '#3B82F6',
    borderGlow: 'rgba(59, 130, 246, 0.5)', // Subtle neon blue glow
  },
  dark: {
    text: '#F8FAFC',
    textSecondary: '#A1A1AA',
    background: '#000000', // OLED Black
    cardBackground: '#121212', // Dark Grey
    tint: '#3B82F6', // Neon Blue
    icon: '#A1A1AA',
    tabIconDefault: '#A1A1AA',
    tabIconSelected: '#3B82F6',
    primary: '#1E3A8A', // Midnight Blue
    secondary: '#3B82F6', // Lighter Blue Accent
    status: '#3B82F6',
    accent: '#3B82F6',
    borderGlow: 'rgba(59, 130, 246, 0.5)', // Subtle neon blue glow
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
