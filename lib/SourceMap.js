module.exports = function(setup) {
  const map = src => ({
    src: `${setup}/${src}`,
    dest: src.split('/').slice(0, (/\/$/.test(src)) ? -2 : -1).join('/')
  })

  return map
}
