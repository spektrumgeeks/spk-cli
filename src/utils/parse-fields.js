// template field parser
export default function(pkg, edit) {
  let { push, merge, filter, concat, replace } = edit
  let value = push || merge || filter || concat || replace

  // filter arrays
  if (filter && Array.isArray(pkg)) {
    let keys = {}
    return [ ...pkg, ...filter ].filter(item => {
      let key = JSON.stringify(item)
      return (keys[key]) ? false : (keys[key] = true)
    })
  }

  // concat strings
  if (concat && typeof pkg === 'string') return pkg + concat.glue + concat.string
  // merge objects
  if (merge && typeof pkg === 'object') return { ...pkg, ...merge }
  // push array
  if (push && Array.isArray(pkg)) return [ ...pkg, ...push ]
  // replace value
  if (replace) return replace
  // new prop
  if (!pkg) return value
  // fallback to src
  return pkg
}
