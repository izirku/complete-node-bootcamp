import { Request } from 'express'
import { Document, Model, Types, Query } from 'mongoose'

export type AppDocuments = UserDocument | ReviewDocument | TourDocument

export interface BookingDocument extends Document {}
export interface UserDocument extends Document {
  name: string
  photo: string
  email: string
  role: string
  password: string
  passwordConfirm: string
  passwordChangedAt: number
  passwordResetToken: string
  passwordResetExpires: number
  active: boolean
  correctPassword: (s: string, hash: string) => boolean
  changedPasswordAfter: (JWTTimeStamp: number) => boolean
  createPasswordResetToken: () => string
}

export interface ReviewDocument extends Document {
  review: string
  rating: number
  createdAt: number
  user: { type: Types.ObjectId; ref: string }
  tour: { type: Types.ObjectId; ref: string }
}

export interface TourDocument extends Document {
  name: string
  slug: string
  duration: number
  maxGroupSize: string
  difficulty: string
  ratingsAverage: number
  ratingsQuantity: number
  price: number
  priceDiscount: number
  summary: string
  description: string
  imageCover: string
  images: string[]
  createdAt: number
  startDates: number[]
  secretTour: boolean
  startLocation: {
    type: string
    coordinates: number[]
    address: string
    description: string
    locations: [
      {
        type: string
        coordinates: number[]
        address: string
        description: string
        day: number
      }
    ]
    guides: [{ type: Types.ObjectId; ref: string }]
    // guides: [{ type: mongoose.Types.ObjectId }]
    // guides: [{ type: ObjectD }]
    start: number
  }
}

export type UserModel = Model<UserDocument>
export type ReviewModel = Model<ReviewDocument>
export type TourModel = Model<TourDocument>
export type BookingModel = Model<BookingDocument>

export interface ReviewQuery extends Query<ReviewDocument> {
  r?: ReviewDocument
}

export interface TourQuery extends Query<TourDocument> {
  start?: number
}

export interface AppRequest extends Request {
  user?: UserDocument
  // file?: any // is provided by Multer
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
