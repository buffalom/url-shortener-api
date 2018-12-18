import mongoose from 'mongoose'

const Schema = mongoose.Schema

export const versionSchema = new Schema({
  family: String,
  major: String,
  minor: String,
  patch: String,
  calls: Number,
})

const Version = mongoose.model('Version', versionSchema)

export default Version
