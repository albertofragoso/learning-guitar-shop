const User = require('../models/User')

exports.auth = (req, res, next) => {
  let token = req.cookies.guitarshop_auth
  User.findByToken(token, (err, user) => {
    if(err) throw err
    if(!user) return res.json({ isAuth: false, error: true })
    req.token = token
    req.user = user
    next()
  })
}