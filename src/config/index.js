import path from 'path'

export default {
  env: process.env.NODE_ENV || 'production',
  rootDir: path.join(__dirname + '/../..'),
  server: {
    port: process.env.PORT || 3000,
    allowedOrigins: [
      'localhost:3000',
    ],
  },
  database: {
    redisUrl: process.env.REDIS_URL || 'redis://localhost:32768',
    dbUrl: process.env.DB_URL || 'mongodb://localhost:32769/url-shortener',
  },
  matchers: {
    url: /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/,
    email: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  },
  short: {
    hashChars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    // WARNING: Changing the length of a hash will disable all previously created short urls
    hashLength: 6,
  },
  auth: {
    secret: process.env.AUTH_SECRET || 'superduperultrasecret',
    saltRounds: 10,
    jwtExpiryHours: 168, // 7 Days
    // jwtExpiryHours: 0.002777778 * 2, // 20 Seconds (For testing)
    jwtRefreshHours: 24, // 1 Day
    // jwtRefreshHours: 0.002777778 / 2, // 5 Seconds (For testing)
  },
}
