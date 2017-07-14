const shell = require('shelljs')
const spinner = require('ora')({
  color: 'blue',
  spinner: { interval: 100, frames: ['[spk]', '[ sp]', '[  s]', '[k  ]', '[pk ]'] }
})


module.exports = (dirs, { i, l, f, d: mkdirs }) => {
  if (i || l || f) return;
  console.log('[Work In Progress] Why don\'t you just make it yourself then?!')
}
