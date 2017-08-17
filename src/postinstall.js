import ora from 'ora'
import path from 'path'
import fs from 'fs-extra'
import ascii from './ascii'
import git from 'simple-git'
import config from './config'
import { log } from './utils'
import inquire from 'inquirer'
import resolveRepo from './utils/resolve-repo'

const spinner = ora({ color: 'blue', spinner: config.spinner})
const store = path.resolve(config.root, 'store')

const storeBase = {
  gitstate: {},
  tokens: {
    github: { user: null, token: null, url: 'github.com' },
    bitbucket: { user: null, token: null, url: 'bitbucket.org' }
  }
}

const storeSetup = () => Object.keys(storeBase).map(key => {
  let file = path.resolve(store, `${key}.json`)
  return fs.outputJson(file, storeBase[key], { spaces: 2 })
})

// echo info about issues with git over ssh
console.log(`\n\n${ascii}\n\n`)
log.status('info').echo(
  'spk-cli uses git to keep templates up to date but can\'t authenticate connections over ssh if',
  'your key uses a passphrase. In such cases you will need to provide a token to connect over',
  'https.\n\n<%underline><%yellow>Installation requires access to BitBucket.<%><%>\n'
)

inquire.prompt([
  { type: 'confirm', name: 'passphrase', default: false, message: 'Do you need to set a token?' }
])
// get bitbucket token if need be
.then(({ passphrase }) => {
  if (!passphrase) return Promise.resolve()

  log.status('info').echo(
    'To generate your BitBucket app password, go to <%underline><%blue>BitBucket settings<%><%> in',
    'your account. Under <%underline><%blue>Access management > App passwords<%><%>, generate your',
    'token with <%underline>Repositories Read<%> permissions.\n'
  )

  return inquire.prompt([
    { type: 'input', name: 'user', message: 'BitBucket username:' },
    { type: 'input', name: 'token', message: 'BitBucket app password:' }
  ])
  .then(bb => {
    // save token
    storeBase.tokens.bitbucket.user = bb.user
    storeBase.tokens.bitbucket.token = bb.token
    return Promise.resolve()
  })
})
// write store to disk and ensure templates is empty
.then(() => {
  spinner.start('Preparing store')
  return Promise.all([
    ...storeSetup(),
    fs.emptyDir(path.resolve(store, 'templates'))
  ])
})
// clone master repo
.then(() => new Promise((resolve, reject) => {
  let token = storeBase.tokens.bitbucket
  spinner.text = 'Cloning template index'
  git(store).clone(resolveRepo(config.master, false, token), 'templates', error => {
    if (error) return reject('Could not clone templates repo:\n' + error)
    spinner.succeed()
    process.exit(0)
  })
}))
.catch(err => {
  spinner.fail()
  log.status('error').echo('<%red>An error occured during installation<%>\n\n', err)
  process.exit(1)
})
