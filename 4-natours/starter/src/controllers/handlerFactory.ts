import { RequestHandler } from 'express'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Model, QueryPopulateOptions } from 'mongoose'
import { AppDocuments } from '../interfaces'
import catchAsync from '../utils/catchAsync'
import AppError from '../utils/appError'
import APIFeatures from '../utils/apiFeatures'

// *****************************************************************************
// C.R.U.D.
export const createOne = (Model: Model<AppDocuments>): RequestHandler =>
  catchAsync(async (req, res, _next) => {
    const doc = await Model.create(req.body)

    res.status(200).json({
      status: 'succes',
      data: { data: doc }
    })
  })

export const retrieveOne = (
  Model: Model<AppDocuments>,
  populateOpts?: QueryPopulateOptions
): RequestHandler =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id)
    if (populateOpts) query = query.populate(populateOpts)
    const doc = await query

    if (!doc) {
      return next(new AppError('document not found', 404))
    }

    res.status(200).json({
      status: 'succes',
      data: { data: doc }
    })
  })

export const retrieveAll = (Model: Model<AppDocuments>): RequestHandler =>
  catchAsync(async (req, res, _next) => {
    // to allow for nested GET reviews on tours (hack)
    const filter = {}
    if (req.params.tourId) filter['tour'] = req.params.tourId

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate()

    // for performance testing
    // const doc = await features.query.setOptions({ explain: 'executionStats' })
    const doc = await features.query

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        doc
      }
    })
  })

export const updateOne = (Model: Model<AppDocuments>): RequestHandler =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body)

    if (!doc) {
      return next(new AppError('document not found', 404))
    }

    res.status(200).json({
      status: 'succes',
      data: { data: doc }
    })
  })

export const deleteOne = (Model: Model<AppDocuments>): RequestHandler =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id)

    if (!doc) {
      return next(new AppError('document not found', 404))
    }

    res.status(204).json({
      status: 'succes',
      data: null
    })
  })
