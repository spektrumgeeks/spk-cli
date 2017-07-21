import fs from 'fs'
import config from '../config'
import { clone, pull } from './git'
import { listTemplates as list } from './helpers'

const templates = require('../../templates/spk-templates.json')

// assess repo states and clone/pull
export default function(payload) {
  const { key, spinner, skipUpdate } = payload
  const templatesRoot = `${config.root}/templates`
  let template

  spinner.start(' Update template')

  if (skipUpdate) {
    spinner.warn(' Skipping update')
    return Promise.resolve(payload)
  }

  template = (!key) ? { error: ' No template name provided' }
    : (!templates[key]) ? { error: ` No templates by the name "${key}"` }
    : templates[key]

  if (template.error) {
    spinner.fail()
    return Promise.reject(`${template.error}. Available templates:\n${list(templates)}`)
  }

  return new Promise((resolve, reject) => {
    // load status data
    fs.readFile(`${templatesRoot}/.gitstatus`, 'utf8', (error, status) => {
      let gitOp

      if (error) {
        spinner.fail()
        return reject(error)
      }

      try {
        status = JSON.parse(status)
      } catch (error) {
        spinner.fail()
        return reject(error)
      }

      if (!status[key]) {
        gitOp = clone(template, templatesRoot, template)
        status[key] = true
      } else {
        gitOp = pull(`${templatesRoot}/${key}`)
      }

      Promise.all([gitOp]).then(() => {
        // write status data back to disk
        fs.writeFile(`${templatesRoot}/.gitstatus`, JSON.stringify(status, null, 2), 'utf8', error => {
          if (error) {
            spinner.fail()
            return reject(error)
          }

          // script success exit point
          spinner.succeed()
          resolve(payload)
        })
      })
      // catch clone/pull errors
      .catch(error => {
        spinner.fail()
        reject(` Could not process the repo\n${error}`)
      })
    })
  })
}
