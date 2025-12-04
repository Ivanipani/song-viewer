import { createTheme, MantineColorsTuple } from '@mantine/core';

// Neon Cyan - Electric blue-cyan for primary elements
const neonCyan: MantineColorsTuple = [
  '#E0FFFF',  // 0 - Brightest cyan
  '#C0FEFF',  // 1 - Very light neon cyan
  '#9FFDFF',  // 2 - Light electric cyan
  '#7FFBFF',  // 3 - Bright cyan
  '#5FF9FF',  // 4 - Medium neon cyan
  '#3FF7FF',  // 5 - Neon cyan (base)
  '#00E5FF',  // 6 - Electric cyan
  '#00D4F0',  // 7 - Deep neon cyan
  '#00B8D4',  // 8 - Dark electric cyan
  '#0097A7',  // 9 - Deepest cyan
];

// Neon Pink - Hot magenta-pink for accents
const neonPink: MantineColorsTuple = [
  '#FFE0FF',  // 0 - Brightest pink
  '#FFC0FF',  // 1 - Very light neon pink
  '#FF9FFF',  // 2 - Light electric pink
  '#FF7FFF',  // 3 - Bright magenta
  '#FF5FFF',  // 4 - Medium neon pink
  '#FF3FFF',  // 5 - Neon pink (base)
  '#F500F5',  // 6 - Electric magenta
  '#D400D4',  // 7 - Deep neon pink
  '#B800B8',  // 8 - Dark hot pink
  '#970097',  // 9 - Deepest magenta
];

// Neon Green - Lime-green for highlights
const neonGreen: MantineColorsTuple = [
  '#E0FFE0',  // 0 - Brightest lime
  '#C0FFC0',  // 1 - Very light neon green
  '#9FFF9F',  // 2 - Light electric lime
  '#7FFF7F',  // 3 - Bright lime
  '#5FFF5F',  // 4 - Medium neon green
  '#3FFF3F',  // 5 - Neon green (base)
  '#00FF00',  // 6 - Pure electric green
  '#00E500',  // 7 - Deep neon green
  '#00C800',  // 8 - Dark lime
  '#00AA00',  // 9 - Deepest green
];

// Neon Purple - Vibrant violet for special elements
const neonPurple: MantineColorsTuple = [
  '#F0E0FF',  // 0 - Brightest purple
  '#E0C0FF',  // 1 - Very light neon purple
  '#D09FFF',  // 2 - Light electric violet
  '#C07FFF',  // 3 - Bright purple
  '#B05FFF',  // 4 - Medium neon purple
  '#A03FFF',  // 5 - Neon purple (base)
  '#8B00FF',  // 6 - Electric violet
  '#7A00E5',  // 7 - Deep neon purple
  '#6800C8',  // 8 - Dark violet
  '#5600AA',  // 9 - Deepest purple
];

// Neon Orange - Fiery orange-yellow for warnings/energy
const neonOrange: MantineColorsTuple = [
  '#FFF0E0',  // 0 - Brightest orange
  '#FFE0C0',  // 1 - Very light neon orange
  '#FFD09F',  // 2 - Light electric orange
  '#FFC07F',  // 3 - Bright orange
  '#FFB05F',  // 4 - Medium neon orange
  '#FFA03F',  // 5 - Neon orange (base)
  '#FF8B00',  // 6 - Electric orange
  '#FF7A00',  // 7 - Deep neon orange
  '#FF6800',  // 8 - Dark fiery orange
  '#E55600',  // 9 - Deepest orange
];

export const theme = createTheme({
  // Vibrant neon color palettes
  colors: {
    neonCyan,
    neonPink,
    neonGreen,
    neonPurple,
    neonOrange,
  },

  // Primary color for interactive elements
  primaryColor: 'neonCyan',

  breakpoints: {
    xs: '30em',   // 480px - Large phones
    sm: '48em',   // 768px - Tablets (portrait)
    md: '64em',   // 1024px - Tablets (landscape) / Laptops
    lg: '75em',   // 1200px - Desktops
    xl: '90em',   // 1440px - Large screens
  },

  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },

  fontSizes: {
    xs: '0.75rem',  // 12px
    sm: '0.875rem', // 14px
    md: '1rem',     // 16px (mobile body minimum)
    lg: '1.125rem', // 18px
    xl: '1.25rem',  // 20px
  },
});
