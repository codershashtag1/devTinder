const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.ObjectId,
    require: true,
    refer: "User"
  },
  orderId: {
    type: String,
    require: true
  },
  paymentId: {
    type: String
  },
  amount: {
    type: Number,
    require: true
  },
  currency: {
    type: String,
    require: true
  },
  status: {
    type: String,
    require: true
  },
  receipt: {
    type: String,
    require: true
  },
  notes: {
    name: {
      type: String,
      require: true
    },
    email: {
      type: String,
      require: true
    },
    memberShip: {
      type: String,
      require: true
    }
  }
}, {
  timestamps: true
})

module.exports = mongoose.model("payment", paymentSchema)