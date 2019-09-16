import { RequestHandler } from 'express'
import Tour from '../models/tourModel'
import User from '../models/userModel'
import catchAsync from '../utils/catchAsync'
import appError from '../utils/appError'
import { AppRequest } from '../interfaces'

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

// export const getAccount: RequestHandler = catchAsync(
export const getAccount: RequestHandler = (_req, res) => {
  // res.locals.user = req.user // was placed in 'protect' middleware....
  res.status(200).render('account', { title: 'Your account' })
}

// requires express.urlencoded middleware
// export const updateUserData: RequestHandler = catchAsync(
//   async (req: AppRequest, res, next) => {
//     const updatedUser = await User.findByIdAndUpdate(
//       req.user.id,
//       {
//         name: req.body.name,
//         email: req.body.email
//       },
//       { new: true, runValidators: true }
//     )

//     res.status(200).json({ status: 'success' })
//     // .render('account', { title: 'Your account', user: updatedUser })
//   }
// )
