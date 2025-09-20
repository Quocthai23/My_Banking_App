const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const { MONGO_URI, LOG_LEVEL } = process.env;

if (!MONGO_URI) {
  throw new Error('MONGO_URI is missing in .env');
}

const logger = {
  info: (msg) => (LOG_LEVEL === 'info' || LOG_LEVEL === 'debug') && console.log(`[INFO] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
};

const connectDB = async (retries = 5) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const mongooseOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
      };

      await mongoose.connect(MONGO_URI, mongooseOptions);
      logger.info('MongoDB connected successfully!');
      return;
    } catch (error) {
      attempt++;
      logger.error(`MongoDB connection failed (attempt ${attempt}/${retries}): ${error.message}`);
      if (attempt >= retries) {
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

mongoose.connection.on('error', (error) => {
  logger.error(`MongoDB runtime error: ${error.message}`);
});

module.exports = { connectDB, logger };