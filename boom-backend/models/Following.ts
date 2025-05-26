import mongoose, { Schema } from "mongoose";

const followingSchema = new Schema({
  byUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
  toUsers: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

export const Following = mongoose.model("Following", followingSchema);