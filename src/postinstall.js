import ora from 'ora'
import path from 'path'
import fs from 'fs-extra'
import echo from './echo'
import ascii from './ascii'
import git from 'simple-git'
import config from './config'
import inquire from 'inquirer'
import resolveRepo from './resolve-repo'

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

// deliver info about issues with git over ssh
console.log(`\n\n${ascii}\n\n`)
echo({
  status: 'info',
  msg: [
    'spk-cli uses git to keep templates up to date but can\'t authenticate connections over ssh if',
    'your key uses a passphrase. In such cases you will need to provide a token to connect over',
    'https.<%n><%n><%underline><%yellow>To complete installation, access to BitBucket is',
    'required.<%><%><%n>'
  ]
})

inquire.prompt([
  { type: 'confirm', name: 'passphrase', default: false, message: 'Do you need to set a token?' }
])
// get bitbucket token if need be
.then(({ passphrase }) => {
  if (!passphrase) return Promise.resolve()

  echo({
    status: 'info',
    msg: [
      'To generate your BitBucket app password, go to <%underline><%blue>BitBucket settings<%><%>',
      'in your account. Under <%underline><%blue>Access management > App passwords<%><%>, generate',
      'your token with <%underline>Repositories.Read<%> permissions.<%n>'
    ]
  })

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
.then(() => {
  spinner.start('Downloading templates master')
  return Promise.all([
    ...storeSetup(),
    fs.emptyDir(path.resolve(store, 'templates'))
  ])
})
// clone master repo
.then(() => new Promise((resolve, reject) => {
  git(store).clone(resolveRepo(config.master), 'templates', error => {
    if (error) return reject('Could not clone templates repo:\n' + error)
    spinner.succeed()
    process.exit(0)
  })
}))
.catch(err => {
  spinner.fail()
  echo({ status: 'error', msg: `<%red>An error occured during installation<%>\n\n${err}` })
  process.exit(1)
})
