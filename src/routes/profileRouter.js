const express = require('express');
const profileRouter = express.Router()
const {
  editProfileValidation
} = require('../utils/validation')
const User = require('../models/userModel')
const auth = require('../middleware/auth')

profileRouter.get('/view', auth, (req, res) => {
  try {

    let user = req.user;
    res.json(user)

  } catch(err) {
    res.status(400).send(err.message)
  }
})

profileRouter.patch('/edit', editProfileValidation , auth, async (req, res) => {
  try {
    let loggedinUser = req.user;

    const updateFields = {};
    for(let key in req.body) {
      if (Array.isArray(req.body[key])) {
        let newSkills = req.body[key].join()
        let oldSkill = loggedinUser[key]
        if(oldSkill != newSkills) {
          updateFields[key] = req.body[key]
        }
      } else {
        if (req.body[key] != loggedinUser[key]) {
          updateFields[key] = req.body[key]
        }
      }
    }

    if(Object.keys(updateFields).length > 0) {
      const updatedUser = await User.findByIdAndUpdate(
        loggedinUser._id,
        updateFields, {
          new: true
        }
      )
      // await User.updateOne({ _id: loggedinUser._id }, updateFields)
      return res.send(updatedUser)
    } else {
      return res.status(400).send("No Change Found")
    }

  } catch(err) {
    res.status(400).send(err.message)
  }
})


module.exports = profileRouter