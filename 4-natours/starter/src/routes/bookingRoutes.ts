import { Router } from 'express'
import { getCheckoutSession } from '../controllers/bookingController'
import { protect, restrictTo } from '../controllers/authController'

const router = Router()

// *****************************************************************************
// PROTECTED RESOURCES
router.use(protect)

router.get('/checkout-session/:tourId', getCheckoutSession)

export default router
