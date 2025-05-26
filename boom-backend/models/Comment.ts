import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema({
  users: { type: Schema.Types.ObjectId, ref: "User", required: true },
  posts: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  comment: { type: String, required: true },
}, { timestamps: true });

export const Comment = mongoose.model("Comment", commentSchema);