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
}
