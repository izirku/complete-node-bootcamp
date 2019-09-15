import { RequestHandler } from 'express'
import {
  deleteOne,
  updateOne,
  retrieveOne,
  retrieveAll
} from './handlerFactory'
import User from '../models/userModel'
import catchAsync from '../utils/catchAsync'
import appError from '../utils/appError'
import { AppRequest } from '../interfaces'

const filterObj = (obj: any, ...rest): any => {
  const newObj = {}
  Object.keys(obj).forEach(k => {
    if (rest.includes(k)) newObj[k] = obj[k]
  })
  return newObj
}

export const getMe: RequestHandler = (req: AppRequest, _res, next) => {
  req.params.id = req.user.id
  next()
}

export const updateMe: RequestHandler = catchAsync(
  async (req: AppRequest, res, next) => {
    // 1) err if user POSTs password data
    if (req.body.password || req.body.passwordConfirm)
      return next(new appError('permission denied', 400))

    // 2) filter out all but allowed fields
    const filteredBody = filterObj(req.body, 'name', 'email')

    // 3) update user document
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      filteredBody,
      {
        new: true,
        runValidators: true
      }
    )

    // 4) send response
    res.status(200).json({
      status: 'success',
      data: {
        updatedUser
      }
    })
  }
)

export const deleteMe: RequestHandler = catchAsync(
  async (req: AppRequest, res, _next) => {
    await User.findByIdAndUpdate(req.user._id, { active: false })

    res.status(204).json({
      status: 'success',
      data: null
    })
  }
)

export const createUser: RequestHandler = (_req, res, _next): void => {
  res.status(500).json({
    status: 'error',
    message: 'please use users/signup route instead'
  })
}

export const getAllUsers = retrieveAll(User)
export const getUser = retrieveOne(User)
export const updateUser = updateOne(User) // not to be used with password update
export const deleteUser = deleteOne(User)
