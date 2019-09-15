import { Router } from 'express'
import {
  getMonthlyPlan,
  getTourStats,
  aliasTopTours,
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  getToursWithin,
  getDistances
} from '../controllers/tourController'
import { protect, restrictTo } from '../controllers/authController'
import reviewRouter from '../routes/reviewRoutes'

// import logger from '../logger';

const router = Router()

// handle tour/reviews routes
router.use('/:tourId/reviews', reviewRouter)

// router.param('id', (req, res, next, val) => {
//   logger.info(`tour id is: ${val}`);
//   next();
// });

// router.param('id', checkID)

router.route('/top-5-tours').get(aliasTopTours, getAllTours)
router.route('/stats').get(getTourStats)

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin)
// could do like this: tours-within?distance=233&center=-40,45&unit=mi
// this looks cleaner: tours-within/233/center/-40,45/unit/mi

router.route('/distances/:latlng/unit/:unit').get(getDistances)

router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan)

router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour)

router
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour)

export default router
