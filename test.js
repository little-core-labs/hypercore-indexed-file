const hypercore = require('hypercore')
const collect = require('collect-stream')
const fetch = require('node-fetch')
const serve = require('serve-handler')
const http = require('http')
const test = require('tape')
const pump = require('pump')
const ram = require('random-access-memory')
const raf = require('random-access-file')
const fs = require('fs')

const file = require('./')

test('file(pathspec, opts, callback) - local file', (t) => {
  const expected = fs.readFileSync(__filename)
  const core = file(__filename, (err) => {
    t.notOk(err)
    collect(core.createReadStream(), (err, buf) => {
      t.notOk(err)
      t.ok(0 === Buffer.compare(buf, expected))
      t.end()
    })
  })
})

test('file(pathspec, opts, callback) - http file', (t) => {
  const server = http.createServer((req, res) => {
    serve(req, res)
  })

  server.listen(0, (err) => {
    t.notOk(err)

    const uri = `http://localhost:${server.address().port}/test.js`
    const core = file(uri, (err) => {
      t.notOk(err)
      collect(core.createReadStream(), (err, buf) => {
        t.notOk(err)
        fetch(uri)
          .then((res) => res.text())
          .then((expected) => {
            t.ok(0 === Buffer.compare(buf, Buffer.from(expected)))
            t.end()
            server.close()
          })
      })
    })
  })
})

test('file(pathspec, opts, callback) - failures', (t) => {
  t.throws(() => file())
  t.throws(() => file(null))
  t.throws(() => file(''))
  t.throws(() => file('file'))
  const h = hypercore(ram)
  h.ready(() => {
    const feed = hypercore(ram, h.key)
    file(__filename, { feed }, (err) => {
      t.ok(err)
      file(__filename, { feed })
      feed.once('error', (err) => {
        t.ok(err)
        file('http://localhost/file.txt', (err) => {
          t.ok(err)
          t.end()
        })
      })
    })
  })
})
