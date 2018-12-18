import express from 'express'
import cors from 'cors'
import './utils/mongo'
import './utils/helpers'
import config from './config'
import logger from './utils/logger'
import bodyParser from 'body-parser'

// Models

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))



app.listen(config.server.port, () => {
  logger.logInfo(`URL-Shortener API listening on port ${config.server.port}!`)
})
