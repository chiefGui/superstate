const { join } = require('path')

const isProd = process.env.NODE_ENV === 'production'
const supportsIE11 = false
const enableCssGrid = false

module.exports = {
  plugins: {
    tailwindcss: {
      config: join(__dirname, 'tailwind.config.js'),
    },
  },
}
