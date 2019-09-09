import winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  //   format: winston.format.combine(
  //     winston.format.colorize(),
  //     winston.format.prettyPrint()
  //   ),
  //   format: winston.format.combine(
  //     winston.format.colorize(),
  //     winston.format.timestamp(),
  //     winston.format.json()
  //   ),
  //   format: winston.format.json(),
  //   defaultMeta: { service: 'natours' },
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    // new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'combined.log' })
    new winston.transports.Console()
  ]
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
// if (process.env.NODE_ENV !== 'production') {
//   logger.add(
//     new winston.transports.Console({
//       format: winston.format.simple()
//     })
//   );
// }

export default logger;
