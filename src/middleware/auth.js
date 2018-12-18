import logger from '../utils/logger'
import { createJwt, getPayloadFromCookie } from '../utils/helpers'
import config from '../config'
import User from '../models/User'

export default async (req, res, next) => {
  try {
    let payload = await getPayloadFromCookie(req.headers.cookie)

    // JWT expired
    if (payload.exp < + new Date()) throw new Error('jwt has expired')

    // JWT about to expire --> refresh
    if (payload.exp < (+ new Date() + (config.auth.jwtRefreshHours * 60 * 60 * 1000))) {
      let createdJwt = await createJwt(payload.email)
      res.cookie('AccessToken', createdJwt.token, {
        maxAge: createdJwt.timeToExpire,
        httpOnly: true,
        secure: config.env === 'production'
      })
      logger.logInfo(`JWT refreshed for User: ${payload.email}`)
    }

    // JWT fine
    req.user = await User.findOne({ email: payload.email })
    if (!req.user) throw new Error('Could not find user with jwt')
  } catch (err) {
    logger.logError(err)
    res.status(403).send({ message: 'Unauthorized' })
  }

  next()
}