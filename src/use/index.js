import ora from 'ora'
import chalk from 'chalk'
import load from './load'
import files from './files'
import config from '../config'
import symbol from 'log-symbols'

export default function(key, { list, safe }) {
  const spinner = ora(config.spinner)

  load({ key, safe, spinner })
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
