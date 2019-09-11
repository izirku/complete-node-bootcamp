import { ErrorRequestHandler } from 'express'
import AppError from '../utils/appError'
import logger from '../logger'

const handleCastErrorDB = (err: any): AppError => {
  const message = `invalid ${err.path}: ${err.value}`
  return new AppError(message, 400)
}

const handleDuplicateFieldsDB = (err: any): AppError => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]
  const message = `duplicate unique field value: ${value}`
  return new AppError(message, 400)
}

const handleValiidationErrorDB = (err: any): AppError => {
  const errors = Object.values(err.errors).map((el: any) => el.message)
  const message = `invalid input data: ${errors.join('. ')}`
  return new AppError(message, 400)
  // return new AppError(err.message, 400)
}

const sendErrorDev = (err: AppError, res): void => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  })
}

const sendErrorProd = (err: AppError, res): void => {
  // operational, trusted error
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    })
  } else {
    logger.error('internal error', err)

    // programming or other unknown error, don't leak error details
    res.status(500).json({
      status: 'error',
      message: 'internal server error'
    })
  }
}

const errorHandlerMiddleware: ErrorRequestHandler = (
  err: AppError,
  _req,
  res,
  _next
) => {
  err.statusCode = err.statusCode ? err.statusCode : 500
  err.status = err.status ? err.status : 'error'

  logger.warn('[error handling middleware]')
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res)
  } else if (process.env.NODE_ENV === 'production') {
    let error: any = { ...err }
    if (error.name === 'CastError') error = handleCastErrorDB(error)
    if (error.code === 11000) error = handleDuplicateFieldsDB(error)
    if (error.name === 'ValidationError')
      error = handleValiidationErrorDB(error)

    sendErrorProd(error, res)
  }
  // next()
}

export default errorHandlerMiddleware
