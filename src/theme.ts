import { createTheme, MantineColorsTuple } from '@mantine/core';

// Warm Beige - Primary neutral palette for backgrounds and surfaces
const warmBeige: MantineColorsTuple = [
  '#FAF8F5',  // 0 - Almost white, soft cream
  '#F5F1EB',  // 1 - Very light beige
  '#EBE4D9',  // 2 - Light warm beige
  '#DDD3C4',  // 3 - Soft tan
  '#C9BAAA',  // 4 - Medium beige
  '#B5A593',  // 5 - Warm taupe (base)
  '#9A8A76',  // 6 - Deeper taupe
  '#7D6F5D',  // 7 - Warm brown-gray
  '#5F5447',  // 8 - Dark warm gray
  '#403A32',  // 9 - Deep brown-gray
];

// Warm Brown - Primary accent color for interactive elements
const warmBrown: MantineColorsTuple = [
  '#F9F6F2',  // 0 - Lightest cream
  '#F0E8DD',  // 1 - Very light brown
  '#E3D4C0',  // 2 - Light warm tan
  '#D4BFA2',  // 3 - Soft caramel
  '#C0A67E',  // 4 - Medium tan
  '#A88B5F',  // 5 - Warm caramel (base)
  '#8E7249',  // 6 - Rich brown
  '#735A38',  // 7 - Deep caramel
  '#584428',  // 8 - Dark brown
  '#3E2F1C',  // 9 - Very dark brown
];

// Warm Gray - Supporting neutral for text and borders
const warmGray: MantineColorsTuple = [
  '#FAFAF9',  // 0 - Near white
  '#F5F4F2',  // 1 - Very light gray
  '#E8E6E3',  // 2 - Light warm gray
  '#D4D1CC',  // 3 - Soft gray
  '#BEBAB3',  // 4 - Medium warm gray
  '#A39E96',  // 5 - Warm gray (base)
  '#88837B',  // 6 - Deeper gray
  '#6D6962',  // 7 - Dark warm gray
  '#534F4A',  // 8 - Very dark gray
  '#3A3835',  // 9 - Almost black warm
];

export const theme = createTheme({
  // Custom warm neutral color palettes
  colors: {
    warmBeige,
    warmBrown,
    warmGray,
  },

  // Primary color for interactive elements
  primaryColor: 'warmBrown',

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
