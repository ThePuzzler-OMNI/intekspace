/**
 * Intek Space — shared Tailwind tokens (CDN).
 * Load immediately after https://cdn.tailwindcss.com
 */
(function () {
  if (typeof tailwind === 'undefined') return;
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          ink: '#0a0f14',
          parchment: '#e8e4d9',
          mark: '#0ea5e9',
          hive: '#c4a35a',
          leaf: '#6b8f71',
          mist: '#8b9aab',
        },
        fontFamily: {
          display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
          sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        },
      },
    },
  };
})();
