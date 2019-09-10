import mongoose = require('mongoose')

const toursSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'a tour must have a name'],
    unique: true,
    trim: true
  },
  duration: {
    type: Number,
    required: [true, 'a tour must have a duration']
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'a tour must have a group size']
  },
  difficulty: {
    type: String,
    required: [true, 'a tour must have a difficulty']
  },
  ratingsAverage: {
    type: Number,
    default: 4.5
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: { type: Number, required: [true, 'a tour must have a price'] },
  priceDiscount: Number,
  summary: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'a tour must have a description'],
    trim: true
  },
  imageCover: {
    type: String, // name of the image
    required: [true, 'a tour must have a cover image']
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false // do not project, ever
  },
  startDates: [Date]
})

export default mongoose.model('Tour', toursSchema)

// const testTour = new Tour({
//   name: 'The Forest Hiker',
//   rating: 4.7,
//   price: 497
// })

// testTour
//   .save()
//   .then(doc => {
//     logger.info(doc)
//   })
//   .catch(err => {
//     logger.error(err)
//   })
