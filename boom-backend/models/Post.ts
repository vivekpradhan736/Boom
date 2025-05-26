import mongoose, { Schema } from "mongoose";

const postSchema = new Schema({
  creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
  caption: { type: String },
  imageUrl: { type: String },
  imageId: { type: String },
  location: { type: String },
  tags: [{ type: String }],
  likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

export const Post = mongoose.model("Post", postSchema);