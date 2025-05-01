const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: "User",
  },
  text: {
    type: String,
    require: true
  }
}, {
  timestamps: true
})

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId, require: true, ref: 'User'
  }],
  messages: [messageSchema]
})

module.exports = mongoose.model("Chat", chatSchema)