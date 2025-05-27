import mongoose from "mongoose";

const videoPurchaseSchema = new mongoose.Schema({
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "completed", // Simplified for mock; real payment would set "pending" initially
    required: true,
  },
  transactionId: {
    type: String,
    unique: true,
    default: () => `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, // Mock transaction ID
  },
});

export const VideoPurchase = mongoose.model("VideoPurchase", videoPurchaseSchema);