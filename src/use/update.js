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
    this.spinner.start(' Update maps')

    // update template maps
    git(src.templates).pull(err => {
      if (err) return reject(err)
      this.spinner.succeed().start(' Update template')

      const maps = require(path.resolve(this.pwd, 'templates/index.json'))
      const keyMap = {}
      const keyList = []

      // build template key map
      Object.keys(maps).filter(key => !~key.indexOf('default')).forEach(key => {
        let aliases = maps[key].alias
        keyMap[key] = key

        if (!aliases) return keyList.push(`\t- ${key}`)

        keyList.push(`\t- ${key} (alias: ${aliases})`)
        aliases.split(' ').forEach(alias => {
          keyMap[alias] = key
        })
      })

      // resolve template map
      const map = (!this.key) ? { error: ' No template name provided' }
        : (!keyMap[this.key]) ? { error: ` No template keys corresponding to "${this.key}"` }
        : maps[ keyMap[this.key] ]

      const save = state => {
        fs.writeFile(src.gitstate, JSON.stringify(state, null, 2), 'utf8', error => {
          if (error) return reject(error)
          resolve()
        })
      }

      if (map.error) return reject(`${map.error}. Available templates:\n${keyList.join('\n')}`)
      if (this.options.skipUpdate) return resolve()

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
