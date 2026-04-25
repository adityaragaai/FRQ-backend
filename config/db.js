import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rfq_system';
    
    const conn = await mongoose.connect(mongoUri);

    console.log(`✅ MongoDB Connected successfully`);
    console.log(`📌 Database Name: ${conn.connection.name}`);
    console.log(`📌 Host: ${conn.connection.host}`);
    
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;
