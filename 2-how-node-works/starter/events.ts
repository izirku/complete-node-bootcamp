import { EventEmitter } from 'events'
import http = require('http')

class Sales extends EventEmitter {
  constructor() {
    super()
  }
}

// const myEmitter = new EventEmitter()
const myEmitter = new Sales()

myEmitter.on('newSale', () => {
  console.log('There was a new sale')
})

myEmitter.on('newSale', () => {
  console.log('There was a new sale again')
})

myEmitter.on('newSale', stock => {
  console.log('There was a new sale, stock left:', stock)
})

myEmitter.emit('newSale', 9)

// *****************************************************************************
// ANOTHER EXAMPL

const server = http.createServer()

server.on('request', (req, res) => {
  console.log('request received 1')
  res.end('request received 1')
})

server.on('request', (req, res) => {
  console.log('request received 2')
  res.end('request received 2')
})

server.on('close', () => {
  console.log('server closed')
})

server.listen(8000, '127.0.0.1', () => {
  console.log('waiting for requests')
})
