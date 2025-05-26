import mongoose, { Schema } from "mongoose";

const videoSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  videoType: { type: String, enum: ["Short-Form", "Long-Form"], required: true },
  videoUrl: { type: String, required: function () { return this.videoType === "Long-Form"; } },
  videoFileUrl: { type: String }, // Cloudinary URL for Short-Form
  videoFileId: { type: String }, // Cloudinary public_id for Short-Form
  videoThumbnailUrl: { type: String }, // Cloudinary URL for thumbnail
  videoThumbnailId: { type: String }, // Cloudinary public_id for thumbnail
  creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
  price: { type: Number, default: 0, required: function () { return this.videoType === "Long-Form"; } },
}, { timestamps: true });

export const Video = mongoose.model("Video", videoSchema);