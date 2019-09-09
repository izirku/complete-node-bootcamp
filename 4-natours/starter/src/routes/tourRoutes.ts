import express = require('express')
// import logger from '../logger';
import {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour
} from '../controllers/tourController'

const router = express.Router()

// router.param('id', (req, res, next, val) => {
//   logger.info(`tour id is: ${val}`);
//   next();
// });

// router.param('id', checkID)

router
  .route('/')
  .get(getAllTours)
  .post(createTour)

router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour)

export default router
