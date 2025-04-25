const express = require('express');
const connectionRequestRouter = express.Router();
const auth = require('../middleware/auth');
const ConnectionRequest = require('../models/connectionRequestModel')
const User = require('../models/userModel.js');
const { connection } = require('mongoose');
const ses_sendEmail = require('../utils/ses_sendEmail.js');


connectionRequestRouter.post('/send/:status/:userId', auth, async (req, res) => {
  try {
    let { status, userId: toUserId } = req.params;
    let fromUserId = req.user._id

    let requiredStatus = ['ignored', 'interested']
    if(!requiredStatus.includes(status)) {
      return res.status(400).json({ message: `Invalid Status type ${status}` })
    }

    let isRequestSendToUserPresent = await User.findById(toUserId);
    if (!isRequestSendToUserPresent) {
      return res.status(400).json({ message: 'Invalid User' })
    }

    let isRequestAlreadyExist = await ConnectionRequest.find({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId }
      ]
    })

    if (isRequestAlreadyExist.length > 0) {
      return res.status(400).json({ message: 'Request Already exits'})
    }

    let connectionRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status
    })

    await connectionRequest.save()

    let data = await ses_sendEmail.run(`Request send to User ${isRequestSendToUserPresent.firstName}`);
    console.log(data);

    res.json({
      message: `Request send to User ${isRequestSendToUserPresent.firstName}`
    });

  } catch(err) {
    res.status(400).send(err.message);
  }
})

connectionRequestRouter.post('/review/:status/:requestId', auth, async (req, res) => {
  try {
    let { status, requestId } = req.params;
    let loggedInUser = req.user._id

    let requiredStatus = ['accepted', 'rejected'];
    if(!requiredStatus.includes(status)) {
      return res.status(400).json({ message: `Invalid status type ${status}` })
    }

    let connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      toUserId: loggedInUser,
      status: 'interested'
    })
    if (!connectionRequest) {
      return res.status(400).json({ message: `Invalid Request Id`});
    }

    connectionRequest.status = status

    await connectionRequest.save();

    res.send(`Requested ${status}`)

  } catch(err) {
    res.status(400).send(err.message)
  }
})

module.exports = connectionRequestRouter