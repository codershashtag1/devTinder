const express = require('express');
const paymentRouter = express.Router();
const auth = require('../middleware/auth')
const instance = require('../utils/razorPay')
const Payment = require('../models/payment')
const User = require('../models/userModel')
const memberShip = require('../utils/constant')
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils')

paymentRouter.post('/createOrder', auth, async (req, res) => {
  try {
    let { memberShipType } = req.body
    let user = req.user
    let order = await instance.orders.create({
      "amount": memberShip[memberShipType] * 100,
      "method": "netbanking",
      "receipt": "BILL13375649",
      "currency": "INR",
      "notes": {
        "name": `${user.firstName} ${user.lastName}`,
        "email": user.email,
        "memberShip": memberShipType
      }
    })

    const payment = new Payment({
      userId: user._id,
      amount: order.amount,
      method: order.method,
      receipt: order.receipt,
      currency: order.currency,
      notes: order.notes,
      orderId: order.id
    })

    let savePayment = await payment.save()

    let savePaymentJSON = savePayment.toJSON()

    savePaymentJSON.keyId = process.env.RAZORPAY_KEY_ID
    console.log(savePaymentJSON)
    return res.send(savePaymentJSON)

  } catch(err) {
    res.status(400).send(err.message)
  }
})

paymentRouter.post('/webhook', async(req, res) => {
  try {
    const webhookSignature = req.get('X-Razorpay-Signature');
    let isWebHookValid = validateWebhookSignature(JSON.stringify(req.body), webhookSignature, process.env.RAZORPAY_WEBHOOK_SECRET)

    if(!isWebHookValid) {
      res.status(400).json({msg: "WebHook Invalid"})
    }

    console.log(isWebHookValid);

    // Update payment status 
    let paymentDetails = req.body.payload.payment.entity
    let payment = await Payment.find({
      orderId: paymentDetails.order_id
    })
    payment.status = paymentDetails.status
    payment.paymentId = paymentDetails.id
    await payment.save()

    console.log(payment);

    let user = await User.find(payment.userId)
    user.isPremium = true;
    user.memberShip = payment.notes.memberShip
    await user.save()

    console.log(user)

    return res.send("Valid Webhook")

  } catch(err) {
    res.status(400).send(err.message)
  }
})

paymentRouter.get('/verifyPremiumUser', auth, (req, res) => {
  try {
    let user = req.user
    return res.json({ isPremium: user.isPremium })

  } catch(err) {
    res.status(400).send(err.message)
  }
})

module.exports = paymentRouter