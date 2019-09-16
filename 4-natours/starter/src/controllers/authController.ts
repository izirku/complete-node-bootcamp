import crypto = require('crypto')
import { promisify } from 'util'
import {
  Request,
  Response,
  NextFunction,
  RequestHandler,
  CookieOptions
} from 'express'
import jwt = require('jsonwebtoken')
import User from '../models/userModel'
import catchAsync from '../utils/catchAsync'
import AppError from '../utils/appError'
import { AppRequest, UserDocument } from '../interfaces'
import sendEmail from '../utils/email'
// import logger from '../logger'

const signToken = (id: string): string =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })

const createSendToken = (
  user: UserDocument,
  statusCode: number,
  res: Response
): void => {
  const token = signToken(user._id)

  const cookieOptions: CookieOptions = {
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  }
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true

  res.cookie('jwt', token, cookieOptions)
  user.password = undefined

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  })
}

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

    createSendToken(newUser, 201, res)
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
    createSendToken(user, 200, res)
  }
)

export const logout: RequestHandler = (_req, res) => {
  res.cookie('jwt', 'expire jwt', { maxAge: 10000, httpOnly: true })
  res.status(200).json({ status: 'success' })
}

export const protect = catchAsync(
  async (req: AppRequest, res: Response, next: NextFunction): Promise<void> => {
    // 1) get token if it's there
    let token: string
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1]
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt
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

// only for rendered pages, no errors!
export const isLoggedIn = async (
  req: AppRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (req.cookies.jwt) {
    try {
      // verify token
      const decoded: any = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      )

      // if token verified, check if user still exists
      const currentUser = await User.findById(decoded.id)
      if (!currentUser) return next()

      // check if user changed password after token was issued
      // (if someone stole login creds and actual user changes password to
      // protect against this situtation)
      if (currentUser.changedPasswordAfter(decoded.iat)) return next()

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser
      return next()
    } catch (err) {
      return next()
    }
  }
  next()
}

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

export const resetPassword: RequestHandler = catchAsync(
  async (req, res, next) => {
    // 1) get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex')

    // 2) if token has not expired, and there is user, set the new password
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    })
    if (!user)
      return next(new AppError('invalid or expired password reset token', 400))

    // 3) update password & changedPasswordAt property for the user
    user.password = req.body.password
    user.passwordConfirm = req.body.password
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    // 4) log the user in, send JWT
    createSendToken(user, 200, res)
  }
)

export const updatePassword: RequestHandler = catchAsync(
  async (
    req: AppRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    // 1) get user
    // can't simply get user from what 'protect' middleware got, as password
    // is not on there...
    // const user = req.user
    const user = await User.findById(req.user._id).select('+password')

    // 2) check if current password is correct
    // taken care by middleware, not really, we still have to check actual
    // password in request...
    if (
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
      return _next(new AppError('not authorized', 401))
    }

    // 3) update password
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    await user.save()

    // 4) log user in with new password
    createSendToken(user, 200, res)
  }
)
