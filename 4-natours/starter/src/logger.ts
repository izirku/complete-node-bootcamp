import path = require('path')
import winston = require('winston')

const fmtErrorFile: winston.transports.FileTransportOptions = {
  level: 'error',
  filename: path.resolve(__dirname, 'logs/error.log'),
  // handleExceptions: true,
  maxsize: 5242880, // 5MB
  maxFiles: 5
}

const fmtCombinedFile: winston.transports.FileTransportOptions = {
  level: 'info',
  filename: path.resolve(__dirname, 'logs/combined.log')
}

const initLogger = (): winston.Logger => {
  if (process.env.NODE_ENV === 'production') {
    return winston.createLogger({
      level: 'info',
      // defaultMeta: { service: 'natours' },
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log`
        // - Write all logs error (and below) to `error.log`.
        //
        new winston.transports.File(fmtErrorFile),
        new winston.transports.File(fmtCombinedFile)
      ]
    })
  } else {
    return winston.createLogger({
      level: 'info',
      // defaultMeta: { service: 'natours' },
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.simple()
        // winston.format.prettyPrint()
      ),
      // format: winston.format.simple(),
      transports: [new winston.transports.Console()]
    })
  }
}

const logger = initLogger()

// create a stream object with a 'write' function that will be used by `morgan`
// use the 'info' log level so the output will be picked up by both transports (file and console)
// logger.stream = {
//   write: function(message, encoding): void {
//     logger.info(message)
//   }
// }

export default logger
