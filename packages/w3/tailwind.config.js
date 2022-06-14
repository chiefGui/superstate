const { join } = require('path')
const { createGlobPatternsForDependencies } = require('@nrwl/next/tailwind')

module.exports = {
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,tsx,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],

  theme: {
    extend: {
      colors: require('../../tw/colors'),

      container: {
        center: true,
        padding: '2rem',
      },

      fontFamily: {
        sans: ['Plus Jakarta Sans', 'ui-system', 'sans-serif'],
      },

      screens: {
        tablet: '640px',
        laptop: '1024px',
        desktop: '1280px',
      },
    },
  },
}
