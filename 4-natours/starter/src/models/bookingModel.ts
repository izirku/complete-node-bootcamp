import { Schema, model, SchemaTypes } from 'mongoose'
// import slugify from 'slugify'
// import validator from 'validator'
// import logger from '../logger'
// import { TourDocument, TourModel, TourQuery } from '../interfaces'
import { BookingDocument, BookingModel } from '../interfaces'

const bookingSchema = new Schema({
  price: {
    type: Number,
    required: [true, 'booking must have a price']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  paid: {
    type: Boolean,
    default: true
  },
  // parent referencing:
  user: {
    type: SchemaTypes.ObjectId,
    ref: 'User',
    required: [true, 'booking must have an customer']
  },
  tour: {
    type: SchemaTypes.ObjectId,
    ref: 'Tour',
    required: [true, 'booking must belong to a tour']
  }
})

// FIXME: populate path `tour` selects more than just the name
// modifynig mongoose midleware on Tour schema should fix it by
// not automatically populating the guides maybe?
bookingSchema.pre('find', function(next) {
  // .this is query
  // this.populate({
  //   path: 'user',
  //   select: 'email'
  // })
  this.populate('user').populate({ path: 'tour', select: 'name' })
  next()
})

bookingSchema.pre('findOne', function(next) {
  // .this is query
  // this.populate({
  //   path: 'user',
  //   select: 'email'
  // })
  this.populate('user').populate({ path: 'tour', select: 'name' })
  next()
})

const BookingModel: BookingModel = model('Booking', bookingSchema)

export default BookingModel
