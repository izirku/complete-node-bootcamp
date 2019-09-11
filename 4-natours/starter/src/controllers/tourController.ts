import { Request, Response, NextFunction } from 'express'
import Tour from '../models/tourModel'
import logger from '../logger'
import APIFeatures from '../utils/apiFeatures'
import catchAsync from '../utils/catchAsync'
import appError from '../utils/appError'

export const aliasTopTours = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  req.query.limit = '5'
  req.query.sort = '-ratingsAverage,price'
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
  next()
}

export const getAllTours = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const features = new APIFeatures(Tour.find(), req.query)
      .filter(['page', 'sort', 'limit', 'fields'])
      .sort()
      .limitFields()
      .paginate()

    const tours = await features.query

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours
      }
    })
  }
)

export const getTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const tour = await Tour.findById(req.params.id)

    if (!tour) {
      return next(new appError('not found', 404))
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    })
  }
)

export const createTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const newTour = await Tour.create(req.body)
    logger.info('created new tour')
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    })
  }
)

export const updateTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // return new updated document
      runValidators: true
    })

    if (!tour) {
      return next(new appError('not found', 404))
    }

    res.status(200).json({
      status: 'succes',
      data: {
        tour
      }
    })
  }
)

export const deleteTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const tour = await Tour.findByIdAndDelete(req.params.id)
    // usual response for when deleting resource

    if (!tour) {
      return next(new appError('not found', 404))
    }

    res.status(204).json({
      status: 'succes',
      data: null
    })
  }
)

export const getTourStats = catchAsync(
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
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

export const getMonthlyPlan = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
