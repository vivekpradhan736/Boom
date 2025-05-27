import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { Video } from "../models/Video";
import { VideoPurchase } from "../models/VideoPurchase";
import cloudinary from "../config/cloudinary";
import multer from "multer";
import { UploadApiResponse } from "cloudinary";

// Define SavedVideo schema
const savedVideoSchema = new mongoose.Schema({
  user: { type: String, required: true }, // User ID
  video: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true },
});

const SavedVideo = mongoose.model("SavedVideo", savedVideoSchema);

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
    const { title, description, videoType, videoUrl, price, userId } = req.body;
    console.log("req.body", req.body)
    // const userId = req.userId; // From JWT middleware
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
      videoData.videoFileUrl = videoResult.secure_url;
      videoData.videoFileId = videoResult.public_id;

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

// Get recent videos
router.get("/recent", async (req: Request, res: Response) => {
  try {
    const videos = await Video.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("creator")
      .populate("likes");
    res.status(200).json(videos);
  } catch (error) {
    console.log("errors",error)
    res.status(500).json({ error: (error as Error).message });
  }
});

// Like or unlike a video
router.post("/:videoId/like", async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const { likes } = req.body; // Array of user IDs
    const userId = req.userId;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ error: "Invalid video ID" });
    }
    if (!Array.isArray(likes)) {
      return res.status(400).json({ error: "Likes must be an array" });
    }

    await Video.updateOne(
      { _id: videoId },
      { likes: likes.map((id: string) => ({ _id: id })) }
    );

    const updatedVideo = await Video.findById(videoId)
      .populate("creator")
      .lean();
    res.status(200).json(updatedVideo);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Save a video
router.post("/save", async (req: Request, res: Response) => {
  try {
    const { user, video } = req.body;
    const userId = req.userId;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (user !== userId)
      return res.status(403).json({ error: "Cannot save for another user" });
    if (!mongoose.Types.ObjectId.isValid(video)) {
      return res.status(400).json({ error: "Invalid video ID" });
    }

    const existingSave = await SavedVideo.findOne({ user, video });
    if (existingSave) {
      return res.status(400).json({ error: "Video already saved" });
    }

    const savedVideo = new SavedVideo({ user, video });
    await savedVideo.save();

    const populatedSavedVideo = await SavedVideo.findById(savedVideo._id)
      .populate({
        path: "video",
        populate: { path: "creator" },
      })
      .lean();
    res.status(201).json(populatedSavedVideo);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Delete a saved video
router.delete("/save/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid saved video ID" });
    }

    const savedVideo = await SavedVideo.findById(id);
    if (!savedVideo) {
      return res.status(404).json({ error: "Saved video not found" });
    }
    if (savedVideo.user !== userId) {
      return res
        .status(403)
        .json({ error: "Cannot delete another user's saved video" });
    }

    await SavedVideo.deleteOne({ _id: id });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get saved videos for a user
router.get("/saved/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res
        .status(403)
        .json({ error: "Cannot access saved videos" });
    }

    const savedVideos = await SavedVideo.find({ user: userId })
      .populate({
        path: "video",
        populate: { path: "creator" },
      })
      .lean();
    res.status(200).json(savedVideos);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Purchase a video
router.post("/purchase", async (req: Request, res: Response) => {
  try {
    const { videoId, userId } = req.body;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ error: "Invalid video ID" });
    }

    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ error: "Video not found" });
    if (video.videoType !== "Long-Form") {
      return res.status(400).json({ error: "Only Long-Form videos can be purchased" });
    }
    if (video.price === 0) {
      return res.status(400).json({ error: "Video is free, no purchase required" });
    }

    const existingPurchase = await VideoPurchase.findOne({
      videoId,
      userId,
      status: "completed",
    });
    if (existingPurchase) {
      return res.status(400).json({ error: "Video already purchased" });
    }

    // Mock payment processing (replace with real payment gateway)
    const purchase = new VideoPurchase({
      videoId,
      userId,
      price: video.price,
    });
    await purchase.save();

    const populatedPurchase = await VideoPurchase.findById(purchase._id)
      .populate("videoId")
      .lean();
    res.status(201).json(populatedPurchase);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Check purchase status
router.get("/purchases/:userId/:videoId", async (req: Request, res: Response) => {
  try {
    const { userId, videoId } = req.params;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ error: "Invalid video ID" });
    }

    const purchase = await VideoPurchase.findOne({
      userId,
      videoId,
      status: "completed",
    }).lean();

    res.status(200).json({ purchase: purchase, purchased: !!purchase });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;