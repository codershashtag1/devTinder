const validator = require('validator');

const signUpValidation = (req, res, next) => {
  try {
    let { email, password, skills } = req.body

    let requiredFields = ["firstName", "lastName", "email", "password"];
    let result = requiredFieldValidation(req.body, requiredFields);
    if(!result.status) {
      return res.status(400).json({
        message: result.message
      });
    }

    if (!validator.isEmail(email)) res.status(400).json({ message: "Email is invalid"})
    if (!validator.isStrongPassword(password)) res.status(400).json({ message: "Weak Password"});
    next();
    
  } catch(err) {
    res.status(400).send(err.message)
  }
}

const loginValidation = (req, res, next) => {
  try {
    let requiredFields = ["email", "password"];
    let result = requiredFieldValidation(req.body, requiredFields);
    if (!result.status) {
      return res.status(400).json({
        message: result.message
      });
    }

    next()

  } catch(err) {
    res.status(400).send(err.message)
  }
}

const editProfileValidation = (req, res, next) => {
  try {

    let { skills } = req.body

    let requiredFields = ["firstName", "lastName", "age", "gender", "about", "photoUrl"];
    let result = requiredFieldValidation(req.body, requiredFields);
    if (!result.status) {
      return res.status(400).json({
        message: result.message
      });
    }

    // if (!skills || skills.length == 0) {
    //   return res.status(400).json({
    //     message: "Please Enter atleast One Skill"
    //   })
    // }
    
    next()

  } catch(err) {
    res.status(400).send(err.message)
  }
}


const requiredFieldValidation = (body, requiredFields) => {
  try {
    let validateFields = Object.keys(body).every(field => requiredFields.includes(field));
    if(!validateFields) {
      return {
        status: validateFields,
        message: 'All required fields should be present'
      }
    }

    return { status: validateFields }

  } catch(err) {
    console.log(err.message)
  }
}

module.exports = {
  signUpValidation,
  loginValidation,
  editProfileValidation
}