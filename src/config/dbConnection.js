const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.database_URL)
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit the process with failure
  }
}

module.exports = connectDB