import path from 'path'
import fs from 'fs-extra'
import inquire from 'inquirer'
import symbols from 'log-symbols'
import replace from 'replace-in-file'

fs.readJson(path.resolve(__dirname, 'tests/replace.test.json'))
.then(({ queries, placeholder, seperator = '=' }) => {
  let sources = {}
  let questions = []

  Object.keys(queries).forEach(src => {
    sources[src] = queries[src].length
    questions.push(...queries[src].map(query => {
      let type = 'input'
      let key, name, message, choices

      const filter = input => {
        let falsy = input === false || input === 0
        let notEmpty = input && input.length && input !== '%%'
        return (falsy || notEmpty) ? input : undefined
      }

      if (typeof query === 'string') {
        ;[name, message] = (~query.indexOf(seperator)) ? query.split(seperator) : [query, query]
        return { name, message, type, filter }
      }

      type = 'confirm'
      key = Object.keys(query)[0]
      ;[name, message] = (~key.indexOf(seperator)) ? key.split(seperator) : [key, key]

      if (Array.isArray(query[key])) {
        type = 'list'
        choices = query[key].map(opt => {
          if (!~opt.indexOf(':')) return opt
          let [value, name] = opt.split(':')
          return { name, value }
        })
      }

      return { name, message, type, choices, filter }
    }))
  })

  return inquire.prompt(questions).then(answers => {
    const greps = Object.keys(answers).map(key => [key, answers[key]])
    let changeset = []

    Object.keys(sources).forEach(src => {
      let from = []
      let to = []
      let files = src.replace(' ', '').split(',').map(pth => pth.replace(/^\//, ''))
      let scope = greps.splice(0, sources[src])
        .filter(([grep, sub]) => sub !== undefined)

      scope.forEach(([grep, sub]) => {
        from.push(eval(`/${placeholder + grep + placeholder}/g`))
        to.push(sub)
      })

      changeset.push(replace.sync({ files, from, to, allowEmptyPaths: true }))
    })

    return Promise.resolve(changeset)
  })
})
.then(changeset => {
  changeset.forEach(change => console.log(change))
})
.catch(err => console.log(symbols.error, err))
