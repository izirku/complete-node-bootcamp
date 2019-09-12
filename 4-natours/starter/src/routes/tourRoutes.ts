import { Router } from 'express'
import {
  getMonthlyPlan,
  getTourStats,
  aliasTopTours,
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour
} from '../controllers/tourController'
import { protect, restrictTo } from '../controllers/authController'
// import logger from '../logger';

const router = Router()

// router.param('id', (req, res, next, val) => {
//   logger.info(`tour id is: ${val}`);
//   next();
// });

// router.param('id', checkID)

router.route('/top-5-tours').get(aliasTopTours, getAllTours)
router.route('/stats').get(getTourStats)
router.route('/monthly-plan/:year').get(getMonthlyPlan)

router
  .route('/')
  .get(protect, getAllTours)
  .post(createTour)

router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour)

export default router
