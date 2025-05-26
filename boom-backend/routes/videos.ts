import express, { Request, Response } from "express";
import { Video } from "../models/Video";
import cloudinary from "../config/cloudinary";
import multer from "multer";
import { UploadApiResponse } from "cloudinary";

const router = express.Router();

// Multer configuration for video and thumbnail uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (
      file.fieldname === "videoFile" && file.mimetype === "video/mp4" ||
      file.fieldname === "videoThumbnail" && file.mimetype.startsWith("image/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type: videoFile must be .mp4, videoThumbnail must be an image"));
    }
  },
});

// Upload a new video
router.post("/", upload.fields([
  { name: "videoFile", maxCount: 1 },
  { name: "videoThumbnail", maxCount: 1 },
]), async (req: Request, res: Response) => {
  try {
    const { title, description, videoType, videoUrl, price } = req.body;
    const userId = req.userId; // From JWT middleware
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Validate inputs
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!title || !description || !videoType) {
      return res.status(400).json({ error: "Title, description, and video type are required" });
    }
    if (!["Short-Form", "Long-Form"].includes(videoType)) {
      return res.status(400).json({ error: "Invalid video type" });
    }

    // Create video document
    const videoData: any = {
      title,
      description,
      videoType,
      creator: userId,
    };

    if (videoType === "Short-Form") {
      const videoFile = files?.videoFile?.[0];
      if (!videoFile) return res.status(400).json({ error: "Video file is required for Short-Form" });
      // Upload video to Cloudinary
      const videoDataUri = `data:${videoFile.mimetype};base64,${videoFile.buffer.toString("base64")}`;
      const videoResult: UploadApiResponse = await cloudinary.uploader.upload(videoDataUri, {
        folder: "social_media_videos",
        resource_type: "video",
      });
      videoData.videoUrl = videoResult.secure_url;
      videoData.videoId = videoResult.public_id;

      // Upload thumbnail if provided
      const thumbnailFile = files?.videoThumbnail?.[0];
      if (thumbnailFile) {
        const thumbnailDataUri = `data:${thumbnailFile.mimetype};base64,${thumbnailFile.buffer.toString("base64")}`;
        const thumbnailResult: UploadApiResponse = await cloudinary.uploader.upload(thumbnailDataUri, {
          folder: "social_media_thumbnails",
          resource_type: "image",
        });
        videoData.videoThumbnailUrl = thumbnailResult.secure_url;
        videoData.videoThumbnailId = thumbnailResult.public_id;
      }
    } else {
      if (!videoUrl) return res.status(400).json({ error: "Video URL is required for Long-Form" });
      videoData.videoUrl = videoUrl;
      videoData.price = parseFloat(price) || 0;

      // Upload thumbnail if provided
      const thumbnailFile = files?.videoThumbnail?.[0];
      if (thumbnailFile) {
        const thumbnailDataUri = `data:${thumbnailFile.mimetype};base64,${thumbnailFile.buffer.toString("base64")}`;
        const thumbnailResult: UploadApiResponse = await cloudinary.uploader.upload(thumbnailDataUri, {
          folder: "social_media_thumbnails",
          resource_type: "image",
        });
        videoData.videoThumbnailUrl = thumbnailResult.secure_url;
        videoData.videoThumbnailId = thumbnailResult.public_id;
      }
    }

    const video = new Video(videoData);
    await video.save();

    const populatedVideo = await Video.findById(video._id).populate("creator");
    res.status(201).json(populatedVideo);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;