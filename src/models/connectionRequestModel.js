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


connectionRequest.pre("save", function (next) {
  const connectionReq = this;
  // Check if the fromUserId is same as toUserId
  if (connectionReq.fromUserId.equals(connectionReq.toUserId)) {
    throw new Error("Cannot send connection request to yourself!");
  }
  next();
});


module.exports = mongoose.model('ConnectionRequest', connectionRequest)