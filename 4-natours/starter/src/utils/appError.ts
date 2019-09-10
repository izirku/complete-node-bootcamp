export default class extends Error {
  statusCode: number
  status: string
  isOperational: boolean
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor) // do not polute stack trace with AppError
  }
}

// interface AppError extends Error {
//   status?: string
//   statusCode?: number
// }
