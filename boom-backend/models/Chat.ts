import mongoose, { Schema } from "mongoose";

const chatSchema = new Schema({
  chatName: { type: String },
  users: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
  usersHash: { type: String, required: true },
  isGroupChat: { type: Boolean, default: false },
  usersId: { type: String },
  latestMessage: { type: Schema.Types.ObjectId, ref: "Message" },
}, { timestamps: true });

export const Chat = mongoose.model("Chat", chatSchema);