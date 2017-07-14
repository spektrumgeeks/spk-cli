const sep = require('path').sep
const base = __dirname.split(sep).slice(0, -1).join('/') + '/templates/'

module.exports = src => `${base}/${src}`
