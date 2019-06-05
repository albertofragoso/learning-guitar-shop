require('dotenv').config()

const express      = require('express')
const app          = express()
const cookieParser = require('cookie-parser')
const mongoose     = require('mongoose')
const User         = require('./models/User')
const Brand        = require('./models/Brand')
const Wood         = require('./models/Wood')
const Product      = require('./models/Product')
const { auth }     = require('./middlewares/auth')
const { admin }    = require('./middlewares/admin')

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

app.post('/api/users/register', (req, res, next) => {
  const user = new User(req.body)
  user.save((err, doc) => {
    if(err) return res.json({ success: false, err })
    res.status(200).json({ success: true, userdata: doc })
  })
})

app.post('/api/users/login', (req, res, next) => {
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

app.get('/api/users/auth', auth, (req, res, next) => {
  res.status(200).json({
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true, 
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    cart: req.user.cart,
    history: req.user.history
  })
})

app.get('/api/users/logout', auth, (req, res, next) => {
  const { _id } = req.user
  User.findOneAndUpdate({ _id }, { token: '' }, (err, doc) => {
    if(err) return res.json({ success: false, err })
    return res.json(200).json({ success: true })
  })
})

app.post('/api/product/brand', auth, admin, (req, res, next) => {
  const brand = new Brand(req.body)
  brand.save((err, doc) => {
    if(err) return res.json({ success: false, err })
    res.status(200).json({ success: true, brand: doc })
  })
})


app.get('/api/product/brands', (req, res, next) => {
  Brand.find({}, (err, brands) => {
    if(err) return res.status(400).send(err)
    res.status(200).send(brands)
  })
})

app.post('/api/product/wood', auth, admin, (req, res, next) => {
  const wood = new Wood(req.body)
  wood.save((err, doc) => {
    if(err) return res.json({ success: false, err })
    res.status(200).json({ succes: true, wood: doc })
  })
})

app.get('/api/product/woods', (req, res, next) => {
  Wood.find({}, (err, woods) => {
    if(err) return res.status(400).send(err)
    res.status(200).send(woods)
  })
})

app.post('/api/product/article', auth, admin, (req, res, next) => {
  const product = new Product(req.body)
  product.save((err, doc) => {
    if(err) return res.json({ success: false, err })
    res.status(200).json({ success: true, article: doc })
  })
})

app.get('/api/product/articles', (req, res, next) => {

  // BY ARRIVAL (Más nuevas)
  // /articles?sortBy=createdAt&order=desc&limit=4
  // BY SELL (Más Ventas)
  // /articles?sortBy=sold&order=desc&limit=4

  let order = req.query.order ? req.query.order : 'asc'
  let sortBy = req.query.sortBy ? req.query.sortBy : '_id'
  let limit = req.query.limit ? parseInt(req.query.limit) : 100

  Product
    .find()
    .populate('Brand')
    .populate('Wood')
    .sort([[sortBy, order]])
    .limit(limit)
    .exec((err, articles) => {
      if(err) return res.status(400).send(err)
      res.status(200).send(articles)
    })
})