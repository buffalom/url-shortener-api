import mongoose from 'mongoose'
import logger from './logger'
import config from '../config'

mongoose.Types.ObjectId.prototype.valueOf = function () {
  return this.toString()
}

const connection = mongoose.connect(config.database.dbUrl, { useNewUrlParser: true }).then(
  async () => {
    // Load models
    require('../models/User')
    require('../models/Short')
    require('../models/Stats')
    require('../models/Version')

    logger.logInfo('Successfully connected to database')
  },
  err => {
    logger.logError('An error occured while connecting to the database')
    logger.logError(err)
    process.exit(1)
  }
)

export default connection
