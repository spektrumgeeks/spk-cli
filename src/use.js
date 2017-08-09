import ora from 'ora'
import del from 'del'
import path from 'path'
import fs from 'fs-extra'
import git from 'simple-git'
import config from './config'
import copy from 'recursive-copy'
import { IndexMap } from './classes'
import { echo, parseFields, resolveRepo } from './utils'

const cwd = process.cwd()
const store = path.resolve(config.root, 'store')
const templates = path.resolve(store, 'templates')
const spinner = ora({ color: 'blue', spinner: config.spinner})
const { gitstate, tokens } = config.store

export default function({ uid, options }) {
  const { list, safe, noUpdate } = options
  let index, repo, map, hash

  // pull template index repo
  spinner.start('Updating template index')
  return new Promise((resolve, reject) => {
    git(templates).pull(err => {
      if (err) return reject(err)
      resolve()
    })
  })

  // resolve index map and repo data
  .then(() => {
    spinner.text = 'Resolving index map'
    index = new IndexMap()

    if (list) {
      spinner.succeed('Generating template list')
      console.log(index.list + '\n')
      process.exit(0)
    }

    spinner.text = 'Resolving repo data'
    repo = index.resolve(uid)

    // handle input errors
    if (repo.error) {
      let msg = (!repo.list)
        ? `${repo.error}.\nAvailable templates:\n${index.list}`
        : `${repo.error}.\nPlease use one of the following UIDs:\n${repo.list}`

      return Promise.reject(msg)
    }

    if (noUpdate) return Promise.resolve()

    // clone or pull repo
    return new Promise((resolve, reject) => {
      if (!gitstate[uid]) {
        spinner.text = 'Downloading template'

        // ensure the directory is empty just in case
        fs.emptyDir(path.resolve(templates, uid)).then(() => {
          git(templates).clone(resolveRepo(repo), uid, err => {
            if (err) return reject(err)
            gitstate[uid] = true
            resolve(true)
          })
        })
      } else {
        spinner.text = 'Updating template'

        git(path.resolve(templates, uid)).pull(err => {
          if (err) return reject(err)
          resolve()
        })
      }
    })

    // save gitstate if changed
    .then(save => {
      if (!save) return Promise.resolve()
      spinner.text = 'Saving store state'
      return fs.writeJson(path.resolve(store, 'gitstate.json'), gitstate, { spaces: 2 })
    })
  })

  // load requested template data
  .then(() => {
    spinner.text = 'Loading template map'

    return fs.readJson(path.resolve(templates, uid, 'template.json')).then(data => {
      map = data
      return Promise.resolve()
    })
  })

  // make sure the checkfile exists
  .then(() => {
    if (!map.checkfile) return Promise.resolve(true)
    spinner.text = 'Verifying checkfile'
    return fs.pathExists(path.resolve(cwd, map.checkfile))
  })

  // remove assets
  .then(exists => {
    if (!exists) return Promise.reject(`Missing checkfile "${map.checkfile}".`)
    if (!map.remove || safe) return Promise.resolve()
    spinner.text = 'Removing unnecessary assets'
    return del(map.remove)
  })

  // copy assets
  .then(() => {
    let ignore = map.ignore || []

    spinner.text = 'Copying assets'

    return copy(path.resolve(templates, uid), cwd, {
      dot: true,
      overwrite: !safe,
      filter: ['**/*', '!.git/**', '!template.json', ...ignore.map(f => '!' + f)]
    })
  })

  // get latest commit hash
  .then(() => new Promise((resolve, reject) => {
    spinner.text = 'Resolving template hash'

    git(path.resolve(templates, uid)).log((err, log) => {
      hash = (err || !log.all || !log.all.length) ? '' : log.all[0].hash
      resolve()
    })
  }))

  // edit target package.json if present
  .then(() => {
    let local = path.resolve(cwd, 'package.json')
    let exists = fs.pathExistsSync(local)
    let pkg

    if (!map.package) return Promise.resolve()
    if (map.package && !exists) return Promise.reject('Missing local package.json')
    spinner.text = 'Loading package.json'

    return fs.readJson(local).then(data => {
      pkg = data
      spinner.text = 'Editing package.json'
      pkg.spk = { uid, hash, repository: resolveRepo(repo, true) }

      // parse local keys against map keys
      Object.keys(map.package).forEach(key => {
        spinner.text = `Editing package.json -> ${key}`
        pkg[key] = parseFields(pkg[key], map.package[key])
      })

      return Promise.resolve()
    })

    // save package
    .then(() => {
      spinner.text = 'Saving package.json'
      return fs.writeJson(local, pkg, { spaces: 2 })
    })
  })

  // all done
  .then(() => {
    spinner.succeed(`Done importing ${map.name}`)
    echo({ status: 'info', msg: 'Don\'t forget to run <%bold>npm i<%>' })
    process.exit(0)
  })

  // catch all error handler
  .catch(error => {
    spinner.fail()
    if (typeof error !== 'string') error = error + ''
    echo({ status: 'error', msg: error })
    process.exit(1)
  })
}
