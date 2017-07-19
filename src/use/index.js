import ora from 'ora'
import chalk from 'chalk'
import load from './load'
import edit from './edit'
import files from './files'
import config from '../config'

export default function(key, { list, safe }) {
  const spinner = ora(config.spinner)

  load({ key, safe, spinner })
    .then(payload => files.delete(payload))
    .then(payload => files.import(payload))
    .then(payload => files.edit(payload))
    .then(({ template }) => {
      console.log(`   [${chalk.blue('spk')}] Done importing ${template.name}`)
      console.log(`   [${chalk.blue('spk')}] Run "npm i" to complete installation`)
      process.exit(0)
    })
    .catch(error => {
      console.error(`\n   [${chalk.red('spk')}] ${error}`)
      process.exit(1)
    })
}
