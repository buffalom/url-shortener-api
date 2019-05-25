import logger from './logger'
import config from '../config'
import jwt from 'jsonwebtoken'
import red from './redis'

// Models
import User from '../models/User'
import Short from '../models/Short'
import Stats from '../models/Stats'
import Version from '../models/Version'

export const getPayloadFromCookie = async (cookieHeader) => {
  if (!cookieHeader) throw new Error('No cookie header provided')
  let tokenCookie = cookieHeader.replace(/\s/g, '').split(';').map(c => c.split('=')).find(c => c[0] === 'AccessToken')

  if (!tokenCookie || tokenCookie.length <= 1) throw new Error('No authorization cookie provided')

  let payload = await jwt.verify(tokenCookie[1], config.auth.secret)

  return payload
}

export const createJwt = async (email) => {
  let createdJwt = {}
  createdJwt.timeToExpire = config.auth.jwtExpiryHours * 60 * 60 * 1000
  createdJwt.expiryDate = + new Date(Date.now() + createdJwt.timeToExpire)
  createdJwt.token = await jwt.sign({
    email,
    exp: createdJwt.expiryDate
  }, config.auth.secret)
  return createdJwt
}

export const populateRedisFromMongo = async () => {
  const start = new Date()
  let shorts = await Short.find({})
  logger.logInfo(`Populating ${shorts.length} items in Redis from MongoDB`)

  for (let short of shorts) {
    await red.set(short.hash, short.url)
  }

  const millis = new Date() - start
  logger.logInfo(`Finished populating. Population took ${millis / 1000} seconds`)
}
