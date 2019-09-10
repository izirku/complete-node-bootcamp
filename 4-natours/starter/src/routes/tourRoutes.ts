import express = require('express')
// import logger from '../logger';
import {
  aliasTopTours,
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

// aliasing "5 top tours" by pre-filling query parameters via middleware:
router.route('/top-5-tours').get(aliasTopTours, getAllTours)

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
