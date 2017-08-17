import ora from 'ora'
import del from 'del'
import path from 'path'
import fs from 'fs-extra'
import git from 'simple-git'
import config from './config'
import copy from 'recursive-copy'
import { log, resolveRepo } from './utils'
import { IndexMap, PackageEditor } from './classes'

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
            spinner.text = 'Saving store state'
            gitstate[uid] = true
            fs.writeJson(path.resolve(store, 'gitstate.json'), gitstate, { spaces: 2 }).then(() => {
              resolve()
            })
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
    return fs.pathExists(path.resolve(cwd, map.checkfile)).then(exists => {
      if (!exists) return Promise.reject(`Missing checkfile "${map.checkfile}".`)
      return Promise.resolve()
    })
  })

  // remove assets
  .then(() => {
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
    let pkg

    if (!map.package) return Promise.resolve()

    if (map.package && !fs.pathExistsSync(local)) {
      return Promise.reject('Missing local package.json')
    }

    spinner.text = 'Loading package.json'
    pkg = new PackageEditor(local, map.package)

    spinner.text = 'Editing package.json'
    pkg.meta = { uid, hash, repository: resolveRepo(repo, true) }

    return pkg.parse().then(() => {
      spinner.text = 'Saving package.json'
      return pkg.resolve()
    })
  })

  // all done
  .then(() => {
    spinner.succeed(`Done importing ${map.name}`)
    log.status('info').echo('Don\'t forget to run <%bold>npm i<%>')
    process.exit(0)
  })

  // catch all error handler
  .catch(error => {
    spinner.fail()
    if (typeof error !== 'string') error = error + ''
    log.status('error').echo(error)
    process.exit(1)
  })
}
