const assert = require('assert')
const path = require('path')
const pump = require('pump')
const from = require('random-access-storage-from')
const ram = require('random-access-memory')
const get = require('get-uri')
const url = require('url')
const fs = require('fs')

function file(pathspec, opts, callback) {
  if ('function' === typeof opts) {
    callback = opts
    opts = {}
  }

  opts = Object.assign({}, opts, {
    indexing: true
  })

  let defaultStorage = opts.storage || ram
  let { hypercore } = opts
  let feed = null

  delete opts.hypercore

  if ('function' !== typeof callback) {
    callback = (err) => {
      if (!feed) { throw err }
      else { feed.emit('error', err) }
    }
  }

  // istanbul ignore next
  if ('function' !== typeof hypercore) {
    hypercore = require('hypercore')
  }

  try {
    assert('function' === typeof hypercore)
    assert(pathspec && 'string' === typeof pathspec)
  } catch (err) {
    return callback(err)
  }

  try {
    if (!url.parse(pathspec).protocol) {
      fs.accessSync(pathspec)
      pathspec = `file://${path.resolve(pathspec)}`
    }
  } catch (err) {
    return callback(err)
  }

  const { protocol } = url.parse(pathspec)

  feed = opts.feed || hypercore(createStorage(pathspec, defaultStorage), opts)

  feed.ready(() => {
    if (!feed.writable) {
      return callback(new Error('Feed is not writable.'))
    }

    get(pathspec, opts, (err, stream) => {
      if (err) {
        return callback(err)
      }

      pump(stream, feed.createWriteStream(), callback)
    })
  })

  return feed
}

function createStorage(pathspec, defaultStorage) {
  return (filename) => {
    if (filename.endsWith('data')) {
      return from(pathspec)
    } else {
      return defaultStorage(filename)
    }
  }
}

module.exports = file
