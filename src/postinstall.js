import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import ascii from './ascii'
import git from 'simple-git'
import config from './config'
import inquire from 'inquirer'
import symbol from 'log-symbols'
import resolveRepo from './resolve-repo'

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

// deliver info about issues with git over ssh
console.log(ascii, '\n\n', symbol.info, 'spk-cli uses git to keep templates up to date but cannot',
  'authenticate connections over ssh if your key uses a passphrase. In such cases you will need to',
  'provide a token to connect over https.\n\n',
  chalk.bold('To complete installation, access to BitBucket will be required.'))

inquire.prompt([
  { type: 'confirm', name: 'passphrase', default: false, message: 'Do you need to set a token?' }
])

// get bitbucket token if need be
.then(({ passphrase }) => {
  if (!passphrase) return Promise.resolve()

  console.log('To generate your BitBucket app password, go to "BitBucket settings" for your',
    'account and generate a token under "Access management > App passwords".\n\n',
    chalk.bold('Minimum required permissions are "Repositories > Read".'))

  return inquire.prompt([
    { type: 'input', name: 'user', message: 'BitBucket username:' },
    { type: 'password', name: 'token', message: 'BitBucket app password:' }
  ])
  .then(bb => {
    // save token
    storeBase.tokens.bitbucket.user = bb.user
    storeBase.tokens.bitbucket.token = bb.token
    return Promise.resolve()
  })
})

// write store to disk and ensure templates is empty
.then(() => Promise.all([
  ...storeSetup(),
  fs.emptyDir(path.resolve(store, 'templates'))
]))

// clone master repo
.then(() => new Promise((resolve, reject) => {
  git(store).clone(resolveRepo(config.master), 'templates', error => {
    if (error) return reject('Could not clone templates repo\n\n' + error)
    process.exit(0)
  })
}))
.catch(err => {
  console.log(symbols.error, 'An error occured during installation\n\n', err)
  process.exit(1)
})
