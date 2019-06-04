require('dotenv').config()

const express      = require('express')
const app          = express()
const cookieParser = require('cookie-parser')
const mongoose     = require('mongoose')
const User         = require('./models/User')

mongoose
  .connect(process.env.DB, { useNewUrlParser: true }, err => {
    if(err) return err
    console.log('Conected to MongoDB.')
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

app.post('/api/user/login', (req, res, next) => {
// 1. Finding out email
  const { email } = req.body
  User.findOne({ email }, (err, user) => {
    if(!user) return res.json({ loginSuccess: false, message: 'Ops! Something went wrong.' })

//2. Getting and checking password
    user.comparePassword(req.body.password, (err, isMatch) => {
      if(!isMatch) return res.json({ loginSuccess: false, message: 'Incorrect password.' })
  
//3. Generating token
      user.generateToken((err, user) => {
        if(err) return res.status(400).send(err)
        res.cookie('guitarshop_auth', user.token).status(200).json({ logginSuccess: true })
      })
    })
  })
})

