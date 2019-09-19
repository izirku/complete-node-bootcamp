import { ErrorRequestHandler, Response } from 'express'
import AppError from '../utils/appError'
import logger from '../logger'

const handleCastErrorDB = (err: AppError): AppError => {
  const message = `invalid ${err.path}: ${err.value}`
  return new AppError(message, 400)
}

const handleDuplicateFieldsDB = (err: AppError): AppError => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]
  const message = `duplicate unique field value: ${value}`
  return new AppError(message, 400)
}

const handleValiidationErrorDB = (err: AppError): AppError => {
  const errors = Object.values(err.errors).map(el => el.message)
  const message = `invalid input data: ${errors.join('. ')}`
  return new AppError(message, 400)
  // return new AppError(err.message, 400)
}

const handleJWTError = (): AppError => new AppError('not authorized', 401)

const handleJWTExpiredError = (): AppError =>
  new AppError('session expired', 401)

const sendErrorDev = (err: AppError, url: string, res: Response): void => {
  if (url.startsWith('/api')) {
    // API
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    })
  } else {
    // RENDERED WEBSITE
    logger.error('[sendErrorDev] ', err)
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message
    })
  }
}

const sendErrorProd = (err: AppError, url: string, res: Response): void => {
  if (url.startsWith('/api')) {
    // API
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
        message: 'please try agaiin later'
      })
    }
  } else {
    // RENDERED WEBSITE
    res.status(err.isOperational ? err.statusCode : 500).render('error', {
      title: 'Something went wrong',
      msg: err.isOperational ? err.message : 'internal server error'
    })
  }
}

const errorHandlerMiddleware: ErrorRequestHandler = (
  err: AppError,
  req,
  res,
  _next
) => {
  err.statusCode = err.statusCode ? err.statusCode : 500
  err.status = err.status ? err.status : 'error'

  // logger.warn('[error handling middleware]')
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req.originalUrl, res)
  } else if (process.env.NODE_ENV === 'production') {
    let error: AppError = { ...err }
    error.message = err.message

    switch (true) {
      case error.name === 'CastError':
        error = handleCastErrorDB(error)
        break
      case error.code === 11000:
        error = handleDuplicateFieldsDB(error)
        break
      case error.name === 'ValidationError':
        error = handleValiidationErrorDB(error)
        break
      case error.name === 'JsonWebTokenError':
        error = handleJWTError()
        break
      case error.name === 'TokenExpiredError':
        error = handleJWTExpiredError()
        break
      // default:
      //   break
    }
    // if (error.name === 'CastError') error = handleCastErrorDB(error)
    // if (error.code === 11000) error = handleDuplicateFieldsDB(error)
    // if (error.name === 'ValidationError')
    //   error = handleValiidationErrorDB(error)
    // if (error.name === 'JsonWebTokenError') error = handleJWTError(error)

    sendErrorProd(error, req.originalUrl, res)
  }
  // next()
}

export default errorHandlerMiddleware
