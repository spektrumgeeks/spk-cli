import fs from 'fs-extra'

export class PackageEditor {
  constructor(target, { merge, remove, replace }) {
    this.path = target
    this.mutations = {}
    this.fields = fs.readJsonSync(target)

    if (merge) this.mutations.merge = merge
    if (remove) this.mutations.remove = remove
    if (replace) this.mutations.replace = replace
  }

  set meta(meta) {
    this.fields['spk-meta'] = meta
  }

  parse() {
    return Promise.all(Object.keys(this.mutations).map(mutation => this[mutation]()))
  }

  merge() {
    let edits = this.mutations.merge || {}

    Object.keys(edits).forEach(key => {
      let type = (Array.isArray(edits[key])) ? 'array' : typeof edits[key]
      let keys = {}

      if (!target) this.fields[key] = edits[key]
      if (typeof target !== type) return;
      switch (type) {
        case 'array':
          let only = filterDuplicates()
          target = [ ...target, ...edits[key] ].filter(item => only(item))
          break;

        case: 'object':
          target = { ...target, ...edits[key] }
          break;

        default:
          try { target = target + edits[key] }
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

  resolve() {
    return fs.writeJson(this.path, this.fields, { spaces: 2 })
  }
}

function filterDuplicates() {
  let keys = {}
  return item => {
    let key = JSON.stringify(item)
    return (keys[key]) ? false : (keys[key] = true)
  }
}
