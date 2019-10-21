hypercore-indexed-file
======================

> Address a local file or HTTP resource as an indexed
> [Hypercore][hypercore] feed.

## Installation

```sh
$ npm install hypercore-indexed-file
```

## Usage

```js
const feed = file(pathspec, (err) => {
  // file at `pathspec` has been indexed
  // bitfield, tree, and signatures generated
})
```

## API

### `feed = file(pathspec[, opts[, callback]])`

Creates a [Hypercore][hypercore] feed with `indexing` set to `true` that uses
[random-access-storage-from][random-access-storage-from] to derive the
**data** storage for the created feed from the given `pathspec` string.
When the feed is ready, it will index the file specified at `pathspec`
by streaming the chunks through the feed, generating the **bitfield**,
**merkle tree**, and **signatures**.

```js
const feed = file('https://example.com/example.txt', (err) => {
  feed.createReadStream().pipe(process.stdout)
  feed.audit(console.log) // should show `0` invalid nodes
})
```

## License

MIT


[hypercore]: https://github.com/mafintosh/hypercore
[random-access-storage-from]: https://github.com/little-core-labs/random-access-storage-from
