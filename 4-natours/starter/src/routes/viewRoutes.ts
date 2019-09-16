import { Router } from 'express'
import {
  getOverview,
  getTour,
  getLoginForm
} from '../controllers/viewsController'
import { protect, isLoggedIn } from '../controllers/authController'

const router = Router()

router.use(isLoggedIn)

router.get('/', getOverview)
router.get('/tour/:slug', getTour)
router.get('/login', getLoginForm)

export default router
