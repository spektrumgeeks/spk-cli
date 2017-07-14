const fs = require('fs')
const shell = require('shelljs')
const spinner = require('ora')({
  color: 'blue',
  spinner: { interval: 100, frames: ['[spk]', '[ sp]', '[  s]', '[k  ]', '[pk ]'] }
})

module.exports = (files, mods, { skip, i, l, d, f: fetch }) => {
  if (i || l || d) return;

  if (fetch && fetch.length && files && files.length) {
    console.log('—— Copy files using file list')
    fetch.forEach(name => {
      let matched, isDir, opt, base, src, dest

      spinner.start(`Match ${name}`)
      matched = files.find(({ src }) => ~src.indexOf(name))
      if (!matched) return spinner.fail()

      base = matched.base
      src = matched.src
      dest = matched.dest
      isDir = /\/$/.test(src)
      opt = (isDir) ? '-Rf' : '-f'

      spinner.succeed(`Match ${name} -> ${matched.src}`).start(`Copy ${name}`)
      if (shell.cp(opt, `${base}/${src}`, dest).code) return spinner.fail()
      spinner.succeed()
    })

    console.log('—— Done copying file list\n')

  } else if (files && files.length) {
    console.log(`—— Copy files${(skip) ? ' without overwriting' : ''}`)
    files.forEach(({ base, src, dest }) => {
      let isDir = /\/$/.test(src)
      let opt = (isDir) ? '-Rf' : '-f'
      let name = (isDir) ? src.split('/').splice(-2, 1)[0] : src.split('/').pop()

      spinner.start(`Copy ${name}`)
      if (skip && shell.test('-e', `${dest}/${name}`)) return spinner.warn(`Skip ${file}`)
      if (shell.cp(opt, `${base}/${src}`, dest).code) return spinner.fail()
      spinner.succeed()
    })

    console.log('—— Done copying files\n')
  }

  console.log(mods)
  if (!mods) return;

  spinner.start('Read package.json')
  fs.readFile('./package.json', 'utf8', (err, data) => {
    let merge, replace, mergeArray, mergeObject

    if (err) {
      spinner.fail()
      return console.log(err)
    }

    spinner.text = 'Updating package.json'
    data = JSON.parse(data)
    merge = mods.merge || {}
    replace = mods.replace || {}

    Object.keys(replace).forEach(key => {
      data[key] = replace[key]
    })

    Object.keys(merge).forEach(key => {
      mergeArray = Array.isArray(merge[key]) && data[key] && Array.isArray(data[key])
      mergeObject = typeof merge[key] === 'object' && data[key] && typeof data[key] === 'object'
      if (mergeArray) {
        data[key].push(...merge[key])
      } else if (mergeObject) {
        Object.keys(merge[key]).forEach(prop => {
          data[key][prop] = merge[key][prop]
        })
      } else {
        data[key] = merge[key]
      }
    })

    fs.writeFile('./package.json', JSON.stringify(data, null, 2), 'utf8', err => {
      if (err) {
        spinner.fail()
        return console.log(err)
      }

      spinner.succeed()
      console.log('—— Done all file processes\n')
    })
  })
}
