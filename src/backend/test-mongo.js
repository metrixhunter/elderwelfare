import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' }); // Adjust path if needed

async function testMongo() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'mydb' }); // Change 'mydb' if needed
    console.log('✅ MongoDB connected!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
  }
}

testMongo();
