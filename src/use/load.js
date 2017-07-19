import * as templates from '../../templates'

export default function(payload) {
  const { key, spinner } = payload

  spinner.start(' Load template')
  payload.template = (!key) ? { error: ' No template name provided' }
    : (!templates[key]) ? { error: ` No templates by the name "${key}"` }
    : templates[key]

  // TODO: list all templates
  if (payload.template.error) {
    spinner.fail()
    return Promise.reject(payload.template.error)
  }

  spinner.succeed()
  return Promise.resolve(payload)
}
