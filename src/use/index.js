import ora from 'ora'
import update from './update'
import config from '../config'
import install from './install'
import symbol from 'log-symbols'

const spinner = ora({ color: 'blue', spinner: config.spinner})

export default function({ key, options }) {
  const store = {
    key,
    options,
    spinner,
    pwd: config.root
  }

  update.call(store).then(() => install.call(store)).then(() => {
    spinner.succeed()
    console.log(symbol.info, ` Done importing ${store.template.name}`)
    console.log(symbol.info, ' Run "npm i" to complete installation')
    process.exit(0)
  })
  .catch(error => {
    spinner.fail()
    console.error(symbol.error, error)
    process.exit(1)
  })
}
