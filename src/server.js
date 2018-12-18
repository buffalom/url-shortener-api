import express from 'express'
import bluebird from 'bluebird'
import redis from 'redis'
import cors from 'cors'
import './utils/mongo'
import './utils/helpers'
import config from './config'
import logger from './utils/logger'
import bodyParser from 'body-parser'
import useragent from 'useragent'

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
import Short from './models/Short'
import Stats from './models/Stats'
import Version from './models/Version'

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

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

  short.save()
})

app.post('/short', async (req, res) => {
  if (!req.body.url || !req.body.url.match(config.short.urlRegex)) res.status(400).send('Invalid url')

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
  
  Short.create({
    hash,
    url: req.body.url,
  })
})

app.listen(config.server.port, () => {
  logger.logInfo(`URL-Shortener API listening on port ${config.server.port}!`)
})
