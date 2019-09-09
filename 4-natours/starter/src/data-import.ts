require('dotenv').config()
import fs = require('fs')
import path = require('path')
import mongoose = require('mongoose')
import logger from './logger'
import Tour from './models/tourModel'

const DB = process.env.MONGO_DB.replace('<PASSWORD>', process.env.MONGO_PASSWD)

// READ JSON FILE
const tours = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, '../dev-data/data/tours-simple.json'),
    'utf-8'
  )
)

// IMPORT DATA INTO DB
const importData = async (): Promise<void> => {
  try {
    await Tour.create(tours)
    logger.info('[import] success')
  } catch (err) {
    logger.error(err)
  }
}

// DELETE ALL DATA FROM DB
const deleteData = async (): Promise<void> => {
    try {
      await Tour.deleteMany({})
      logger.info('[delete] succes')
    } catch (err) {
      logger.error(err)
    }
  }

  // ENTRY
;(async (): Promise<void> => {
  if (
    !process.argv[2] ||
    (process.argv[2] !== '--import' && process.argv[2] !== '--delete')
  ) {
    logger.warn("please specify either '--import' or '--delete'")
  } else {
    try {
      await mongoose.connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
      })
      logger.info('[db] connection succesful')

      if (process.argv[2] === '--import') {
        await importData()
      } else if (process.argv[2] === '--delete') {
        await deleteData()
      }

      logger.info('[finished] exiting')
      await mongoose.disconnect()
    } catch (err) {
      logger.error(err)
    }
  }
})()
