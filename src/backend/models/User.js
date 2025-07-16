import mongoose from 'mongoose';
import { createClient } from 'redis';

// --- MongoDB User Schema ---
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  phone: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^\d{10}$/,
      'Phone number must be a valid 10-digit number'
    ]
  },
  countryCode: { type: String, required: true }, // ITU country code, e.g., "+91"
  bank: { type: String, required: true },
  accountNumber: { type: String, required: true },
  debitCardNumber: { type: String, required: true },
  linked: { type: Boolean, default: false },
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', userSchema);

// Optionally, for Redis fallback, export a function to validate user objects
export function validateUserObject(obj) {
  return (
    typeof obj?.username === 'string' &&
    typeof obj?.phone === 'string' &&
    typeof obj?.countryCode === 'string' &&
    typeof obj?.bank === 'string' &&
    typeof obj?.accountNumber === 'string' &&
    typeof obj?.debitCardNumber === 'string'
  );
}

// Export redis createClient for use in fallback logic elsewhere if needed
export { createClient };