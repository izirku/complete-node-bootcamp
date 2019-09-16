import { Router } from 'express'
import {
  getOverview,
  getTour,
  getLoginForm,
  getAccount
} from '../controllers/viewsController'
import { protect, isLoggedIn } from '../controllers/authController'

const router = Router()

router.get('/me', protect, getAccount)

router.use(isLoggedIn)

router.get('/', getOverview)
router.get('/tour/:slug', getTour)
router.get('/login', getLoginForm)

export default router
