const socket = require('socket.io');
const Chat = require('../models/chat');
const ConnectionRequest = require('../models/connectionRequestModel');

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: 'http://localhost:5173'
    }
  })

  io.on('connection', (socket) => { 
    socket.on('join', ({ userId, targetUserId }) => {
      let roomId = [userId, targetUserId].sort().join('_')
      socket.join(roomId)
    })

    socket.on('sendMessage', async ({ name, userId, targetUserId, text}) => {
      let roomId = [userId, targetUserId].sort().join('_')

      // Check if both User are friends
      let isBothUserFriends = await ConnectionRequest.find({
        $or: [
          { fromUserId: userId, toUserId: targetUserId, status: "accepted" },
          {
            fromUserId: targetUserId,
            toUserId: userId,
            status: "accepted"
          }
        ]
      })

      if (isBothUserFriends.length == 0) {
        socket.emit('errorMessage', {
          success: false,
          message: 'You are not friends with this user. Message cannot be sent.'
        });
        return;
      }


      // Store Chat and messages in DB
      let chat = await Chat.findOne({ participants: { $all: [ userId, targetUserId] } })
      if (!chat) {
        chat = new Chat({
          participants: [userId, targetUserId],
          messages: []
        })
      }

      chat.messages.push({senderId: userId,text})
      await chat.save()

      socket.to(roomId).emit('messageReceived', {
        name,
        text,
        createdAt: new Date()
      })
    })

  })
}

module.exports = initializeSocket