import fs from 'fs'
import path from 'path'
import git from 'simple-git'

// assess repo state, clone/pull and update state
export default function() {
  const src = {
    templates: path.resolve(this.pwd, 'templates/'),
    gitstate: path.resolve(this.pwd, 'templates/.gitstate')
  }

  return new Promise((resolve, reject) => {
    this.spinner.start(' Update template maps')

    // update template maps
    git(src.templates).pull(err => {
      if (err) return reject(err)

      this.spinner.succeed().start(' Update template')

      const maps = require(path.resolve(this.pwd, 'templates/index.json'))
      const list = Object.keys(maps)
        .filter(name => name !== 'default')
        .map(name => `\t- ${name}`)
        .join('\n')

      // resolve template map
      const map = (!this.key) ? { error: ' No template name provided' }
        : (!maps[this.key]) ? { error: ` No templates by the name "${this.key}"` }
        : maps[this.key]

      const save = state => {
        fs.writeFile(src.gitstate, JSON.stringify(state, null, 2), 'utf8', error => {
          if (error) return reject(error)
          this.spinner.succeed()
          resolve()
        })
      }

      if (map.error) return reject(`${map.error}. Available templates:\n${list}`)

      if (this.options.skipUpdate) {
        this.spinner.warn(' Skipping update')
        return resolve()
      }

      // load and check repo state
      fs.readFile(src.gitstate, 'utf8', (error, state) => {
        if (error) return reject(error)

        try { state = JSON.parse(state) }
        catch (err) { reject(err) }

        if (!state[this.key]) {
          // git clone if template is not present
          git(src.templates).clone(map.repo, map.name, err => {
            if (err) return reject(err)
            state[this.key] = true
            save(state)
          })
        } else {
          // git pull template repo
          git(path.resolve(src.templates, map.name)).pull(err => {
            if (err) return reject(err)
            save(state)
          })
        }
      })
    })
  })
}
