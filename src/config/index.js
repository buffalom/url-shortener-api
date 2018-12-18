import path from 'path'

export default {
  env: process.env.NODE_ENV || 'development',
  rootDir: path.join(__dirname + '/../..'),
  server: {
    port: process.env.PORT || 3000,
    allowedOrigins: [
      'localhost:3000',
    ],
  },
  database: {
    url: process.env.DB_URI || 'mongodb://localhost:32768/url-shortener',
  },
  short: {
    urlRegex: /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/,
    hashChars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    // WARNING: Changing the length of a hash will disable all previously created short urls
    hashLength: 6,
    // hashChars: 'ABC',
    // hashLength: 1,
  }
}
