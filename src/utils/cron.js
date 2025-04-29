const cron = require('node-cron');
const ConnectionRequestModel = require('../models/connectionRequestModel');
const { subDays, startOfDay, endOfDay } = require('date-fns')
const ses_sendEmail = require('./ses_sendEmail');

cron.schedule('0 8 * * *', async () => {
  try {
    
    let yesterday = subDays(new Date(), 1);
    let yesterdayStart = startOfDay(yesterday);
    let yesterdayEnd = endOfDay(yesterday)

    const pendingRequest = await ConnectionRequestModel.find({
      status: 'interested',
      createdAt: {
        $gte: yesterdayStart,
        $lte: yesterdayEnd
      }
    }).populate('fromUserId toUserId')

    let listOfEmails = [...new Set(pendingRequest.map(e => e.toUserId.email))]
    console.log(listOfEmails);

  //  / let data = await ses_sendEmail.run(`Please Login to devTinder and check the requests you have received`)

    // for(let i = 0; i < listOfEmails.length; i++) {
    //   let data = await ses_sendEmail.run(`Please Login to devTinder and check the requests you have received ${listOfEmails[i]}`)
    //   console.log(data);
    // }

  } catch(err) {
    console.log(err);
  }
})