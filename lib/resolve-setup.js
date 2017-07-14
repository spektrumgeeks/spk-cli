const setups = require('../setups')
const files = require('./tasks/files')
const dirs = require('./tasks/dirs')
const deps = require('./tasks/deps')

module.exports = argsv => {
  let files, mods, dirs, deps
  let setup = setups[argsv.setup]
  
  if (!setup) return console.log('Sorry, no setup by that name')

  { files, mods, dirs, deps } = setups[argsv.setup]
  if (files || mods) dispatch.files(files, mods, argsv)
  if (dirs) dispatch.dirs(dirs, argsv)
  if (deps) dispatch.deps(deps, argsv)
}
