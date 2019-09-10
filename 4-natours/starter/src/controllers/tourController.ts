// import fs = require('fs')
// import path = require('path')
import express = require('express')
// import ToursSimple from '../interfaces/ToursSimple'
import Tour from '../models/tourModel'
import logger from '../logger'
import { DocumentQuery, Document } from 'mongoose'

// const toursPath = path.resolve(
//   __dirname,
//   '../../dev-data/data/tours-simple.json'
// )

// const tours: ToursSimple[] = JSON.parse(fs.readFileSync(toursPath, 'utf-8'))

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

class APIFeatures {
  query: DocumentQuery<Document[], Document, {}>
  queryObj: any

  constructor(query: DocumentQuery<Document[], Document, {}>, queryObj: any) {
    this.query = query
    this.queryObj = { ...queryObj }
  }

  filter(excludedFields: string[]): APIFeatures {
    const queryCopy = { ...this.queryObj }
    // 1) filter out fields
    // const excludedFields = ['page', 'sort', 'limit', 'fields']
    excludedFields.forEach(el => delete queryCopy[el])

    // 2) advanced filtering
    let queryString = JSON.stringify(queryCopy)
    queryString = queryString.replace(
      /\b(lt|lte|gt|gte)\b/g,
      match => `$${match}`
    )

    // 3) build query so far:
    this.query = this.query.find(JSON.parse(queryString))

    // allow chaining
    return this
  }

  sort(): APIFeatures {
    if (this.queryObj.sort) {
      const sortBy = this.queryObj.sort.split(',').join(' ')
      this.query = this.query.sort(sortBy)
    } else {
      this.query = this.query.sort('-createdAt')
    }

    // allow chaining
    return this
  }

  limitFields(): APIFeatures {
    if (this.queryObj.fields) {
      const fields = this.queryObj.fields.split(',').join(' ')
      this.query = this.query.select(fields) // projecting
    } else {
      this.query = this.query.select('-__v') // exclude '__v' from projections by default
    }

    // allow chaining
    return this
  }

  paginate(): APIFeatures {
    const page = this.queryObj.page ? parseInt(this.queryObj.page) : 1
    const limit = parseInt(this.queryObj.limit) || 100
    const skip = (page - 1) * limit
    // logger.info(`[page] ${page}`)
    // logger.info(`[limit] ${limit}`)
    // logger.info(`[skip] ${skip}`)

    this.query = this.query.skip(skip).limit(limit)

    // just return zero results, don't mess with extra request / await
    // if (this.queryObj.page) {
    //   const numTours = await Tour.countDocuments()
    //   if (skip >= numTours) throw new Error('this page does not exist')
    // }

    // allow chaining
    return this
  }
}

export const getAllTours = async (
  req: express.Request,
  res: express.Response
): Promise<void> => {
  try {
    // // make a deep copy of a query object
    // let queryObj = { ...req.query } // es6 way of making a deep copy

    // // 1) filter non-mongo query parameters
    // const excludedFields = ['page', 'sort', 'limit', 'fields']
    // excludedFields.forEach(el => delete queryObj[el])

    // // 2) advanced filtering
    // let queryString = JSON.stringify(queryObj)
    // queryString = queryString.replace(
    //   /\b(lt|lte|gt|gte)\b/g,
    //   match => `$${match}`
    // )
    // queryObj = JSON.parse(queryString)

    // // 3) build query
    // let query = Tour.find(queryObj)

    // 4) sorting
    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(',').join(' ')
    //   query = query.sort(sortBy)
    // } else {
    //   query = query.sort('-createdAt')
    // }

    // // 5) field limitting
    // if (req.query.fields) {
    //   const fields = req.query.fields.split(',').join(' ')
    //   query = query.select(fields) // projecting
    // } else {
    //   query = query.select('-__v') // exclude '__v' from projections by default
    // }

    // 6) pagination
    // const page = req.query.page ? parseInt(req.query.page) : 1
    // const limit = parseInt(req.query.limit) || 100
    // const skip = (page - 1) * limit
    // // logger.info(`[page] ${page}`)
    // // logger.info(`[limit] ${limit}`)
    // // logger.info(`[skip] ${skip}`)

    // query = query.skip(skip).limit(limit)

    // if (req.query.page) {
    //   const numTours = await Tour.countDocuments()
    //   // logger.info(`[numTours] ${numTours}`)
    //   if (skip >= numTours) throw new Error('this page does not exist')
    // }

    // logger.info('[req.query]', req.query)
    // logger.info('[queryObj]', queryObj)

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

export const createTour = async (
  req: express.Request,
  res: express.Response
): Promise<void> => {
  try {
    const newTour = await Tour.create(req.body)
    logger.info('created new tour')
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    })
  } catch (err) {
    logger.error(err)
    res.status(400).json({
      status: 'fail',
      message: 'bad request'
    })
  }
}

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
