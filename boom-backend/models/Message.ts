import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema({
  content: { type: String, required: true },
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  chat: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

export const Message = mongoose.model("Message", messageSchema);