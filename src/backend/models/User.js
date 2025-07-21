import mongoose from 'mongoose';
import { createClient } from 'redis';

// --- Member Subschema ---
const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phoneNumbers: [{ type: String, match: [/^\d{10}$/, 'Must be 10 digits'] }],
  emails: [{ type: String }],
  birthdate: { type: Date },
  age: { type: Number },
  images: [{ type: String }], // URLs or base64 image strings (e.g., QR)
});

// --- User Schema ---
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true, unique: true },
  password: { type: String, required: true }, // hashed password recommended

  address: { type: String },
  linked: { type: Boolean, default: false },

  members: { type: [memberSchema], required: true, validate: v => v.length > 0 }
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', userSchema);

// Validate user object for fallback/Redis use
export function validateUserObject(obj) {
  return (
    typeof obj?.username === 'string' &&
    typeof obj?.password === 'string' &&
    Array.isArray(obj?.members) &&
    obj.members.length > 0 &&
    obj.members.every(m =>
      typeof m?.name === 'string' &&
      Array.isArray(m?.phoneNumbers) &&
      Array.isArray(m?.emails) &&
      (typeof m.birthdate === 'string' || m.birthdate instanceof Date || m.birthdate === undefined) &&
      (typeof m.age === 'number' || m.age === undefined) &&
      Array.isArray(m?.images)
    )
  );
}

export { createClient };