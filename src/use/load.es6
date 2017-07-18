import * as templates from '../../templates'

export default function(key, success) {
  let template = (!key) ? { error: ' No template name provided' }
    : (!templates[key]) ? { error: ` No templates by the name "${key}"` }
    : templates[key]

  // TODO: list all templates
  if (template.error) return Promise.reject(template.error)

  success()
  return Promise.resolve(template)
}
