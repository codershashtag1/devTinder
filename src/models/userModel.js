const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,  
    required: true,
    max: 15
  },
  lastName: {
    type: String,
    required: true,
    max: 15
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  skills: {
    type: [String],
    required: true
  },
  age: {
    type: Number,
    require: true,
    cast: '{VALUE} is not a number',
    maxlength: 3
  },
  gender: {
    type: String,
    require: true,
    enum: {
      values: ['Male', 'Female', 'Others'],
      message: `{VALUE} is not allowed`
    }
  },
  photoUrl: {
    type: String,
    default: "https://geographyandyou.com/images/user-profile.png",
    require: true,
    validate(value) {
      if (!validator.isURL(value)) {
        throw new Error("Invalid Photo Url: ", + value)
      }
    }
  },
  about: {
    type: String,
    default: 'This is a default about of the user'
  },
  isPremium: {
    type: Boolean
  },
  memberShip: {
    type: String
  }
}, {
  timestamps: true
})

userSchema.methods.encryptPassword = async function () {
  try {
    const user = this;
    const encryptedPassword = await bcrypt.hash(user.password, 10)
    return encryptedPassword

  } catch(err) {
    throw new Error(err);
    
  }
}

userSchema.methods.decryptPassword = async function(inputUserPassword) {
  try {
    let user = this;

    let isPasswordValid = await bcrypt.compare(inputUserPassword, user.password)
    return isPasswordValid

  } catch(err) {
    throw new Error(err);
  }
  
}

userSchema.methods.getJwtToken = async function () {
  try {
    let user = this;

    let jwtToken = await jwt.sign({ _id: user._id }, process.env.jwt_Secret_key, { expiresIn: '1d'})
    return jwtToken;

  } catch (err) {
    throw new Error(err);
  }
}

module.exports = mongoose.model('User', userSchema)