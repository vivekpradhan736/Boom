import mongoose, { Schema, Document } from "mongoose";

// Define the Video document interface
interface IVideo extends Document {
  title: string;
  description: string;
  videoType: "Short-Form" | "Long-Form";
  videoUrl?: string;
  videoFileUrl?: string;
  videoFileId?: string;
  videoThumbnailUrl?: string;
  videoThumbnailId?: string;
  creator: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId;
  price?: number;
  createdAt: Date;
  updatedAt: Date;
}

const videoSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    videoType: {
      type: String,
      enum: ["Short-Form", "Long-Form"],
      required: true,
    },
    videoUrl: { type: String },
    videoFileUrl: { type: String }, // Cloudinary URL for Short-Form
    videoFileId: { type: String }, // Cloudinary public_id for Short-Form
    videoThumbnailUrl: { type: String }, // Cloudinary URL for thumbnail
    videoThumbnailId: { type: String }, // Cloudinary public_id for thumbnail
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    price: {
      type: Number,
      default: 0,
    //   required: [
    //     function (this: IVideo): boolean {
    //       return this.videoType === "Long-Form";
    //     },
    //     "Price is required for Long-Form videos",
    //   ],
    },
  },
  { timestamps: true }
);

export const Video = mongoose.model("Video", videoSchema);