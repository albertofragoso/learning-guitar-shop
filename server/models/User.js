require('dotenv').config()

const mongoose = require('mongoose')
const { Schema } = mongoose
const bcrypt = require('bcrypt')
const SALT_I = 10
const jwt = require('jsonwebtoken')

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: 1
  },
  password: {
    type: String,
    required: true,
    minlength: 5
  },
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  lastname: {
    type: String,
    required: true,
    maxlength: 100
  },
  cart: {
    type: Array,
    default: []
  },
  history: {
    type: Array,
    default: []
  },
  role: {
    type: Number,
    default: 0
  },
  token: {
    type: String
  }
}, 
{
  timestamps: true,
  versionKey: false
})

userSchema.pre('save', async function(next) {
  if(this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(SALT_I)
      const hash = await bcrypt.hash(this.password, salt)
      this.password = hash
      next()
    } catch(err) {
      return next(err)
    } 
  }
})

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch){
    if(err) return cb(err)
    cb(null, isMatch)
  })
}

userSchema.methods.generateToken = async function(cb) {
  const token = await jwt.sign(this._id.toHexString(), process.env.SECRET)

  this.token = token
  this.save((err, user) => {
    if(err) return cb(err)
    cb(null, user)
  })
}

userSchema.statics.findByToken = function(token, cb) {
  const user = this

  jwt.verify(token, process.env.SECRET, function(err, decode) {
    user.findOne({ '_id': decode, 'token': token }, function(err, user) {
      if(err) cb(error)
      cb(null, user)
    })
  })
}

module.exports = mongoose.model('User', userSchema)