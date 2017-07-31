import fs from 'fs'
import del from 'del'
import path from 'path'
import git from 'simple-git'
import config from './config'
import symbol from 'log-symbols'

git(config.root).clone(config.repo, 'templates', error => {
  let gitstate = JSON.stringify({}, null, 2)

  if (error) {
    console.log(symbol.error, 'Could not clone tempaltes repo\n\n', error)
    process.exit(1)
  }

  fs.writeFile(path.resolve(config.root, 'templates/.gitstate'), gitstate, 'utf8', error => {
    if (error) {
      console.log(symbol.warn, 'Could not create .gitstate file\n\n', error)
      process.exit(1)
    }

    fs.rmdir(path.resolve(config.root, 'templates/.git'), error => {
      if (error) console.log(symbol.warn, 'Could not remove templates/ .git repo\n\n', error)
      process.exit(0)
    })
  })
})
