require('dotenv').config()

import mongoose = require('mongoose')
import logger from './logger'
import { app } from './app'

const DB = process.env.MONGO_DB.replace('<PASSWORD>', process.env.MONGO_PASSWD)
const port = process.env.NATOURS_PORT || 3000

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    logger.info('[db] connection succesful')
  })

app.listen(port, () => {
  logger.info(`[server] listening on port ${port}...`)
})
