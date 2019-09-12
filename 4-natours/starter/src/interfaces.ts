import { Request } from 'express'
import { Document } from 'mongoose'

export interface UserDocument extends Document {
  name: string
  photo: string
  email: string
  role: string
  password: string
  passwordConfirm: string
  passwordResetToken: string
  passwordResetExpires: number
  correctPassword: (s: string, hash: string) => boolean
  changedPasswordAfter: (JWTTimeStamp: number) => boolean
  createPasswordResetToken: () => string
}

export interface AppRequest extends Request {
  user?: UserDocument
}

export interface AppMailOptions {
  email: string
  subject: string
  message: string
}
// export default interface ToursSimple {
//   id: number
//   name: string
//   duration: number
//   maxGroupSize: number
//   difficulty: string
//   ratingsAverage: number
//   ratingsQuantity: number
//   price: number
//   summary: string
//   description: string
//   imageCover: string
//   images: string[]
//   startDates: string[]
// }
