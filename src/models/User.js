import mongoose from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'
import config from '../config'

const Schema = mongoose.Schema

export const userSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    required: true,
    auto: true
  },
  email: {
    type: String,
    index: true,
    unique: true,
    required: true,
    match: config.matchers.email
  },
  passwordHash: {
    type: String,
    required: true
  },
  shorts: [{
    type: Schema.Types.ObjectId,
    ref: 'Short'
  }],
}, {collection:'users'})
  .plugin(uniqueValidator)


const User = mongoose.model('User', userSchema)

export default User
