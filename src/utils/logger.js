const winston = require('winston')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple()
})

logger.add(new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
      format: 'DD.MM.YYYY HH:mm:ss'
    }),
    winston.format.align(),
    winston.format.printf(info => `${info.timestamp} [${info.level}]: ${info.message}`),
  )
}))

logger.logInfo = message => logger.log({ level: 'info', message })
logger.logWarn = message => logger.log({ level: 'warn', message })
logger.logError = message => logger.log({ level: 'error', message })

export default logger
