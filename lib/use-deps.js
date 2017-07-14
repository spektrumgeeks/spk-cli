const shell = require('shelljs')
const spinner = require('ora')({
  color: 'blue',
  spinner: { interval: 100, frames: ['[spk]', '[ sp]', '[  s]', '[k  ]', '[pk ]'] }
})

module.exports = (deps, { l, f, d }) => {
  if (l || f || d) return;

  spinner.start('—— Installing npm dependencies')
  if (shell.exec(`npm i -S ${deps.join(' ')}`).code) return spinner.fail()
  spinner.succeed()
  console.log('—— Done installing npm dependencies\n')
}
