const express = require('express');
const auth = require('../middleware/auth');
const chatRouter = express.Router();
const Chat = require('../models/chat')

chatRouter.get('/chatReceived/:targetUserId', auth, async(req, res) => {
  try {
    let userId = req.user._id;
    let targetUserId = req.params.targetUserId

    let chat = await Chat.findOne({
      participants: {
        $all: [userId, targetUserId]
      }
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName"
    });

    if(!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
        messages: []
      })
      await chat.save()
    }

    return res.json(chat)

  } catch(err) {
    res.status(400).send(err.message)
  }
})

module.exports = chatRouter