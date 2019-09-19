import { Router } from 'express'
import {
  getCheckoutSession,
  createBooking,
  getBooking,
  getAllBookings,
  updateBooking,
  deleteBooking
} from '../controllers/bookingController'
import { protect, restrictTo } from '../controllers/authController'

const router = Router()

// *****************************************************************************
// PROTECTED RESOURCES
router.use(protect)

router.get('/checkout-session/:tourId', getCheckoutSession)

// *****************************************************************************
// RESTRICTED RESOURCES
router.use(restrictTo('admin', 'lead-guide'))
router
  .route('/')
  .get(getAllBookings)
  .post(createBooking)
router
  .route('/:id')
  .get(getBooking)
  .patch(updateBooking)
  .delete(deleteBooking)

export default router
