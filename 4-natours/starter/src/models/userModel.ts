import crypto = require('crypto')
import { Schema, Model, model, HookNextFunction } from 'mongoose'
import bcrypt = require('bcryptjs')
import { UserDocument } from '../interfaces'
// import {}from 'bcryptjs'
// import slugify from 'slugify'
// import validator from 'validator'
import isEmail from 'validator/lib/isEmail'
// import logger from '../logger'
// import logger from '../logger'

// name, email, photo, password, passwordConfirm

export type UserModel = Model<UserDocument>

// interface UserModel extends Model<UserDocument> {}

const userSchema = new Schema({
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
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: true,
    select: false,
    minlength: [8, 'password must be at least 8 characters long']
  },
  passwordConfirm: {
    type: String,
    // required means required input, not required to be persisted to DB
    required: [true, 'password confirmation is required'],
    // this only works on SAVE:
    validate: [
      function(pw: string): boolean {
        return pw === this.password
      },
      'passwords do not match'
    ]
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date
})

userSchema.pre('save', async function(
  this: UserDocument,
  next: HookNextFunction
) {
  // only run this function if password was actually modified
  if (!this.isModified('password')) return next()

  // hash password with cost of 12
  this.password = await bcrypt.hash(this.password, 12)
  // logger.info(`[encrypted password] ${this.password}`)
  this.passwordConfirm = undefined // do not persist to database
})

// Instance methods:
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changedPasswordAfter = function(
  JWTTimeStamp: number
): boolean {
  if (this.passwordChangedAt) {
    const changedTimeStamp = Math.round(this.passwordChangedAt.getTime() / 1000)
    console.log(changedTimeStamp, JWTTimeStamp)
    // TODO: double check if we should use '<' or '<='
    return JWTTimeStamp <= changedTimeStamp
  }
  return false
}

userSchema.methods.createPasswordResetToken = function(): string {
  const resetToken = crypto.randomBytes(32).toString('hex')
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')
  this.passwordResetExpires = Date.now() + 10 * 60000

  console.log({ resetToken }, this.passwordResetToken)
  return resetToken
}

// MODEL MUST BE CREATED AFTER SCHEMA MIDDLEWARE!!!
const UserModel: UserModel = model<UserDocument>('User', userSchema)

export default UserModel
