import { RequestHandler, Request, Response, NextFunction } from 'express'
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
    // const updatedUser =
    await User.findByIdAndUpdate(req.user._id, { active: false })
    // filteredBody,
    // {
    //   new: true,
    //   runValidators: true
    // }

    // 4) send response
    res.status(204).json({
      status: 'success',
      data: null
    })
  }
)

export const getAllUsers = catchAsync(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const users = await User.find()
    res.status(200).json({
      status: 'success',
      data: {
        users
      }
    })
  }
)

export const createUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(500).json({
    status: 'error',
    message: 'not implemented'
  })
}

export const getUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(500).json({
    status: 'error',
    message: 'not implemented'
  })
}

export const updateUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(500).json({
    status: 'error',
    message: 'not implemented'
  })
}

export const deleteUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(500).json({
    status: 'error',
    message: 'not implemented'
  })
}
