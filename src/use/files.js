import fs from 'fs'
import del from 'del'
import { ncp } from 'ncp'
import config from '../config'
import { parseKey } from './helpers'

export default {
  // delete files specified in template's config.files.delete
  delete(payload) {
    const { template, spinner, safe } = payload
    spinner.start(' Delete files')

    if (!template.files || !template.files.delete || safe) {
      spinner.succeed(` ${(safe) ? '[safe mode] ' : ''}No files to delete`)
      return Promise.resolve(payload)
    }

    try {
      return del(template.files.delete).then(() => {
        spinner.succeed()
        return Promise.resolve(payload)
      })
    } catch (error) {
      spinner.fail()
      return Promise.reject(error)
    }
  },

  // import files from template's config.files.import
  import(payload) {
    const { template, spinner, safe } = payload
    let fixtures = (safe) ? { pre: '[safe mode] ', post: ' without overwriting' } : {}
    spinner.start(` ${fixtures.pre || ''}Import files${fixtures.post || ''}`)

    if (!template.files || !template.files.import) {
      spinner.succeed(` ${fixtures.pre || ''}No files to import`)
      return Promise.resolve(payload)
    }

    return new Promise((resolve, reject) => {
      let src = `${config.root}/templates/${template.key}/${template.files.import}`
      ncp(src, process.cwd(), { clobber: !safe }, error => {
        if (error) {
          spinner.fail()
          return reject(error)
        }

        spinner.succeed()
        resolve(payload)
      })
    })
  },

  // edit package.json using template's config.edit map
  edit(payload) {
    const { template, spinner } = payload
    let { edit } = template
    spinner.start(' Edit package.json')

    if (!edit) {
      spinner.succeed(' Nothing to edit')
      return Promise.resolve(payload)
    }

    return new Promise((resolve, reject) => {
      fs.readFile('./package.json', 'utf8', (error, pkg) => {
        if (error) {
          spinner.fail()
          return reject(error)
        }

        try {
          pkg = JSON.parse(pkg)
        } catch (error) {
          spinner.fail()
          return reject(error)
        }

        Object.keys(edit).forEach(key => {
          pkg[key] = parseKey(pkg[key], edit[key])
        })

        fs.writeFile('./package.json', JSON.stringify(pkg, null, 2), 'utf8', error => {
          if (error) {
            spinner.fail()
            return reject(error)
          }

          spinner.succeed()
          return resolve(payload)
        })
      })
    })
  }
}
