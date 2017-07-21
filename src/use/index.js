import ora from 'ora'
import chalk from 'chalk'
import load from './load'
import files from './files'
import update from './update'
import config from '../config'
import symbol from 'log-symbols'

export default function(key, options) {
  const spinner = ora(config.spinner)

  update({ key, spinner, ...options })
    .then(payload => load(payload))
    .then(payload => files.delete(payload))
    .then(payload => files.import(payload))
    .then(payload => files.edit(payload))
    .then(({ template }) => {
      console.log(symbol.info, ` Done importing ${template.name}`)
      console.log(symbol.info, ' Run "npm i" to complete installation')
      process.exit(0)
    })
    .catch(error => {
      console.error(symbol.error, error)
      process.exit(1)
    })
}
