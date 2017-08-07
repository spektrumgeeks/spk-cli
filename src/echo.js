import chalk from 'chalk'
import wrap from 'wrap-ansi'
import symbols from 'log-symbols'

export default ({ msg, status, whitespace, cols = 60 }) => {
  let i = 0

  if (!whitespace) msg = msg.replace('\n', ' ').replace('\t', ' ')
  msg = msg.replace('<br%>', '\n').replace('<tb%>', '\t')

  while (/<%([^>]+)>([^<]+)<%>/.test(msg) && ++i < 5) {
    msg = msg.replace(/<%([^>]+)>([^<]+)<%>/g, (m, $1, $2) => (chalk[$1]) ? chalk[$1]($2) : $2)
  }

  if (status && symbols[status]) msg = symbols[status] + ' ' + msg
  if (parseInt(cols)) msg = wrap(msg, cols)

  console.log(msg)
}
