module.exports = {
  key: 'vue',
  name: 'VueJS webpack SPA',
  checkfile: 'build/vue-loader.conf.js',
  files: {
    import: 'template',
    delete: ['src/assets/logo.png', 'src/components/Hello.vue']
  },
  edit: {
    devDependencies: {
      merge: {
        'babel-polyfill': '^6.23.0',
        'node-sass': '^4.5.3',
        'pace': '0.0.4',
        'pace-progress': '^1.0.2',
        'postcss-custom-media': '^6.0.0',
        'postcss-pxtorem': '^4.0.1',
        'sass-loader': '^6.0.6'
      }
    },
    browserslist: {
      replace: [
        'last 2 versions',
        'not ie <= 9'
      ]
    }
  }
}
