const express = require('express');
const authRouter = express.Router();
const { signUpValidation, loginValidation } = require('../utils/validation')
const User = require('../models/userModel')

authRouter.post('/signUp', signUpValidation, async (req, res) => {
  try {
    let user = new User(req.body)
    let encryptedPassword = await user.encryptPassword()
    user.password = encryptedPassword;

    let isUserAlreadyPresent = await User.find({ email: req.body.email })
    if (isUserAlreadyPresent.length > 0) {
      return res.status(400).json({ message: "Email Already Exists" })
    }

    let userData = await user.save(user)
    let jwtToken = await userData.getJwtToken();
    res.cookie('token', jwtToken, {
      expires: new Date(Date.now() + 8 * 36000)
    });
    // res.send("User Login successfully")
   
    res.send(userData)

  } catch(err) {
    res.status(400).send(err.message)
    
  }
})

authRouter.post('/login', loginValidation, async(req, res) => {
  try {
    let { email, password } = req.body

    let user = await User.findOne({ email: email })
    let isPasswordValid = false
    if (user) {
      isPasswordValid = await user.decryptPassword(password);
    }

    if (!isPasswordValid || !user) {
      return res.status(400).json({ message: "Invalid Credential" })
    }

    let jwtToken = await user.getJwtToken();
    res.cookie('token', jwtToken, { expires: new Date(Date.now() + 8 * 36000) });
    // res.send("User Login successfully")
    res.send(user)

  } catch(err) {
    res.status(400).send(err.message);
  }
})

authRouter.post('/logout', (req, res) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now())
    })
    res.send("User Logout Successfully")
  } catch(err) {
    res.status(400).send(err.message)
  }
})

module.exports = authRouter