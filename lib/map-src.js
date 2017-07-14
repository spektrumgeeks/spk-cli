const sep = require('path').sep
const base = __dirname.split(sep).slice(0, -1).join('/') + '/templates/'

module.exports = function(setup) {
  const map = src => ({
    base,
    src: `${setup}/${src}`,
    dest: `./${src.split('/').slice(0, (/\/$/.test(src)) ? -2 : -1).join('/')}`
  })

  return map
}
