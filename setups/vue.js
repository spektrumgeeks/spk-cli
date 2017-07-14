const map = require('../lib/map-src')('vue')

module.exports = {
  mods: { browserslist: ['last 2 versions', 'not ie <= 9'] },
  files: [
    map('src/sass/'),
    map('index.html'),
    map('src/App.vue'),
    map('src/main.js'),
    map('.eslintrc.js'),
    map('.postcssrc.js'),
    map('src/startup.js'),
    map('src/components/globals.js')
  ],
  deps: [
    'pace',
    'node-sass',
    'sass-loader',
    'pace-progress',
    'babel-polyfill',
    'postcss-pxtorem',
    'postcss-custom-media'
  ]
}
