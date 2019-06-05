const mongoose = require('mongoose')
const { Schema } = mongoose

const brandSchema = new Schema({
  name: {
    required: true,
    type: String,
    unique: 1,
    maxlength: 100
  }
}, 
{
  timestamps: true,
  versionKey: false
})

module.exports = mongoose.model('Brand', brandSchema)