import mongoose from 'mongoose'
import { versionSchema } from './Version'

const Schema = mongoose.Schema

export const agentSchema = new Schema({
  browser: versionSchema,
  os: versionSchema,
  device: versionSchema,
})

const Agent = mongoose.model('Agent', agentSchema)

export default Agent
