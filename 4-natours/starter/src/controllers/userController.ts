import { Request, Response, NextFunction } from 'express'
import User from '../models/userModel'
import catchAsync from '../utils/catchAsync'

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
