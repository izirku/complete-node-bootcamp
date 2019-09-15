import { Schema, model, SchemaTypes, Types } from 'mongoose'
import { ReviewModel, ReviewQuery, ReviewDocument } from '../interfaces'
import Tourl from './tourModel'

const reviewSchema = new Schema(
  {
    review: {
      type: String,
      required: [true, 'review cannot be empty']
    },
    rating: {
      type: Number,
      min: [1, 'rating must be in range 1-5'],
      max: [5, 'rating must be in range 1-5']
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    user: {
      type: SchemaTypes.ObjectId,
      ref: 'User',
      required: [true, 'review must have an author']
    },
    tour: {
      type: SchemaTypes.ObjectId,
      ref: 'Tour',
      required: [true, 'review must belong to a tour']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// each user can only write one review per tour:
reviewSchema.index({ tour: 1, user: 1 }, { unique: true })

reviewSchema.statics.calcAverageRatings = async function(
  this: ReviewModel,
  tourId: Types.ObjectId
): Promise<void> {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour', // group reviews by tour
        nRating: { $sum: 1 }, // add number of ratings into nRatings virtual
        avgRating: { $avg: '$rating' }
      }
    }
  ])

  if (stats.length > 0) {
    await Tourl.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    })
  } else {
    await Tourl.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    })
  }
}

reviewSchema.post('save', function() {
  // .this - current ReviewDocument
  // this.constructor - is what model gets when created later from Schema
  // so, an attached method on it will then be available later for use?:
  this.constructor.calcAverageRatings(this.tour)
})

reviewSchema.pre('findOneAndUpdate', async function(this: ReviewQuery, next) {
  // .this is query
  // we have to get ReviewDocument here so we can save it on ReviewQuery
  // in order to be able to use it in 'post' middleware:
  this.r = await this.findOne()
  next()
})

reviewSchema.post('findOneAndUpdate', async function() {
  // .this is query
  // this.r = await this.findOne() // does not work, query has already executed
  // but, since we already saved a reference to ReviewDocument we can calculate
  // and update tour rating/avg via static method:
  await this.r.constructor.calcAverageRatings(this.r.tour)
})

reviewSchema.pre('findOneAndRemove', async function(this: ReviewQuery, next) {
  // .this is query
  this.r = await this.findOne()
  next()
})

reviewSchema.post('findOneAndRemove', async function() {
  // .this is query
  // this.r = await this.findOne() // does not work, query has already executed
  await this.r.constructor.calcAverageRatings(this.r.tour)
})

reviewSchema.pre('find', function(next) {
  // .this is query
  this.populate({
    path: 'user',
    select: 'name photo'
  })
  next()
})

reviewSchema.pre('findOne', function(next) {
  // .this is query
  // this.populate({
  //   path: 'tour',
  //   select: 'name'
  // }).populate({
  //   path: 'user',
  //   select: 'name photo'
  // })
  this.populate({
    path: 'user',
    select: 'name photo'
  })
  next()
})

const ReviewModel: ReviewModel = model('Review', reviewSchema)

export default ReviewModel
