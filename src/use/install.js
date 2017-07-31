import fs from 'fs'
import del from 'del'
import path from 'path'
import { ncp } from 'ncp'
import { parseKey } from './helpers'

export default function() {
  const root = path.resolve(this.pwd, 'templates', this.key)
  this.template = require(path.resolve(root, 'spk-template.json'))
  this.spinner.start(' Load template')

  return new Promise((resolve, reject) => {
    if (!this.template.checkfile) {
      this.spinner.succeed()
      return resolve()
    }

    fs.access(this.template.checkfile, fs.constants.R_OK | fs.constants.W_OK, error => {
      if (error) return reject(` Missing checkfile, are you in the right directory?\n\n   ${error}`)
      this.spinner.succeed()
      resolve()
    })
  }).then(() => {
    this.spinner.start(' Delete files')

    if (!this.template.files || !this.template.files.delete || this.options.safe) {
      let msg = (this.options.safe) ? ' [safe mode] Skipping file deletion' : ' No files to delete'
      this.spinner.succeed(msg)
      return Promise.resolve()
    }

    try { return del(this.template.files.delete) }
    catch (error) { return Promise.reject(error) }
  }).then(() => {
    let msg = (this.safe) ? ' [safe mode] Copying files without overwriting' : ' Copying files'
    this.spinner.succeed().start(msg)

    if (!template.files || !template.files.import) {
      this.spinner.succeed(' No files to import')
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      const filter = filename => !~['spk-template.json', '.git'].indexOf(filename)
      this.template.files.import.forEach(src => {
        ncp(src, process.cwd(), { filter, clobber: !safe }, err => {
          if (err) reject(err)
        })
      })

      this.spinner.succeed()
      resolve()
    })
  }).then(() => {
    let edit = this.template.edit
    this.spinner.start(' Edit package')

    if (!edit) {
      this.spinner.succeed(' Nothing to edit')
      return Promise.resolve()
    }

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
          this.spinner.succeed()
          resolve(payload)
        })
      })
    })
  })
}
