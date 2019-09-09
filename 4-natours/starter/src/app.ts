import express = require('express');
import logger from './logger';
import userRouter from './routes/userRoutes';
import tourRouter from './routes/tourRoutes';

export const app = express();

// *****************************************************************************
// MIDDLEWARES

app.use(express.json());
// app.use(express.static(`${__dirname}/../public`));

// created middleware attached after a rounte, won't affected prior routes
app.use((req, _res, next) => {
  logger.info(`${req.protocol} ${req.method} ${req.url}`);
  next();
});

// *****************************************************************************
// ROUTES

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// *****************************************************************************
// JUNK

// TODO: make it work with TypeScript
// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString()
//   next()
// })

// app
//   .route('/api/v1/tours')
//   .get(getAllTours)
//   .post(createTour);

// app
//   .route('/api/v1/tours/:id')
//   .get(getTour)
//   .patch(updateTour)
//   .delete(deleteTour);

// app
//   .route('/api/v1/users')
//   .get(getAllUsers)
//   .post(createUser);
// app
//   .route('/api/v1/users/:id')
//   .get(getUser)
//   .patch(updateUser)
//   .delete(deleteUser);

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);
