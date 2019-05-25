import redis from 'redis'
import logger from './logger'
import config from '../config'

// Create redis client
const red = redis.createClient(config.database.redisUrl)
red.on('error', (err) => {
  logger.logError('An error occured while connecting to redis')
  logger.logError(err)
  process.exit(1)
})
red.on('ready', (err) => {
  logger.logInfo('Successfully connected to redis')
})

export default red
