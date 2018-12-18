import express from 'express'
import cors from 'cors'
import './utils/mongo'
import './utils/helpers'
import config from './config'
import logger from './utils/logger'
import bodyParser from 'body-parser'
import useragent from 'useragent'
useragent(true)

// Models
import Url from './models/Url'

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

app.post('/short', async (req, res) => {
  if (!req.body.url || !req.body.url.match(config.short.urlRegex)) res.status(400).send('Invalid url')

  let userAgent = useragent.lookup(req.headers['user-agent']).toJSON()

  let hash
  do {
    hash = ''
    for (let i = 0; i < config.short.hashLength; i++) {
      hash += config.short.hashChars.charAt(Math.floor(Math.random() * config.short.hashChars.length))
    }
  } while (await Url.findOne({ hash }))

  res.send(hash)
})

app.listen(config.server.port, () => {
  logger.logInfo(`URL-Shortener API listening on port ${config.server.port}!`)
})
