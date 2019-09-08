import fs = require('fs')
import path = require('path')
import http = require('http')
import url = require('url')
import { ProductData } from './src/productDataInterface'
import { PRODUCT_CARDS } from './src/constants'
import { rxSub, compileTemplate } from './src/compileTemplate'

// *****************************************************************************
// DATA

const data = fs.readFileSync(
  path.resolve(__dirname, 'dev-data/data.json'),
  'utf-8'
)

const dataObj: ProductData[] = JSON.parse(data)
const tmplOverview = fs.readFileSync(
  path.resolve(__dirname, 'templates/overview.html'),
  'utf-8'
)

const tmplCard = fs.readFileSync(
  path.resolve(__dirname, 'templates/card.html'),
  'utf-8'
)

const tmplProduct = fs.readFileSync(
  path.resolve(__dirname, 'templates/product.html'),
  'utf-8'
)

// *****************************************************************************
// SERVER

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true)
  console.log('[req path]', pathname)

  switch (pathname) {
    case '/':
    case '/overview':
      const cardsHTML = dataObj.map(el => compileTemplate(tmplCard, el))
      res.writeHead(200, { 'Content-type': 'text/html' })
      res.end(tmplOverview.replace(rxSub(PRODUCT_CARDS), cardsHTML.join('')))
      break
    case '/product':
      console.log('[req query]', query)

      if (query && query.id) {
        const product = dataObj.find(
          el => el.id === parseInt(query.id as string, 10)
        )
        if (product) {
          const productHTML = compileTemplate(tmplProduct, product)
          res.writeHead(200, { 'Content-type': 'text/html' })
          res.end(productHTML)
        } else {
          res.writeHead(404, { 'Content-type': 'text/html' })
          res.end('<h1>page not found</h1>')
        }
      } else {
        res.writeHead(500)
        res.end('internal server error 3')
      }
      break
    case '/api':
      res.writeHead(200, { 'Content-type': 'application/json' })
      res.end(data)
      break
    default:
      res.writeHead(404, { 'Content-type': 'text/html' })
      res.end('<h1>page not found</h1>')
      break
  }
})

server.listen(8000, '127.0.0.1', () => {
  console.log('listening on 8000...')
})

// *****************************************************************************
// FILES

// SYNC
// const textIn: string = fs.readFileSync('./txt/input.txt', 'utf-8');
// console.log(textIn);

// const textOut: string = `this is what we know about the avocado: ${textIn}\nCreated on ${Date.now()}`;
// fs.writeFileSync('./txt/output.txt', textOut);

// ASYNC
// fs.readFile('./txt/start.txt', 'utf-8', (err, data) => {
//   if (err) return console.error('[error]', err);

//   fs.readFile(`./txt/${data}.txt`, 'utf-8', (err, data2) => {
//     if (err) return console.error('[error]', err);

//     fs.readFile(`./txt/append.txt`, 'utf-8', (err, data3) => {
//       if (err) return console.error('[error]', err);

//       fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, 'utf-8', err => {
//         if (err) return console.error('[error]', err);

//         console.log('all good! 🤪');
//       });
//     });
//   });
// });
