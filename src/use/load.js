import fs from 'fs'
const templates = require('../../templates/spk-templates.json')

export default function(payload) {
  const { key, spinner } = payload

  spinner.start(' Load template')
  payload.template = require(`../../templates/${templates[key].dir}`)

  if (!payload.template.checkfile) {
    spinner.succeed()
    return Promise.resolve(payload)
  }

  return new Promise((resolve, reject) => {
    fs.access(payload.template.checkfile, fs.constants.R_OK | fs.constants.W_OK, error => {
      if (error) {
        spinner.fail()
        return reject(` Missing checkfile\n   ${error}`)
      }

      spinner.succeed()
      resolve(payload)
    })
  })
}
