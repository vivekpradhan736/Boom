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
const Post_1 = require("../models/Post");
const router = express_1.default.Router();
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = new Post_1.Post(req.body);
        yield post.save();
        const populatedPost = yield Post_1.Post.findById(post._id).populate("creator").populate("likes");
        res.status(201).json(populatedPost);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}));
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 9;
        const skip = (page - 1) * limit;
        const posts = yield Post_1.Post.find()
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("creator")
            .populate("likes");
        res.json({ documents: posts, total: yield Post_1.Post.countDocuments() });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
router.get("/search/:searchTerm", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { searchTerm } = req.params;
        const posts = yield Post_1.Post.find({
            caption: { $regex: searchTerm, $options: "i" },
        })
            .populate("creator")
            .populate("likes");
        res.json({ documents: posts, total: posts.length });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
router.get("/user/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield Post_1.Post.find({ creator: req.params.userId })
            .sort({ createdAt: -1 })
            .populate("creator")
            .populate("likes");
        console.log("posts", posts);
        res.json({ documents: posts, total: posts.length });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
router.get("/recent", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield Post_1.Post.find()
            .sort({ createdAt: -1 })
            .limit(20)
            .populate("creator")
            .populate("likes");
        res.json({ documents: posts, total: posts.length });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield Post_1.Post.findById(req.params.id).populate("creator").populate("likes");
        if (!post)
            return res.status(404).json({ error: "Post not found" });
        res.json(post);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield Post_1.Post.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate("creator")
            .populate("likes");
        if (!post)
            return res.status(404).json({ error: "Post not found" });
        res.json(post);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}));
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield Post_1.Post.findByIdAndDelete(req.params.id);
        if (!post)
            return res.status(404).json({ error: "Post not found" });
        res.json({ status: "Ok" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
router.post("/:id/like", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield Post_1.Post.findById(req.params.id);
        if (!post)
            return res.status(404).json({ error: "Post not found" });
        post.likes = req.body.likes;
        yield post.save();
        const populatedPost = yield Post_1.Post.findById(post._id).populate("creator").populate("likes");
        res.json(populatedPost);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}));
exports.default = router;
