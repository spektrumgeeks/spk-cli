const SourceMap = require('../lib/SourceMap')
const m = new SourceMap('vue')

module.exports = {
  mods: { browserslist: ['last 2 versions', 'not ie <= 9'] },
  files: [
    m('src/sass/'),
    m('index.html'),
    m('src/App.vue'),
    m('src/main.js'),
    m('.eslintrc.js'),
    m('.postcssrc.js'),
    m('src/startup.js'),
    m('src/components/globals.js')
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
