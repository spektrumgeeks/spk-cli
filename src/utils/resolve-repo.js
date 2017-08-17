import config from '../config'

export default ({ provider, repo }, url, auth) => {
  auth = auth || config.store.tokens[provider]
  repo = repo.replace(/\.git$/, '')

  return (url) ? `https://${auth.url}/${repo}`
    : (!auth.token) ? `git@${auth.url}:${repo}.git`
    : `https://${auth.user}:${auth.token}@${auth.url}/${repo}.git`
}
