const mongoose = require('mongoose')
const { Schema } = mongoose

const woodSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: 1,
    maxlength: 100
  }
}, 
{
  timestamps: true,
  versionKey: false
})

module.exports = mongoose.model('Wood', woodSchema)