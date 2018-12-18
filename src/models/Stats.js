import mongoose from 'mongoose'
import { versionSchema } from './Version'

const Schema = mongoose.Schema

export const statsSchema = new Schema({
  browser: [versionSchema],
  os: [versionSchema],
  devices: [versionSchema],
})

const Stats = mongoose.model('Stats', statsSchema)

export default Stats
