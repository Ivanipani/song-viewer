import { createTheme } from '@mantine/core';

export const theme = createTheme({
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
