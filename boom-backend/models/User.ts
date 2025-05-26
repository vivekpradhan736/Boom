import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  accountId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  username: { type: String, unique: true },
  imageUrl: { type: String },
  imageId: { type: String },
  bio: { type: String },
  balance: { type: Number, default: 500 },
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);