import mongoose = require('mongoose')
// import slugify from 'slugify'
// import validator from 'validator'
import isEmail from 'validator/lib/isEmail'
// import logger from '../logger'

// name, email, photo, password, passwordConfirm

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'user must provide a name'],
    trim: true,
    minlength: [2, 'user name must be between 2-30 characters long'],
    maxlength: [30, 'user name must be between 2-30 characters long']
  },
  photo: String,
  email: {
    type: String,
    required: [true, 'user must provide an email'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: [isEmail, 'must be a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: [8, 'password must be at least 8 characters long']
  },

  passwordConfirm: {
    type: String,
    required: [true, 'password confirmation is required'],
    // this only works on SAVE:
    validate: [
      function(pw: string): boolean {
        return pw === this.password
      },
      'passwords do not match'
    ]
  }
})

userSchema.pre('save', function(next) {
  if (!this.isModified('password')) return next()
})
export default mongoose.model('User', userSchema)
