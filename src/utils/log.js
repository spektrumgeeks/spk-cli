import chalk from 'chalk'
import wrap from 'wrap-ansi'
import symbols from 'log-symbols'

const echo = function(...msg) {
  let i = 0
  msg = msg.join(' ')

  while (/<%([^>]+)>([^<]+)<%>/.test(msg) && ++i < 5) {
    msg = msg.replace(/<%([^>]+)>([^<]+)<%>/g, (m, $1, $2) => (chalk[$1]) ? chalk[$1]($2) : $2)
  }

  if (this.status && symbols[this.status]) msg = symbols[this.status] + ' ' + msg
  console.log(wrap(msg, 75))
}

export default {
  echo,
  status(status) {
    status = { status }
    return { echo: echo.bind(status) }
  }
}
