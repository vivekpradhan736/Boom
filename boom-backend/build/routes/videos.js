"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const Video_1 = require("../models/Video");
const VideoPurchase_1 = require("../models/VideoPurchase");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const multer_1 = __importDefault(require("multer"));
// Define SavedVideo schema
const savedVideoSchema = new mongoose_1.default.Schema({
    user: { type: String, required: true }, // User ID
    video: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Video", required: true },
});
const SavedVideo = mongoose_1.default.model("SavedVideo", savedVideoSchema);
const router = express_1.default.Router();
// Multer configuration for video and thumbnail uploads
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.fieldname === "videoFile" && file.mimetype === "video/mp4" ||
            file.fieldname === "videoThumbnail" && file.mimetype.startsWith("image/")) {
            cb(null, true);
        }
        else {
            cb(new Error("Invalid file type: videoFile must be .mp4, videoThumbnail must be an image"));
        }
    },
});
// Upload a new video
router.post("/", upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "videoThumbnail", maxCount: 1 },
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { title, description, videoType, videoUrl, price, userId } = req.body;
        console.log("req.body", req.body);
        // const userId = req.userId; // From JWT middleware
        const files = req.files;
        // Validate inputs
        if (!userId)
            return res.status(401).json({ error: "Unauthorized" });
        if (!title || !description || !videoType) {
            return res.status(400).json({ error: "Title, description, and video type are required" });
        }
        if (!["Short-Form", "Long-Form"].includes(videoType)) {
            return res.status(400).json({ error: "Invalid video type" });
        }
        // Create video document
        const videoData = {
            title,
            description,
            videoType,
            creator: userId,
        };
        if (videoType === "Short-Form") {
            const videoFile = (_a = files === null || files === void 0 ? void 0 : files.videoFile) === null || _a === void 0 ? void 0 : _a[0];
            if (!videoFile)
                return res.status(400).json({ error: "Video file is required for Short-Form" });
            // Upload video to Cloudinary
            const videoDataUri = `data:${videoFile.mimetype};base64,${videoFile.buffer.toString("base64")}`;
            const videoResult = yield cloudinary_1.default.uploader.upload(videoDataUri, {
                folder: "social_media_videos",
                resource_type: "video",
            });
            videoData.videoFileUrl = videoResult.secure_url;
            videoData.videoFileId = videoResult.public_id;
            // Upload thumbnail if provided
            const thumbnailFile = (_b = files === null || files === void 0 ? void 0 : files.videoThumbnail) === null || _b === void 0 ? void 0 : _b[0];
            if (thumbnailFile) {
                const thumbnailDataUri = `data:${thumbnailFile.mimetype};base64,${thumbnailFile.buffer.toString("base64")}`;
                const thumbnailResult = yield cloudinary_1.default.uploader.upload(thumbnailDataUri, {
                    folder: "social_media_thumbnails",
                    resource_type: "image",
                });
                videoData.videoThumbnailUrl = thumbnailResult.secure_url;
                videoData.videoThumbnailId = thumbnailResult.public_id;
            }
        }
        else {
            if (!videoUrl)
                return res.status(400).json({ error: "Video URL is required for Long-Form" });
            videoData.videoUrl = videoUrl;
            videoData.price = parseFloat(price) || 0;
            // Upload thumbnail if provided
            const thumbnailFile = (_c = files === null || files === void 0 ? void 0 : files.videoThumbnail) === null || _c === void 0 ? void 0 : _c[0];
            if (thumbnailFile) {
                const thumbnailDataUri = `data:${thumbnailFile.mimetype};base64,${thumbnailFile.buffer.toString("base64")}`;
                const thumbnailResult = yield cloudinary_1.default.uploader.upload(thumbnailDataUri, {
                    folder: "social_media_thumbnails",
                    resource_type: "image",
                });
                videoData.videoThumbnailUrl = thumbnailResult.secure_url;
                videoData.videoThumbnailId = thumbnailResult.public_id;
            }
        }
        const video = new Video_1.Video(videoData);
        yield video.save();
        const populatedVideo = yield Video_1.Video.findById(video._id).populate("creator");
        res.status(201).json(populatedVideo);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// Get recent videos
router.get("/recent", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const videos = yield Video_1.Video.find()
            .sort({ createdAt: -1 })
            .limit(20)
            .populate("creator")
            .populate("likes");
        res.status(200).json(videos);
    }
    catch (error) {
        console.log("errors", error);
        res.status(500).json({ error: error.message });
    }
}));
// Like or unlike a video
router.post("/:videoId/like", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { videoId } = req.params;
        const { likes } = req.body; // Array of user IDs
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized" });
        if (!mongoose_1.default.Types.ObjectId.isValid(videoId)) {
            return res.status(400).json({ error: "Invalid video ID" });
        }
        if (!Array.isArray(likes)) {
            return res.status(400).json({ error: "Likes must be an array" });
        }
        yield Video_1.Video.updateOne({ _id: videoId }, { likes: likes.map((id) => ({ _id: id })) });
        const updatedVideo = yield Video_1.Video.findById(videoId)
            .populate("creator")
            .lean();
        res.status(200).json(updatedVideo);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// Save a video
router.post("/save", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user, video } = req.body;
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized" });
        if (user !== userId)
            return res.status(403).json({ error: "Cannot save for another user" });
        if (!mongoose_1.default.Types.ObjectId.isValid(video)) {
            return res.status(400).json({ error: "Invalid video ID" });
        }
        const existingSave = yield SavedVideo.findOne({ user, video });
        if (existingSave) {
            return res.status(400).json({ error: "Video already saved" });
        }
        const savedVideo = new SavedVideo({ user, video });
        yield savedVideo.save();
        const populatedSavedVideo = yield SavedVideo.findById(savedVideo._id)
            .populate({
            path: "video",
            populate: { path: "creator" },
        })
            .lean();
        res.status(201).json(populatedSavedVideo);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// Delete a saved video
router.delete("/save/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized" });
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid saved video ID" });
        }
        const savedVideo = yield SavedVideo.findById(id);
        if (!savedVideo) {
            return res.status(404).json({ error: "Saved video not found" });
        }
        if (savedVideo.user !== userId) {
            return res
                .status(403)
                .json({ error: "Cannot delete another user's saved video" });
        }
        yield SavedVideo.deleteOne({ _id: id });
        res.status(200).json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// Get saved videos for a user
router.get("/saved/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res
                .status(403)
                .json({ error: "Cannot access saved videos" });
        }
        const savedVideos = yield SavedVideo.find({ user: userId })
            .populate({
            path: "video",
            populate: { path: "creator" },
        })
            .lean();
        res.status(200).json(savedVideos);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// Purchase a video
router.post("/purchase", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { videoId, userId } = req.body;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized" });
        if (!mongoose_1.default.Types.ObjectId.isValid(videoId)) {
            return res.status(400).json({ error: "Invalid video ID" });
        }
        const video = yield Video_1.Video.findById(videoId);
        if (!video)
            return res.status(404).json({ error: "Video not found" });
        if (video.videoType !== "Long-Form") {
            return res.status(400).json({ error: "Only Long-Form videos can be purchased" });
        }
        if (video.price === 0) {
            return res.status(400).json({ error: "Video is free, no purchase required" });
        }
        const existingPurchase = yield VideoPurchase_1.VideoPurchase.findOne({
            videoId,
            userId,
            status: "completed",
        });
        if (existingPurchase) {
            return res.status(400).json({ error: "Video already purchased" });
        }
        // Mock payment processing (replace with real payment gateway)
        const purchase = new VideoPurchase_1.VideoPurchase({
            videoId,
            userId,
            price: video.price,
        });
        yield purchase.save();
        const populatedPurchase = yield VideoPurchase_1.VideoPurchase.findById(purchase._id)
            .populate("videoId")
            .lean();
        res.status(201).json(populatedPurchase);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// Check purchase status
router.get("/purchases/:userId/:videoId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, videoId } = req.params;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized" });
        if (!mongoose_1.default.Types.ObjectId.isValid(videoId)) {
            return res.status(400).json({ error: "Invalid video ID" });
        }
        const purchase = yield VideoPurchase_1.VideoPurchase.findOne({
            userId,
            videoId,
            status: "completed",
        }).lean();
        res.status(200).json({ purchase: purchase, purchased: !!purchase });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
exports.default = router;
