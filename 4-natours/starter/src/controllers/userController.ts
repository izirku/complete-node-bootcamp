import { RequestHandler } from 'express'
import multer = require('multer')
import sharp = require('sharp')
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

// *****************************************************************************
// UPLOAD A PHOTO MIDDLEWARE

// simple:
// const upload = multer({ dest: 'public/img/users' })
// disk storage... we not using it as we need to process image in mem first
// const multerStorage = multer.diskStorage({
//   destination: (_req, _file, cb) => {
//     cb(null, 'public/img/users')
//   },
//   filename: (req: AppRequest, file, cb) => {
//     // user-user_id-timestamp.ext
//     const ext = file.mimetype.split('/')[1]
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//   }
// })
const multerStorage = multer.memoryStorage()

const multerFilter = (_req, file, cb): void => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true)
  } else {
    cb(new appError('Not an image. please upload only images', 400), false)
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
})

export const uploadUserPhoto = upload.single('photo')

export const resizeUserPhoto: RequestHandler = catchAsync(
  async (req: AppRequest, _res, next) => {
    if (!req.file) return next()

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 75 })
      .toFile(`public/img/users/${req.file.filename}`)
    next()
  }
)

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

    // if there was a photo uploaded, update user's photo property in DB:
    if (req.file) filteredBody.photo = req.file.filename

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
