import { Request, Response, NextFunction } from 'express'
import User from '../models/userModel'
import catchAsync from '../utils/catchAsync'

export const signup = catchAsync(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const newUser = await User.create(req.body)
    res.status(201).json({
      status: 'success',
      data: {
        user: newUser
      }
    })
  }
)
