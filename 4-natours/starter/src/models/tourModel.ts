import mongoose = require('mongoose')

const toursSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'a tour must have a name'],
    unique: true
  },
  rating: {
    type: Number,
    default: 4.5
  },
  price: { type: Number, required: [true, 'a tour must have a price'] }
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
