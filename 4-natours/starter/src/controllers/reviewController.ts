import { RequestHandler } from 'express'
import {
  deleteOne,
  updateOne,
  createOne,
  retrieveOne,
  retrieveAll
} from './handlerFactory'
import Review from '../models/reviewModel'
import { AppRequest } from '../interfaces'

export const setTourUserIds: RequestHandler = (req: AppRequest, _res, next) => {
  if (req.params.tourId) req.body.tour = req.params.tourId
  if (!req.body.user) req.body.user = req.user._id
  next()
}
export const createReview = createOne(Review)
export const getAllReviews = retrieveAll(Review)
export const getReview = retrieveOne(Review)
export const updateReview = updateOne(Review)
export const deleteReview = deleteOne(Review)
