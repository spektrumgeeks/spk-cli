import path from 'path'
import { ncp } from 'ncp'

export default function(template, skip, success) {
  if (!template.tree) return Promise.resolve(template)

  return new Promise((resolve, reject) => {
    let src = `${__dirname.split(path.sep).slice(0, -2).join('/')}/${template.tree}`

    ncp(src, process.cwd(), { clobber: !skip }, error => {
      if (error) return reject(error)

      success()
      resolve(template)
    })
  })
}
