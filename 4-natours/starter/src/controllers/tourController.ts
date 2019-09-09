// import fs = require('fs')
// import path = require('path')
import express = require('express')
// import ToursSimple from '../interfaces/ToursSimple'
import Tour from '../models/tourModel'
import logger from '../logger'

// const toursPath = path.resolve(
//   __dirname,
//   '../../dev-data/data/tours-simple.json'
// )

// const tours: ToursSimple[] = JSON.parse(fs.readFileSync(toursPath, 'utf-8'))

export const getAllTours = async (
  req: express.Request,
  res: express.Response
): Promise<void> => {
  try {
    const queryObj = { ...req.query } // es6 way of making a deep copy
    const excludedFields = ['page', 'sort', 'limit', 'fields']
    excludedFields.forEach(el => delete queryObj[el])
    logger.info('[req.query]', req.query)
    logger.info('[queryObj]', queryObj)

    const tours = await Tour.find()
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
