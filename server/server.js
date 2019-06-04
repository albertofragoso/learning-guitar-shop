require('dotenv').config()

const express      = require('express')
const app          = express()
const cookieParser = require('cookie-parser')
const mongoose     = require('mongoose')
const User         = require('./models/User')

mongoose
  .connect('mongodb://localhost:27017/tiendaguitarras', { userNewUrlParser: true }, err => {
    if(err) return err
    console.log('Conented to MongoDB,')
  })

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())

const port = process.env.PORT || 3002

app.listen(port, () => console.log(`The server is running on ${port} port.`))

app.post('/api/user/register', (req, res, next) => {
  const user = new User(req.body)
  user.save((err, doc) => {
    if(err) return res.json({ success: false, err })
    res.status(200).json({ success: true, userdata: doc })
  })
})
