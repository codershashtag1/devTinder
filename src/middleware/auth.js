const User = require('../models/userModel')
const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    let { token } = req.cookies;
    if(!token) {
      return res.status(401).send("Please Login")
    }

    let decodedJwtToken = await jwt.verify(token, process.env.jwt_Secret_key);
    let { _id } = decodedJwtToken;
    
    let user = await User.findById({_id}).lean()

    if(!user) {
      return res.status(400).json({ "message": "Invalid User" })
    }

    req.user = user
    next()
  } catch(err) {
    throw new Error(err);
    
  }
}

module.exports = auth