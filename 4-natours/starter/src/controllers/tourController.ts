import express = require('express')
import Tour from '../models/tourModel'
import logger from '../logger'
import APIFeatures from '../utils/apiFeatures'

export const aliasTopTours = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  req.query.limit = '5'
  req.query.sort = '-ratingsAverage,price'
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
  next()
}

export const getAllTours = async (
  req: express.Request,
  res: express.Response
): Promise<void> => {
  try {
    // build query
    const features = new APIFeatures(Tour.find(), req.query)
      .filter(['page', 'sort', 'limit', 'fields'])
      .sort()
      .limitFields()
      .paginate()

    // execute query
    const tours = await features.query

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours
      }
    })
  } catch (err) {
    logger.error(err)
    res.status(404).json({
      status: 'fail',
      message: 'not found'
    })
  }
}

export const getTour = async (
  req: express.Request,
  res: express.Response
): Promise<void> => {
  try {
    const tour = await Tour.findById(req.params.id)
    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    })
  } catch (err) {
    logger.error(err)
    res.status(404).json({
      status: 'fail',
      message: 'not found'
    })
  }
}

// 1. takes a RequestHandler
// 2. returns an anonymous function that wraps a RequestHandler in (1)
// 3. This new RequestHandler wrapper when called by Express, calls original
//    RequestHandler (1) and additionally issues .catch on returned
//    promisse to forward errors to the global error handling middleware
const catchAsync = (fn: express.RequestHandler): express.RequestHandler => {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> => {
    // return fn(req, res, next).catch(err => next(err))
    // reduction inside catch:
    return fn(req, res, next).catch(next)
  }
}

export const createTour = catchAsync(
  async (req: express.Request, res: express.Response): Promise<void> => {
    const newTour = await Tour.create(req.body)
    logger.info('created new tour')
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    })
    // try {
    // } catch (err) {
    //   logger.error(err)
    //   res.status(400).json({
    //     status: 'fail',
    //     message: 'bad request'
    //   })
    // }
  }
)

export const updateTour = async (
  req: express.Request,
  res: express.Response
): Promise<void> => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // return new updated document
      runValidators: true
    })
    res.status(200).json({
      status: 'succes',
      data: {
        tour
      }
    })
  } catch (err) {
    logger.error(err)
    res.status(404).json({
      status: 'fail',
      message: err
    })
  }
}

export const deleteTour = async (
  req: express.Request,
  res: express.Response
): Promise<void> => {
  try {
    await Tour.findByIdAndDelete(req.params.id)
    // usual response for when deleting resource
    res.status(204).json({
      status: 'succes',
      data: null
    })
  } catch (err) {
    logger.error(err)
    res.status(404).json({
      status: 'fail',
      message: err
    })
  }
}

export const getTourStats = async (
  _req: express.Request,
  res: express.Response
): Promise<void> => {
  try {
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
  } catch (err) {
    logger.error(err)
    res.status(404).json({
      status: 'fail',
      message: err
    })
  }
}

export const getMonthlyPlan = async (
  req: express.Request,
  res: express.Response
): Promise<void> => {
  try {
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
  } catch (err) {
    logger.error(err)
    res.status(404).json({
      status: 'fail',
      message: err
    })
  }
}
