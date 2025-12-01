import { createTheme, MantineColorsTuple } from '@mantine/core';

// Cool Slate - Primary neutral palette for backgrounds and surfaces
const coolSlate: MantineColorsTuple = [
  '#F8FAFB',  // 0 - Almost white, soft blue-gray
  '#F1F4F7',  // 1 - Very light slate
  '#E4E9EF',  // 2 - Light cool slate
  '#D1DBE5',  // 3 - Soft blue-gray
  '#B8C5D4',  // 4 - Medium slate
  '#9DB0C4',  // 5 - Cool slate (base)
  '#7D8FA5',  // 6 - Deeper slate
  '#5E7389',  // 7 - Steel blue-gray
  '#45566A',  // 8 - Dark cool gray
  '#2F3D4D',  // 9 - Deep slate-blue
];

// Cool Steel - Primary accent color for interactive elements
const coolSteel: MantineColorsTuple = [
  '#F7F9FA',  // 0 - Lightest blue-gray
  '#ECF1F5',  // 1 - Very light steel
  '#DCE5ED',  // 2 - Light cool blue
  '#C8D8E5',  // 3 - Soft steel blue
  '#AEC3D6',  // 4 - Medium steel
  '#8FA9C3',  // 5 - Cool steel (base)
  '#6E8BA8',  // 6 - Rich steel blue
  '#516F8D',  // 7 - Deep steel
  '#395571',  // 8 - Dark steel blue
  '#263D55',  // 9 - Very dark steel
];

// Cool Gray - Supporting neutral for text and borders
const coolGray: MantineColorsTuple = [
  '#F9FAFB',  // 0 - Near white with blue hint
  '#F3F5F7',  // 1 - Very light cool gray
  '#E6E9ED',  // 2 - Light blue-gray
  '#D3D8DF',  // 3 - Soft cool gray
  '#BCC3CD',  // 4 - Medium cool gray
  '#A2ABB8',  // 5 - Cool gray (base)
  '#858FA0',  // 6 - Deeper cool gray
  '#687487',  // 7 - Dark blue-gray
  '#4F5968',  // 8 - Very dark cool gray
  '#383F4C',  // 9 - Almost black with blue tint
];

export const theme = createTheme({
  // Custom cool neutral color palettes
  colors: {
    coolSlate,
    coolSteel,
    coolGray,
  },

  // Primary color for interactive elements
  primaryColor: 'coolSteel',

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
