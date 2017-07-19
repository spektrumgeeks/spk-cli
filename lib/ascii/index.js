const chalk = require('chalk')
const ascii = require('./spk.json')

let s = ascii.s
let p = ascii.p
let k = ascii.k.map(line => chalk.blue(line))

module.exports = Array(8).fill(null).map((n, i) => ['\t', s[i], p[i], k[i]].join('')).join('\n')
