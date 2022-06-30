const { join } = require('path')
const { createGlobPatternsForDependencies } = require('@nrwl/react/tailwind')

module.exports = {
  presets: [require('../../tw/preset')],

  content: [
    join(__dirname, '(src|docs|blog)/**/!(*.stories|*.spec).{ts,tsx,mdx,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
}
