import { RequestHandler } from 'express'
import Tour from '../models/tourModel'
import catchAsync from '../utils/catchAsync'
import appError from '../utils/appError'

export const getOverview: RequestHandler = catchAsync(
  async (req, res, _next) => {
    // 1) get tour data from collection
    const tours = await Tour.find()

    // 2) build template
    // 3) render the template with data from step 1
    res.status(200).render('overview', {
      title: 'All Tours',
      tours
    })
  }
)

export const getTour: RequestHandler = catchAsync(async (req, res, next) => {
  // 1) get tour data with reviews and guides
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  })

  if (!tour) return next(new appError('tour not found', 404))

  res.status(200).render('tour', { title: `${tour.name} Tour`, tour })
})

// export const getLoginForm: RequestHandler = catchAsync(
//   async (req, res, _next) => {
//     res.status(200).render('login')
//   }
// )

export const getLoginForm: RequestHandler = (_req, res) => {
  res.status(200).render('login', { title: 'Log into your account' })
}
