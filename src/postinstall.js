import fs from 'fs'
import git from './git'
import path from 'path'
import config from '../config'

const gitstate = path.resolve(config.root, 'templates/.gitstate')

git.clone({ repo: config.repo, dir: 'templates', dest: config.root }).then(() => {
  fs.writeFile(gitstate, JSON.stringify({}, null, 2), 'utf8', error => {
    if (error) {
      console.log('Could not create .gitstate file\n', error)
      process.exit(1)
    }

    process.exit(0)
  })
})
