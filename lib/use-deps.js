const shell = require('shelljs')
const spinner = require('ora')({
  color: 'blue',
  spinner: { interval: 100, frames: ['[spk]', '[ sp]', '[  s]', '[k  ]', '[pk ]'] }
})

exports.deps = (deps, { l, f, d }) => {
  if (l || f || d) return;

  spinner.start('—— Installing npm dependencies')
  if (shell.exec(`npm i -S ${deps.join(' ')}`).code) return spinner.fail()
  spinner.success()
  spinner.start('—— Done installing npm dependencies\n')
}
