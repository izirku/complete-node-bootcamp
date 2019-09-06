import fs = require('fs');
import http = require('http');

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

// *****************************************************************************
// SERVER

http.createServer((req, res) => {
  console.log(req);
  res.end('hello from the server!');
});
