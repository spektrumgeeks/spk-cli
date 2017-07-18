import fs from 'fs'

export default function(template, success) {
  let { edit } = template
  if (!edit) return Promise.resolve(template)

  return new Promise((resolve, reject) => {
    fs.readFile('./package.json', 'utf8', (error, pkg) => {
      if (error) return reject(error)

      try { pkg = JSON.parse(pkg) }
      catch (error) { return reject(error) }

      Object.keys(edit).forEach(key => {
        pkg[key] = parseKey(pkg[key], edit[key])
      })

      fs.writeFile('./package.json', JSON.stringify(pkg, null, 2), 'utf8', error => {
        if (error) return reject(error)
        success()
        return resolve(template)
      })
    })
  })
}

function parseKey(pkg, edit) {
  let { push, merge, filter, concat, replace } = edit
  // new prop
  if (!pkg) return push || merge || filter || concat || replace || edit
  // replace value
  if (replace) return replace
  // concat strings
  if (concat && typeof pkg === 'string') return pkg + concat.glue + concat.string
  // merge objects
  if (merge && typeof pkg === 'object') return { ...pkg, ...merge }
  // push array
  if (push && Array.isArray(pkg)) return [ ...pkg, ...push ]
  // filter arrays
  if (filter && Array.isArray(pkg)) {
    let keys = {}
    return [ ...pkg, ...filter ].filter(item => {
      let key = JSON.stringify(item)
      return (keys[key]) ? false : (keys[key] = true)
    })
  }

  // fallback to src
  return pkg
}
