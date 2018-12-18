import mongoose from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'
import { agentSchema } from './Agent'
import config from '../config'

const Schema = mongoose.Schema

export const urlSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    required: true,
    auto: true
  },
  short: {
    type: String,
    required: true,
    index: true,
    unique: true,
    match: config.short.urlRegex
  },
  link: {
    type: String,
    required: true,
  },
  agent: agentSchema,
}, { collection: 'urls', timestamps: true, autoIndex: false })
  .plugin(uniqueValidator)

const Url = mongoose.model('Url', urlSchema)

export default Url
