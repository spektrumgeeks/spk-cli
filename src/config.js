import path from 'path'

export default {
  root: __dirname.split(path.sep).slice(0, -1).join('/'),
  description: '—— Command line tool for importing project templates and running tasks ——\n\n',
  spinner: {
    color: 'blue',
    spinner: { interval: 100, frames: ['   [spk]', '   [ sp]', '   [  s]', '   [k  ]', '   [pk ]'] }
  }
}
