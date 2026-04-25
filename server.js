import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { updateRfqStatuses } from './services/rfqService.js';
import connectDB from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mount API routes
app.use('/api', routes);

const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Start background status checker
  setInterval(async () => {
    try {
      await updateRfqStatuses();
    } catch (error) {
      console.error('Error updating RFQ statuses:', error);
    }
  }, 5000); // Check every 5 seconds

  app.listen(PORT, () => {
    console.log(`🚀 RFQ Backend API running on http://localhost:${PORT}`);
  });
};

startServer();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});
