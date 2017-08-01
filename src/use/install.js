import fs from 'fs'
import del from 'del'
import path from 'path'
import copy from 'recursive-copy'
import { parseKey } from './helpers'

export default function() {
  const root = path.resolve(this.pwd, 'templates', this.key)

  this.spinner.succeed().start(' Load template')
  this.template = require(path.resolve(root, 'template.json'))

  if (!this.template.checkfile) return Promise.resolve()
  return new Promise((resolve, reject) => {
    fs.access(this.template.checkfile, fs.constants.R_OK | fs.constants.W_OK, error => {
      if (error) return reject(` Missing checkfile, are you in the right directory?\n\n   ${error}`)
      resolve()
    })
  }).then(() => {
    this.spinner.succeed().start(' Remove unnecessary files')

    if (!this.template.remove || this.options.safe) return Promise.resolve()
    return del(this.template.remove)
  }).then(() => {
    let { ignore = [] } = this.template
    let filter = ['**/*', '!.git/**', '!template.json', ...ignore.map(f => '!' + f)]
    console.log(filter)
    this.spinner.succeed().start(' Copy template files')

    return copy(root, process.cwd(), {
      filter,
      dot: true,
      overwrite: !this.options.safe
    })
  }).then(() => {
    let edit = this.template.edit

    this.spinner.succeed().start(' Edit package')

    if (!edit) return Promise.resolve()
    return new Promise((resolve, reject) => {
      fs.readFile('./package.json', 'utf8', (error, pkg) => {
        if (error) return reject(error)
        try { pkg = JSON.parse(pkg) }
        catch (error) { return reject(error) }

        Object.keys(edit).forEach(key => {
          pkg[key] = parseKey(pkg[key], edit[key])
        })

        fs.writeFile('./package.json', JSON.stringify(pkg, null, 2), 'utf8', error => {
          if (error) return reject(error)
          resolve()
        })
      })
    })
  })
}
