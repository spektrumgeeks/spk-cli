import gitCmd from 'simple-git'

export function clone(key, dest, { git, dir }) {
  return new Promise((resolve, reject) => {
    gitCmd(dest).clone(git, dir, err => (err) ? reject(err) : resolve())
  })
}

export function pull(dir) {
  return new Promise((resolve, reject) => {
    gitCmd(dir).pull(err => (err) ? reject(err) : resolve())
  })
}
