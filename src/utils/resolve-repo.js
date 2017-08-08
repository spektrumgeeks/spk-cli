import config from '../config'

export default ({ provider, repo }) => {
  let auth = config.store.tokens[provider]
  repo = repo.replace(/\.git$/, '') + '.git'

  return (!auth.token)
    ? `git@${auth.url}:${repo}`
    : `https://${auth.user}:${auth.token}@${auth.url}/${repo}`
}
