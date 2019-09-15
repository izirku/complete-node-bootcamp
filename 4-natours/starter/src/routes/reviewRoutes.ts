import { Router } from 'express'
import {
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  setTourUserIds
} from '../controllers/reviewController'
import { protect, restrictTo } from '../controllers/authController'

const router = Router({ mergeParams: true })

// *****************************************************************************
// PROTECTED RESOURCES
router.use(protect)

router
  .route('/')
  .get(getAllReviews)
  .post(restrictTo('user'), setTourUserIds, createReview)

router
  .route('/:id')
  .get(getReview)
  .patch(restrictTo('user', 'admin'), updateReview)
  .delete(restrictTo('user', 'admin'), deleteReview)

export default router
