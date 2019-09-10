import express = require('express')
import AppError from '../utils/appError'

const errorHandlerMiddleware: express.ErrorRequestHandler = (
  err: AppError,
  _req,
  res,
  next
) => {
  err.statusCode = err.statusCode ? err.statusCode : 500
  err.status = err.status ? err.status : 'error'

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  })
  next()
}

export default errorHandlerMiddleware
