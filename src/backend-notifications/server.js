import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

const PORT = process.env.PORT || 5000;

async function connectDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB error:', err);
  }
}

connectDatabase();

app.get('/', (req, res) => {
  res.send('🚀 Backend is running!');
});

app.listen(PORT, () => console.log(`🌐 Server running on http://localhost:${PORT}`));