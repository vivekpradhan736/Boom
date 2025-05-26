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
const Video_1 = require("../models/Video");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const multer_1 = __importDefault(require("multer"));
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
        const { title, description, videoType, videoUrl, price } = req.body;
        const userId = req.userId; // From JWT middleware
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
            videoData.videoUrl = videoResult.secure_url;
            videoData.videoId = videoResult.public_id;
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
exports.default = router;
