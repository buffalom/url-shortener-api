import mongoose from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'
import Stats, { statsSchema } from './Stats'
import config from '../config'

const Schema = mongoose.Schema

export const shortSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    required: true,
    auto: true
  },
  hash: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  url: {
    type: String,
    required: true,
    match: config.matchers.url,
  },
  stats: {
    type: statsSchema,
    default: new Stats(),
  },
}, { collection: 'shorts', timestamps: true, autoIndex: false })
  .plugin(uniqueValidator)

const Short = mongoose.model('Short', shortSchema)

export default Short
