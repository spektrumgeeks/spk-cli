import ora from 'ora'
import load from './load'
import tree from './tree'
import edit from './edit'
import chalk from 'chalk'
import config from '../config'

export default function(key, { list, skip }) {
  const spinner = ora(config.spinner)
  spinner.start(' Load template')

  load(key, () => {
    spinner.succeed().start(' Import files')
  })
  .then(template => tree(template, skip, () => {
    spinner.succeed().start(' Update package.json')
  }))
  .then(template => edit(template, () => {
    spinner.succeed()
  }))
  .then(template => {
    console.log(`[${chalk.blue('spk')}] Done importing ${template.name}`)
    console.log(`[${chalk.blue('spk')}] Run "npm i" to complete installation`)
    process.exit(0)
  })
  .catch(error => {
    spinner.fail()
    console.error(`[${chalk.red('spk')}] ${error}`)
    process.exit(1)
  })
}
