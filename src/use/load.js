import fs from 'fs'
import * as templates from '../../templates'

const list = Object.keys(templates)
  .filter(name => name !== 'default')
  .map(name => `\t${name}`)
  .join('\n')

export default function(payload) {
  const { key, spinner } = payload

  spinner.start(' Load template')
  payload.template = (!key) ? { error: ' No template name provided' }
    : (!templates[key]) ? { error: ` No templates by the name "${key}"` }
    : templates[key]

  if (payload.template.error) {
    spinner.fail()
    return Promise.reject(`${payload.template.error}. Available templates:\n${list}`)
  }

  if (!payload.template.checkfile) {
    spinner.succeed()
    spinner.warn(' No checkfile')
    return Promise.resolve(payload)
  }

  return new Promise((resolve, reject) => {
    fs.access(payload.template.checkfile, fs.constants.R_OK | fs.constants.W_OK, error => {
      if (error) {
        spinner.fail()
        reject(error)
      }

      spinner.succeed()
      resolve(payload)
    })
  })
}
