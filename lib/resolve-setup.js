const setups = require('../setups')
const files = require('./tasks/files')
const dirs = require('./tasks/dirs')
const deps = require('./tasks/deps')

module.exports = argsv => {
  let files, mods, dirs, deps
  let setup = setups[argsv.setup]

  if (!setup) return console.log('Sorry, no setup by that name')

  files = setup.files
  mods = setup.mods
  dirs = setup.dirs
  deps = setup.deps

  if (files || mods) files(files, mods, argsv)
  if (dirs) dirs(dirs, argsv)
  if (deps) deps(deps, argsv)
}
