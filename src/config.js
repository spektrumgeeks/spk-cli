import path from 'path'
import fs from 'fs-extra'
import { echo } from './utils'

const root = path.resolve(__dirname, '../')
const stores = ['gitstate', 'tokens', 'templates/index']

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

      try {
        store[key.split('/')[0]] = fs.readJsonSync(file)
      } catch (err) {
        echo({ status: 'error', msg: [`Could not load ${key} from the store\n\n`, err] })
      }
    })

    return store
  }
}
