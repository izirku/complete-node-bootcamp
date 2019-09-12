// import {promisify } = require('util')
import { promisify } from 'util'
import { Request, Response, NextFunction, RequestHandler } from 'express'
import jwt = require('jsonwebtoken')
import User from '../models/userModel'
import catchAsync from '../utils/catchAsync'
import AppError from '../utils/appError'
import { AppRequest } from '../interfaces'
import sendEmail from '../utils/email'
// import logger from '../logger'

const signToken = (id: string): string =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })

// to quickly generate 128 characters wide JWT secret use:
// node -e "console.log(require('crypto').randomBytes(64).toString('hex'));"
export const signup = catchAsync(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // INSECURE, vulnerable to injection of role: admin and such:
    // const newUser = await User.create(req.body)

    // SECURE: not vulnerable to injection:
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      passwordChangedAt: Date.now() - 5000
    })

    const token = signToken(newUser._id)

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser
      }
    })
  }
)

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body

    // 1) check if email & password exist
    if (!email || !password)
      return next(new AppError('email and password are required', 400))

    // 2) check if email & password are correct
    //    here, '+password' explicitly requires password being returned
    const user = await User.findOne({ email }).select('+password')

    // TODO: user and user+password check should take same time to deny time analisys
    if (!user || !(await user.correctPassword(password, user.password)))
      return next(new AppError('incorrect email or password', 401))

    // 3) if all good, return jwt
    const token = signToken(user._id)
    res.status(200).json({
      status: 'success',
      token
    })
  }
)

export const protect = catchAsync(
  async (req: AppRequest, res: Response, next: NextFunction): Promise<void> => {
    // 1) get token if it's there
    let token: string
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) return next(new AppError('not authorized', 401))

    // 2) verify token
    const decoded: any = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    )

    // 3) if token verified, check if user still exists
    const currentUser = await User.findById(decoded.id)
    if (!currentUser) return next(new AppError('not authorized', 401))

    // 4) check if user changed password after token was issued
    //    (if someone stole login creds and actual user changes password to
    //     protect against this situtation)
    if (currentUser.changedPasswordAfter(decoded.iat))
      return next(new AppError('not authorized', 401))

    req.user = currentUser
    next()
  }
)

export const restrictTo = (...roles: string[]): RequestHandler => (
  req: AppRequest,
  _res: Response,
  next: NextFunction
): void => {
  if (!roles.includes(req.user.role))
    return next(new AppError('permission denied', 403))
  next()
}

// async version, but not needed in reality...
// export const restrictTo = (...roles: string[]): RequestHandler =>
//   catchAsync(
//     async (
//       req: AppRequest,
//       res: Response,
//       next: NextFunction
//     ): Promise<void> => {
//       if (!roles.includes(req.user.role))
//         return next(new AppError('permission denied', 403))
//       next()
//     }
//   )

// export const restrictTo = (...rest) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     // roles is an array
//   }
// }

// catchAsync(
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {}
// )

export const forgotPassword: RequestHandler = catchAsync(
  async (req, res, next) => {
    // 1) get user based on posted email
    const user = await User.findOne({ email: req.body.email })
    if (!user) return next(new AppError('permission denied', 403))

    // 2) generate random token
    const resetToken = user.createPasswordResetToken()

    // save without validation to bypass "password" required
    await user.save({ validateBeforeSave: false })

    // 3) send it back as an email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`

    const message = `
Forgot your password? Submit a PATCH request with your new password and passwordConfirm to:
    
  ${resetURL}

If you didn't forget your password, please ignore this email!`

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 minutes)',
        message
      })
    } catch (err) {
      user.passwordResetToken = undefined
      user.passwordResetExpires = undefined
      await user.save({ validateBeforeSave: false })

      return next(
        new AppError(
          'Could not sending email at this time. Please try later',
          500
        )
      )
    }

    res.status(200).json({
      status: 'success',
      message: 'token sent to email!'
    })
  }
)

export const resetPassword: RequestHandler = (req, res, next) => {
  // 1) get user based on the token
  // 2) if token has not expired, and there is user, set the new password
  // 3) update password & changedPasswordAt property for the user
  // 4) log the user in, send JWT
}
