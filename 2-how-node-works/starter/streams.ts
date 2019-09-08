import fs = require('fs')
import http = require('http')

const server = http.createServer()
server.on('request', (req, res) => {
  // solution 1
  // fs.readFile('test-file.txt', 'utf-8', (err, data) => {
  //   if (err) return console.error(err)
  //   res.end(data)
  // })

  // solution 2: streams
  // problem: backpressure -- reading file is much faster than
  // response stream can handle
  // const readable = fs.createReadStream('test-data.txt')
  // readable.on('data', chunk => {
  //   res.write(chunk) // stream data
  // })
  // readable.on('end', () => {
  //   res.end() // signal that we are done streaming
  // })
  // readable.on('error', err => {
  //   console.error(err)
  //   // res.writeHeader(404)
  //   res.statusCode = 404
  //   res.end('file not found')
  // })

  // solution 3: stream pipe
  // note: pipe() solves the backpressure problem
  const readable = fs.createReadStream('test-data.txt')
  readable.pipe(res) // readable.pipe -> writable
  readable.on('error', err => {
    console.error(err)
    // res.writeHeader(404)
    res.statusCode = 404
    res.end('file not found')
  })
})

server.listen(8000, '127.0.0.1', () => {
  console.log('waiting for requests...')
})
