import { Router } from 'express'
import { protect, isLoggedIn } from '../controllers/authController'
import {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  getMyTours
} from '../controllers/viewsController'
import { createBookingCheckout } from '../controllers/bookingController'

const router = Router()

// TODO: temporary:
router.get('/', createBookingCheckout, isLoggedIn, getOverview)
router.get('/tour/:slug', isLoggedIn, getTour)
router.get('/login', isLoggedIn, getLoginForm)
router.get('/me', protect, getAccount)
router.get('/my-tours', protect, getMyTours)

export default router
