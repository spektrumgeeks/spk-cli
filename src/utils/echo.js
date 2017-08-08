import chalk from 'chalk'
import wrap from 'wrap-ansi'
import symbols from 'log-symbols'

export default ({ msg, status, cols = 75 }) => {
  let i = 0
  if (Array.isArray(msg)) msg = msg.join(' ')
  msg = msg.replace(/<%n>/g, '\n').replace(/<%t>/g, '\t')

  while (/<%([^>]+)>([^<]+)<%>/.test(msg) && ++i < 5) {
    msg = msg.replace(/<%([^>]+)>([^<]+)<%>/g, (m, $1, $2) => (chalk[$1]) ? chalk[$1]($2) : $2)
  }

  if (status && symbols[status]) msg = symbols[status] + ' ' + msg
  if (parseInt(cols)) msg = wrap(msg, cols)
  console.log(msg)
}
