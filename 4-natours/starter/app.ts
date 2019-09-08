import fs = require('fs');
import path = require('path');
import express = require('express');

import { ToursSimple } from './src/ifToursSimple';

const port = 3000;
const app = express();
app.use(express.json());

const tours: ToursSimple[] = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, 'dev-data/data/tours-simple.json'),
    'utf-8'
  )
);
// app.get('/', (req, res) => {
//   // res.status(200).send('hello from express!');
//   res.status(200).json({ message: 'hello from express!', app: 'Natours' });
// });

app.get('/api/v1/tours', (_req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });
});

app.post('/api/v1/tours', (req, res) => {});

app.listen(port, () => {
  console.log(`listening on port ${port}...`);
});
