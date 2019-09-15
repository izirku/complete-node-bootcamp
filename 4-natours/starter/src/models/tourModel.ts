import { Schema, model, SchemaTypes } from 'mongoose'
import slugify from 'slugify'
// import validator from 'validator'
import logger from '../logger'
import { TourDocument, TourModel, TourQuery } from '../interfaces'

const toursSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'a tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'a tour name legth must be betwen 10 and 40 character'],
      minlength: [10, 'a tour name legth must be betwen 10 and 40 character']
      // validate: [validator.isAlpha, 'a tour name must contain letters only']
    },
    slug: String,
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
      required: [true, 'a tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'a difficulty is either: easy, medium or difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'rating must be in range of 1-5'],
      max: [5, 'rating must be in range of 1-5'],
      set: (val: number): number => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: { type: Number, required: [true, 'a tour must have a price'] },
    priceDiscount: {
      type: Number,
      validate: {
        // message: props => `discount price should be below the regular price`,
        validator: function(val: number): boolean {
          // this. only points to current doc on NEW document creation
          return this ? val < this.price : true
        }
        // msg: 'foo'
      }
    },
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
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number], // long, lat is GeoJSON
      address: String,
      description: String
    },
    locations: [
      {
        // GeoJSON
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'] // can only ever be 'Point'
        },
        coordinates: [Number], // long, lat is GeoJSON
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [{ type: SchemaTypes.ObjectId, ref: 'User' }]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// toursSchema.index({ price: 1 })
toursSchema.index({ price: 1, ratingsAverage: -1 })
toursSchema.index({ slug: 1 })
toursSchema.index({ startLocation: '2dsphere' })

// virtual properties
toursSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7
})

// virtual populate:
toursSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', // key field to current model in foreign collection
  localField: '_id' // which field here coresponding to that foreign key above
})

// DOCUMENT pre [hook] MIDDLEWARE
// runs before .save and .create
toursSchema.pre('save', function(next) {
  // this. is current DOCUMENT

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(this as any).slug = slugify((this as any).name, { lower: true })

  // this.slug = slugify((this as any).name, { lower: true })
  next()
})

// toursSchema.post('save', function(doc, next) {
//   logger.info(doc)
//   next()
// })

// QUERY MIDDLEWARE
toursSchema.pre('find', function(this: TourQuery, next) {
  // this. is current QUERY
  this.start = Date.now()
  this.find({ secretTour: { $ne: true } })
    // .select('-secretTour')
    .populate({
      path: 'guides'
      // select: '-__v -passwordChangedAt'
    })
  next()
})

toursSchema.pre('findOne', function(this: TourQuery, next) {
  // this. is current QUERY
  this.start = Date.now()
  this.find({ secretTour: { $ne: true } })
    // .select('-secretTour')
    .populate({
      path: 'guides'
      // select: '-__v -passwordChangedAt'
    })
  next()
})

toursSchema.post('find', function(this: TourQuery, docs, next) {
  // this. is current QUERY
  logger.info(`[query time] ${Date.now() - this.start}ms`)
  next()
})

toursSchema.post('findOne', function(this: TourQuery, docs, next) {
  // this. is current QUERY
  logger.info(`[query time] ${Date.now() - this.start}ms`)
  next()
})

// AGGREGATION MIDDLEWARE
// toursSchema.pre('aggregate', function(next) {
//   // this. is current AGGREGATION object
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
//   // logger.info('[aggregation pre hook]', this.pipeline())
//   next()
// })

// const TourModel: TourModel = model<TourDocument>('Tour', toursSchema)
const TourModel: TourModel = model('Tour', toursSchema)

// export default model('Tour', toursSchema)
export default TourModel
