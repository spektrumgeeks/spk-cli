import chalk from 'chalk'
const ascii = require('./spk.json')

let { s, p, k } = ascii

const spk = Array(8).fill(null)
  .map((n, i) => ['\t', s[i], p[i], chalk.blue(k[i])].join(''))
  .join('\n')

export { spk as default }
