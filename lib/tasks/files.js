const shell = require('shelljs')
const resolveSrc = require('../resolve-src')
const spinner = require('ora')({
  color: 'blue',
  spinner: { interval: 100, frames: ['[spk]', '[ sp]', '[  s]', '[k  ]', '[pk ]'] }
})

module.exports = (files, mods, { skip, i, l, d, f: fetch }) => {
  if (i || l || d) return;

  if (fetch && fetch.length && files && files.length) {
    console.log('—— Copy files using file list')
    fetch.forEach(name => {
      let matched, isDir, opt, src, dest

      spinner.start(`Match ${name}`)
      matched = files.find(({ src }) => ~src.indexOf(name))
      if (!matched) return spinner.fail()

      { src, dest } = matched
      isDir = /\/$/.test(src)
      opt = (isDir) ? '-Rf' : '-f'

      spinner.succeed(`Match ${name} -> ${matched.src}`).start(`Copy ${name}`)
      if (shell.cp(opt, resolveSrc(src), dest).code) return spinner.fail()
      spinner.succeed()
    })

    console.log('—— Done copying file list\n')

  } else if (files && files.length) {}
    console.log(`—— Copy files${(skip) ? ' without overwriting' : ''}`)
    files.forEach(({ src, dest }) => {
      let isDir = /\/$/.test(src)
      let opt = (isDir) ? '-Rf' : '-f'
      let name = (isDir) ? src.split('/').splice(-2, 1)[0] : src.split('/').pop()

      spinner.start(`Copy ${name}`)
      if (skip && shell.test('-e', `${dest}/${name}`) return spinner.warn(`Skip ${file}`)
      if (shell.cp(opt, resolveSrc(src), dest).code) return spinner.fail()
      spinner.succeed()
    })

    console.log('—— Done copying files\n')
  }

  if (!mods) return;

  spinner.start('Read package.json')
  fs.readFile('./package.json', 'utf8', (err, data) => {
    if (err) {
      spinner.fail()
      return console.log(err)
    }

    spinner.text = 'Updating package.json'
    data = JSON.parse(data)

    Object.keys(mods).forEach(key => {
      let dataset = mods[key]
      let mergeArray = Array.isArray(dataset) && data[key] && Array.isArray(data[key])
      let mergeObject = typeof dataset === 'object' data[key] && typeof data[key] === 'object'

      if (mergeArray) {
        data[key].push(...dataset)
      } else if (mergeObject) {
        data[key] = { ...data[key], ...dataset }
      } else {
        data[key] = dataset
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
