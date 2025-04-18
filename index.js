require('dotenv').config();

const connectDB = require('./src/config/dbConnection');

const express = require('express');
const app = express();
const cookieParser = require('cookie-parser')

const User = require('./src/models/userModel')
const ConnectionRequest = require('./src/models/connectionRequestModel')

const authRouter = require('./src/routes/authRouter')
const profileRouter = require('./src/routes/profileRouter')
const connectionRequestRouter = require('./src/routes/connectionRequestRouter')
const userRouter = require('./src/routes/userRouter')

app.use(express.json());
app.use(cookieParser())

app.use('/auth', authRouter);
app.use('/profile', profileRouter);
app.use('/request', connectionRequestRouter);
app.use('/user', userRouter);


connectDB().then(() => {
  console.log('MongoDB connected successfully');
  app.listen(process.env.port, () => {
    console.log(`Server is running on Port :${process.env.port}`);
  });
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

