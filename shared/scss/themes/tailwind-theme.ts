// Tailwind theme configuration
// Only includes spacing and elevation utilities
// Colors and typography come from Material Design tokens

export const tailwindTheme = {
  extend: {
    spacing: {
      // Material Design spacing scale (4px base)
      '0': '0',
      '1': '0.25rem',  // 4px
      '2': '0.5rem',   // 8px
      '3': '0.75rem',  // 12px
      '4': '1rem',     // 16px
      '5': '1.25rem',  // 20px
      '6': '1.5rem',   // 24px
      '8': '2rem',     // 32px
      '10': '2.5rem',  // 40px
      '12': '3rem',    // 48px
      '16': '4rem',    // 64px
      '20': '5rem',    // 80px
      '24': '6rem',    // 96px
    },
    boxShadow: {
      // Material Design elevation levels
      'elevation-0': 'none',
      'elevation-1': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      'elevation-2': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      'elevation-3': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      'elevation-4': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      'elevation-5': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
    borderRadius: {
      // Material Design border radius scale
      'none': '0',
      'xs': '0.125rem',   // 2px
      'sm': '0.25rem',    // 4px
      'DEFAULT': '0.5rem', // 8px
      'md': '0.75rem',    // 12px
      'lg': '1rem',       // 16px
      'xl': '1.5rem',     // 24px
      '2xl': '2rem',      // 32px
      'full': '9999px',
    },
  },
};
