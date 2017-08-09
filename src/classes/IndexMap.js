import config from '../config'

// generate a template uid/alias map and loggable uid list
export class IndexMap {
  constructor() {
    this.index = config.store.templates
    this.uids = Object.keys(this.index).filter(uid => !~uid.indexOf('default'))
    this.map = {}

    this.uids.forEach(uid => {
      let alias = this.index[uid].alias || ''

      if (this.map[uid]) throw new Error(`Duplicate UID ${uid} in template index.`)
      this.map[uid] = [uid]

      alias.split(' ').forEach(a => {
        if (!a.length) return;
        if (!this.map[a]) return (this.map[a] = [uid])
        if (~this.map[a].indexOf(uid)) return;
        this.map[a].push(uid)
      })
    })
  }

  get list() {
    return this.uids.map(uid => {
      let entry = `\t- ${uid}`
      let alias = this.index[uid].alias
      return (!alias) ? entry : entry += `\t\t[ alias: ${alias.split(' ').join(' | ')} ]`
    }).join('\n')
  }

  resolve(uid) {
    if (!uid) return { error: 'No template UID provided' }
    if (!this.map[uid]) return { error: `No templates corresponding to "${uid}"` }
    return (this.map[uid].length > 1)
      ? { error: `Multiple templates with alias "${uid}"`, list: this.map[uid].join('\n') }
      : this.index[ this.map[uid][0] ]
  }
}
