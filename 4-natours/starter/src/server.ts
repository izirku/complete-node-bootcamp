require('dotenv').config()

import mongoose = require('mongoose')
import logger from './logger'
import { app } from './app'

process.on('uncaughtException', (err: Error) => {
  logger.error('[unhandled excetpion] shutting down...')
  logger.error(err.name, err.message)
  // eslint-disable-next-line no-process-exit
  process.exit(1)
})

const DB = process.env.MONGO_DB.replace('<PASSWORD>', process.env.MONGO_PASSWD)
const port = process.env.NATOURS_PORT || 3000

logger.info(`[starting] mode: ${process.env.NODE_ENV}`)
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    logger.info('[db] connection succesful')
  })

const server = app.listen(port, () => {
  logger.info(`[server] listening on port ${port}...`)
})

process.on('unhandledRejection', (err: Error) => {
  logger.error('[unhandled rejection] shutting down...')
  logger.error(err.name, err.message)
  // throw new Error('UNHANDLED REJECTION! shutting down...')
  server.close(() => {
    // throw new Error('UNHANDLED REJECTION! shutting down...')
    // eslint-disable-next-line no-process-exit
    process.exit(1)
  })
})
