import path from 'path'
import fs from 'fs-extra'
import symbols from 'log-symbols'

const root = path.resolve(__dirname, '../')
const stores = ['gitstate', 'tokens']

export default {
  root,
  master: {
    provider: 'bitbucket',
    repo: 'snippets/spektrummedia/G4XA4k/spk-templates'
  },

  spinner: {
    interval: 120,
    frames: ['[spk]', '[ sp]', '[  s]', '[k  ]', '[pk ]']
  },

  get store() {
    let store = {}

    stores.forEach(key => {
      let file = path.resolve(root, 'store', `${key}.json`)
      if (!fs.pathExistsSync(file)) return;

      try { store[key] = fs.readJsonSync(file) }
      catch (err) { console.error(symbols.error, `Could not load ${key} from the store\n\n`, err) }
    })

    return store
  }
}
