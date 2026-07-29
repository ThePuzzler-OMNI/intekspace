/**
 * Intek Space — shared Tailwind tokens (CDN).
 * Deep navy + gold. Load immediately after https://cdn.tailwindcss.com
 */
(function () {
  if (typeof tailwind === 'undefined') return;
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          ink: '#070f1c',
          parchment: '#e8eef8',
          mark: '#3b9eff',
          hive: '#c9a84c',
          leaf: '#5d9b7a',
          mist: '#8b9cb8',
        },
        fontFamily: {
          display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
          sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        },
      },
    },
  };
})();
