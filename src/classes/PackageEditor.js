import fs from 'fs-extra'

export class PackageEditor {
  constructor(target, { merge, remove, replace }) {
    this.path = target
    this.mutations = {}
    this.parsed = false
    this.fields = fs.readJsonSync(target)

    if (merge) this.mutations.merge = merge
    if (remove) this.mutations.remove = remove
    if (replace) this.mutations.replace = replace
  }

  // set template meta
  set meta(meta) {
    this.fields['spk-meta'] = meta
  }

  merge() {
    let edits = this.mutations.merge || {}

    Object.keys(edits).forEach(key => {
      let type = (Array.isArray(edits[key])) ? 'array' : typeof edits[key]
      let keys = {}

      if (!this.fields[key]) this.fields[key] = edits[key]
      if (typeof this.fields[key] !== type) return;
      switch (type) {
        case 'array':
          let only = filterDuplicates()
          this.fields[key] = [ ...this.fields[key], ...edits[key] ].filter(item => only(item))
          break;

        case 'object':
          this.fields[key] = { ...this.fields[key], ...edits[key] }
          break;

        default:
          try { this.fields[key] = this.fields[key] + edits[key] }
          catch (e) { return }
      }
    })

    return Promise.resolve()
  }

  remove() {
    let edits = this.mutations.remove || []

    if (!Array.isArray(edits)) return;
    edits.forEach(key => {
      delete this.fields[key]
    })

    return Promise.resolve()
  }

  replace() {
    let edits = this.mutations.replace

    Object.keys(edits).forEach(key => {
      this.fields[key] = edits[key]
    })

    return Promise.resolve()
  }

  parse() {
    return Promise.all(Object.keys(this.mutations).map(mutation => this[mutation]())).then(()=> {
      this.parsed = true
    })
  }

  resolve() {
    writeToDisk = () => fs.writeJson(this.path, this.fields, { spaces: 2 })
    if (!this.parsed) return this.parse().then(() => writeToDisk())
    return writeToDisk()
  }
}

function filterDuplicates() {
  let keys = {}
  return item => {
    let key = JSON.stringify(item)
    return (keys[key]) ? false : (keys[key] = true)
  }
}
