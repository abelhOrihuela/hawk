const traverse = require('traverse')
const fs = require('fs')

function tvs (obj) {
  if (!(obj instanceof Object)) {
    return obj
  }

  return traverse(obj).map(function (x) {
    // eslint-disable-line array-callback-return
    if (this.key && this.key !== this.key.replace(/\./g, '')) {
      const key = this.key

      this.key = this.key.replace(/\./g, '')
      this.update(x)

      this.key = key
      this.delete()
    }
  })
}

function mkdirSync(dirPath) {
  try {
    fs.mkdirSync(dirPath)
  } catch (err) {
    if (err.code !== 'EEXIST') throw err
  }
}


var filterInt = function (value) {
  if (/^(\-|\+)?([0-9]+|Infinity)$/.test(value)) { return Number(value) }
  return NaN
}

module.exports = {
  filterInt,
  mkdirSync,
  tvs
}
