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
          ink: '#0a1628',
          parchment: '#eaf0fa',
          mark: '#4aa8ff',
          hive: '#d4b056',
          leaf: '#5d9b7a',
          mist: '#9aadc8',
        },
        fontFamily: {
          display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
          sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        },
      },
    },
  };
})();
