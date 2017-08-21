import ora from 'ora'
import del from 'del'
import path from 'path'
import fs from 'fs-extra'
import git from 'simple-git'
import config from './config'
import inquire from 'inquirer'
import copy from 'recursive-copy'
import replace from 'replace-in-file'
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

  // find and replace
  .then(() => {
    if (!map.replace) return Promise.resolve()

    spinner.succeed(`Done. Starting find-and-replace...`)
    const { queries, placeholder } = map.replace
    let scopes = {}
    let questions = []

    // parse each scope's path and questions
    Object.keys(queries).forEach(src => {
      // store the questions count so we know which belong to this scope
      scopes[src] = queries[src].length
      questions.push(...queries[src].map(query => {
        let type = 'input'
        let key, name, message, choices, def, params

        // convert empty answers to undefined
        const filter = input => {
          let falsy = input === false || input === 0
          let notEmpty = input && input.length && input !== placeholder + placeholder
          return (falsy || notEmpty) ? input : undefined
        }

        if (typeof query === 'string') {
          ;[name, message] = (~query.indexOf(':')) ? query.split(':') : [query, query]
          params = { name, message, type, filter }
          if (!~message.indexOf('=')) return params
          ;[message, def] = message.split('=')
          return params
        }

        type = 'confirm'
        key = Object.keys(query)[0]
        ;[name, message] = (~key.indexOf(':')) ? key.split(':') : [key, key]
        params = { name, message, type, filter }

        if (Array.isArray(query[key])) {
          type = 'list'
          choices = query[key].map(opt => {
            if (!~opt.indexOf(':')) return opt
            let [value, name] = opt.split(':')
            return { name, value }
          })
        }

        if (~message.indexOf('=')) [message, def] = message.split('=')
        if (type === 'confirm') def = query[key]

        return (!def)
          ? { name, message, type, choices, filter }
          : { name, message, type, choices, filter, def }
      }))
    })

    // prompt for answer values
    return inquire.prompt(questions).then(answers => {
      // answers' props correspond to { find: replace }
      const greps = Object.keys(answers).map(key => [key, answers[key]])

      // resolve each replacement scope
      Object.keys(scopes).map(src => {
        let from = []
        let to = []
        // remove possible leading slash to prevent running from drive's root
        let files = src.replace(' ', '').split(',').map(pth => pth.replace(/^\//, ''))
        // get this scope's answers
        let scope = greps.splice(0, scopes[src])
          .filter(([grep, sub]) => sub !== undefined)

        scope.forEach(([grep, sub]) => {
          // coerce regex from string
          from.push(eval(`/${placeholder + grep + placeholder}/g`))
          to.push(sub)
        })

        // run sync in case overlapping scopes try to access the same file
        return replace.sync({ files, from, to, allowEmptyPaths: true })
      })
      .forEach(changeset => {
        if (!changeset || !changeset.length) return;

        changeset.forEach(change => {
          spinner.succeed(`Replaced values in ${change.replace(process.cwd(), '')}`)
        })
      })

      return Promise.resolve()
    })
  })

  // all done
  .then(() => {
    spinner.succeed(`Import of ${map.name} complete`)
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
