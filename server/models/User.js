const mongoose = require('mongoose')
const { Schema } = mongoose
const bcrypt = require('bcrypt')
const SALT_I = 10

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

module.exports = mongoose.model('User', userSchema)