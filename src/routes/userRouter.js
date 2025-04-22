const express = require('express');
const userRouter = express.Router();
const ConnectionRequest = require('../models/connectionRequestModel')
const auth = require('../middleware/auth')
const User = require('../models/userModel')

const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";

userRouter.get('/requests/received', auth, async (req, res) => {
  try {
    let loggedInUser = req.user;

    let requestReceived = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: 'interested'
    }).populate('fromUserId', USER_SAFE_DATA)

  
    res.send(requestReceived)

  } catch(err) {
    res.status(400).send(err.message)
  }
});

userRouter.get('/connections', auth, async (req, res) => {
  try {
    let message = "";
    const loggedInUser = req.user;
    const connection = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id },
        { fromUserId: loggedInUser._id }
      ],
      status: 'accepted'
    }).populate('fromUserId', USER_SAFE_DATA)
    .populate('toUserId', USER_SAFE_DATA).lean()

    let loggedInUserId = loggedInUser._id.toString()
    const connectionRequest = [];
    for (let data of connection) {
      if (data.fromUserId._id.toString() === loggedInUserId) {
        connectionRequest.push(data.toUserId)
      } else {
        connectionRequest.push(data.fromUserId)
      }
    }

    if (connectionRequest.length > 0) {
      message = "Connections Found"
    } else {
      message = 'No Connection Found'
    }

    res.json({
      data: connectionRequest,
      message
    })

  } catch(err) {
    res.status(400).send(err.message);
  }
})

userRouter.get('/feed', auth, async (req, res) => {
  try {

    let loggedInUser = req.user

    let page = req.query.page || 1;
    let limit = req.query.limit || 10;

    let skip = (page - 1) * limit

    let connectionRequest = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id },
        { fromUserId: loggedInUser._id }
      ]
    }).select('fromUserId toUserId')

    const hideUserFromFeed = new Set();
    connectionRequest.forEach((req) => {
      hideUserFromFeed.add(req.fromUserId.toString())
      hideUserFromFeed.add(req.toUserId.toString())
    })

    let user = await User.find({
      $and : [
        { _id: { $nin: Array.from(hideUserFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    }).select(USER_SAFE_DATA).skip(skip).limit(limit)

    if (user.length > 0) {
      res.send(user)
    } else {
      res.json({ message: 'No Connection Found'})
    }

  } catch(err) {
    res.status(400).send(err.message);
  }
})

module.exports = userRouter