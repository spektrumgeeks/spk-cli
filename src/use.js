import ora from 'ora'
import del from 'del'
import path from 'path'
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
  let map, index

  // pull template index repo
  spinner.start('Pulling index')
  new Promise((resolve, reject) => {
    git(templates).pull(err => {
      if (err) return reject(err)
      resolve()
    })
  })
  // resolve index and template map
  .then(() => {
    spinner.text = 'Resolving index map'
    index = new IndexMap()
    spinner.text = 'Resolving template map'
    map = index.resolve(uid)

    // output list
    if (list) {
      spinner.succeed('Generating template list')
      echo({ msg: index.list })
      process.exit(0)
    }

    // handle error
    if (map.error) {
      let msg = (!map.list)
        ? `${map.error}.\nAvailable templates:\n${index.list}`
        : `${map.error}.\nPlease use one of the following UIDs:\n${map.list}`

      return Promise.reject(msg)
    }

    if (noUpdate) return Promise.resolve()

    // clone/pull repo
    return new Promise((resolve, reject) => {
      if (!gitstate[uid]) {
        spinner.text = 'Cloning template'
        git(templates).clone(resolveRepo(map), uid, err => {
          if (err) return reject(err)
          gitstate[uid] = true
          resolve(true)
        })
      } else {
        spinner.text = 'Pulling template'
        git(path.resolve(templates, uid)).pull(err => {
          if (err) return reject(err)
          resolve()
        })
      }
    })
    .then(save => {
      if (!save) return Promise.resolve()
      spinner.text = 'Saving gitstate'
      return fs.writeJson(path.resolve(store, 'gitstate.json'), gitstate, { spaces: 2 })
    })
  })
  // assert that specified file exists in target
  .then(() => {
    spinner.text = 'Assert checkfile'
    if (!map.checkfile) return Promise.resolve(true)
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
      let hash = (err || !log.all || !log.all.length) ? '' : log.all[0].hash
      resolve(hash)
    })
  }))
  // edit target package.json
  .then(hash => {
    let local = path.resolve(cwd, 'package.json')
    spinner.text = 'Loading package.json'

    return fs.readJson(local).then(pkg => {
      spinner.text = 'Editing package.json'
      pkg.spk = { uid, hash, name: map.name }
      if (!map.edit) return Promise.resolve(pkg, local)

      Object.keys(map.edit).forEach(key => {
        spinner.text = `Editing package.json -> ${key}`
        pkg[key] = parseFields(pkg[key], map.edit[key])
      })

      return Promise.resolve(pkg, local)
    })
    // save package
    .then((pkg, local) => {
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
  .catch(error => {
    spinner.text += '\n'
    spinner.fail()
    echo({ status: 'error', msg: error })
    process.exit(1)
  })
}
