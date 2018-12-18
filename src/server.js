import express from 'express'
import bluebird from 'bluebird'
import redis from 'redis'
import bcrypt from 'bcrypt'
import cors from 'cors'
import './utils/mongo'
import { createJwt } from './utils/helpers'
import config from './config'
import logger from './utils/logger'
import bodyParser from 'body-parser'
import useragent from 'useragent'
import authMiddleware from './middleware/auth'

// Make the useragent-parser update it's datebase frequently
useragent(true)
// Use promises for redis
bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

// Create redis client
var red = redis.createClient(32773)
red.on('error', (err) => {
  logger.logError('An error occured while connecting to redis')
  logger.logError(err)
  process.exit(1)
})
red.on('ready', (err) => {
  logger.logInfo('Successfully connected to redis')
})

// Models
import User from './models/User'
import Short from './models/Short'
import Stats from './models/Stats'
import Version from './models/Version'

const app = express()
app.use(cors({
  origin: config.server.allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST'],
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

app.post('/signup', async (req, res) => {
  try {
    if (!req.body.email) {
      throw new Error('No Email provided')
    }
    if (!req.body.password) {
      throw new Error('No Password provided')
    }
    if (req.body.password !== req.body.passwordConfirm) {
      throw new Error('Passwords do not match')
    }

    const passwordHash = await bcrypt.hash(req.body.password, config.auth.saltRounds)
    let user = await User.create({
      email: req.body.email,
      passwordHash,
    })
    logger.logInfo(`User signed up: ${user.email}`)
    res.send({ message: 'Signup successful' })
  } catch (err) {
    logger.logError(err)
    res.status(500).send({ message: 'Could not create user' })
  }
})

app.post('/login', async (req, res) => {
  try {
    let user = await User.findOne({
      email: req.body.email,
    })
    if (!user) {
      throw new Error('Could not find user with email')
    }
    if (await bcrypt.compare(req.body.password, user.passwordHash)) {
      let createdJwt = await createJwt(user.email)
      res.cookie('AccessToken', createdJwt.token, {
        maxAge: createdJwt.timeToExpire,
        httpOnly: true,
        secure: config.env === 'production',
      })
      logger.logInfo(`User logged in: ${user.email}`)
      res.send({ message: 'Login successful' })
    } else {
      throw new Error('Password incorrect')
    }
  } catch (err) {
    logger.logInfo(`User failed to log in: ${req.body.email}`)
    logger.logError(err)
    res.status(500).send({ message: 'Could not log in' })
  }
})

app.get('/shorts', authMiddleware, async (req, res) => {
  await req.user.populate('shorts').execPopulate()
  res.send(req.user.shorts)
})

app.post('/shorts', authMiddleware, async (req, res) => {
  if (!req.body.url || !req.body.url.match(config.matchers.url)) res.status(400).send('Invalid url')

  let hash
  do {
    hash = ''
    for (let i = 0; i < config.short.hashLength; i++) {
      hash += config.short.hashChars.charAt(Math.floor(Math.random() * config.short.hashChars.length))
    }
  } while (await Short.findOne({ hash }))

  try {
    await red.set(hash, req.body.url)
  } catch (err) {
    res.status(500).send('Could not create short url')
    return
  }

  res.send(hash)
  
  let short = await Short.create({
    hash,
    url: req.body.url,
  })

  req.user.shorts.push(short)
  await req.user.save()
})

app.get(`/:hash([a-zA-Z0-9]{${config.short.hashLength}})`, async (req, res) => {
  let url
  try {
    url = await red.getAsync(req.params.hash)
  } catch (err) {
    res.status(404).send('Could not find short url')
    return
  }
  res.redirect(url)

  let user = useragent.lookup(req.headers['user-agent']).toJSON()
  let short = await Short.findOne({ hash: req.params.hash })
  
  // Browser
  let browser = short.stats.browser.find(b => b.family === user.family && b.major === user.major && b.minor === user.minor && b.patch === user.patch)
  if (!browser) {
    short.stats.browser.push(new Version({
      family: user.family,
      major: user.major,
      minor: user.minor,
      patch: user.patch,
      calls: 1,
    }))
  } else {
    browser.calls++
  }

  // Operating System
  let os = short.stats.os.find(os => os.family === user.os.family && os.major === user.os.major && os.minor === user.os.minor && os.patch === user.os.patch)
  if (!os) {
    short.stats.os.push(new Version({
      family: user.os.family,
      major: user.os.major,
      minor: user.os.minor,
      patch: user.os.patch,
      calls: 1,
    }))
  } else {
    os.calls++
  }

  // Device
  let device = short.stats.devices.find(d => d.family === user.device.family && d.major === user.device.major && d.minor === user.device.minor && d.patch === user.device.patch)
  if (!device) {
    short.stats.devices.push(new Version({
      family: user.device.family,
      major: user.device.major,
      minor: user.device.minor,
      patch: user.device.patch,
      calls: 1,
    }))
  } else {
    device.calls++
  }

  await short.save()
})

app.listen(config.server.port, () => {
  logger.logInfo(`URL-Shortener API listening on port ${config.server.port}!`)
})
