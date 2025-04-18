const mongoose = require('mongoose');

const connectionRequest = new mongoose.Schema({
  fromUserId: {
    type: mongoose.ObjectId,
    require: true,
    ref: "User"
  },
  toUserId: {
    type: mongoose.ObjectId,
    require: true,
    ref: "User"
  },
  status: {
    type: String,
    require: true,
    enum: {
      values: ['accepted', 'rejected', 'ignored', 'interested'],
      message: '{VALUE} is not supported'
    }
  }
},{
  timestamps: true
})

connectionRequest.index({
  fromUserId: 1,
  toUserId: 1
});



module.exports = mongoose.model('ConnectionRequest', connectionRequest)