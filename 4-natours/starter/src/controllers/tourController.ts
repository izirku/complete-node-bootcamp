import { RequestHandler } from 'express'
import multer = require('multer')
import sharp = require('sharp')
import Tour from '../models/tourModel'
import {
  deleteOne,
  updateOne,
  createOne,
  retrieveOne,
  retrieveAll
} from './handlerFactory'
import catchAsync from '../utils/catchAsync'
import appError from '../utils/appError'

const multerStorage = multer.memoryStorage()
const multerFilter = (_req, file, cb): void => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true)
  } else {
    cb(new appError('Not an image. please upload only images', 400), false)
  }
}
const upload = multer({ storage: multerStorage, fileFilter: multerFilter })
export const uploadTourImages = upload.fields([
  {
    name: 'imageCover',
    maxCount: 1
  },
  {
    name: 'images',
    maxCount: 3
  }
])

export const resizeTourImages: RequestHandler = catchAsync(
  async (req, _res, next) => {
    // console.log(req.files)
    if (!req.files['imageCover'] || !req.files['images']) return next()
    // if (!req.files.imageCover || !req.files.images) return next()
    // if (!req.files) return next()

    // req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

    // 1) Cover image
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`
    await sharp(req.files['imageCover'][0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 75 })
      .toFile(`public/img/tours/${req.body.imageCover}`)

    // 2) all other images
    req.body.images = []

    // cannot do it like this with async, have to collect promisses first...
    // req.files['images'].forEach(async (file, i) => {
    await Promise.all(
      req.files['images'].map(async (file, i) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`
        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 75 })
          .toFile(`public/img/tours/${filename}`)
        req.body.images.push(filename)
      })
    )
    next()
  }
)

export const uploadUserPhoto = upload.single('photo')
export const getAllTours = retrieveAll(Tour)
export const createTour = createOne(Tour)
export const getTour = retrieveOne(Tour, { path: 'reviews' })
export const updateTour = updateOne(Tour)
export const deleteTour = deleteOne(Tour)

export const aliasTopTours: RequestHandler = (req, _res, next): void => {
  req.query.limit = '5'
  req.query.sort = '-ratingsAverage,price'
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
  next()
}

export const getTourStats: RequestHandler = catchAsync(
  async (_req, res, _next): Promise<void> => {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } } // same as filter
      },
      {
        $group: {
          // _id: null, // all things, don't group
          // _id: '$difficulty', // group by difficulty
          _id: { $toUpper: '$difficulty' }, // group by difficulty
          numTours: { $sum: 1 }, // just add 1s for each doc going through pipeline
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrcie: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      {
        $sort: { avgPrcie: 1 }
      }
      // {
      //   $match: {
      //     _id: { $ne: 'EASY' }
      //   }
      // }
    ])
    res.status(200).json({
      status: 'succes',
      data: {
        stats
      }
    })
  }
)

export const getMonthlyPlan: RequestHandler = catchAsync(
  async (req, res, _next): Promise<void> => {
    const year = parseInt(req.params.year)
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' } // aggregate array of tours
        }
      },
      // {
      //   $addFields: { month: '$_id' }
      // },
      // from: https://stackoverflow.com/questions/49870419/how-to-convert-number-to-month-in-mongo-aggregation
      {
        $addFields: {
          month: {
            $let: {
              vars: {
                monthsInString: [
                  ,
                  'Jan',
                  'Feb',
                  'Mar',
                  'Apr',
                  'May',
                  'Jun',
                  'Jul',
                  'Aug',
                  'Sep',
                  'Oct',
                  'Nov',
                  'Dec'
                ]
              },
              in: {
                $arrayElemAt: ['$$monthsInString', '$_id'] // '$$' accesses variables in 'vars
              }
            }
          }
        }
      },
      {
        $project: { _id: 0 }
      },
      {
        $sort: { numTourStarts: -1 }
      },
      { $limit: 12 }
    ])
    res.status(200).json({
      status: 'succes',
      data: {
        plan
      }
    })
  }
)

export const getToursWithin: RequestHandler = catchAsync(
  async (req, res, next) => {
    const { distance, latlng, unit } = req.params
    const [lat, lng] = latlng.split(',')
    const radRadius =
      unit === 'mi'
        ? parseFloat(distance) / 3963.2
        : parseFloat(distance) / 6378.1

    if (!lat || !lng)
      return next(
        new appError(
          'please provide latitude and longitude in lat,lng format',
          400
        )
      )

    // console.log(distance, lat, lng, unit)

    const tours = await Tour.find({
      startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radRadius] } }
    })

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        data: tours
      }
    })
  }
)

export const getDistances: RequestHandler = catchAsync(
  async (req, res, next) => {
    const { latlng, unit } = req.params
    const [lat, lng] = latlng.split(',')

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001

    if (!lat || !lng)
      return next(
        new appError(
          'please provide latitude and longitude in lat,lng format',
          400
        )
      )

    // console.log(lat, lng, unit)

    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier
        }
      },
      {
        $project: {
          distance: 1,
          name: 1
        }
      }
    ])

    res.status(200).json({
      status: 'success',
      data: {
        data: distances
      }
    })
  }
)
