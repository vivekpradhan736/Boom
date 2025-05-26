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
const Following_1 = require("../models/Following");
const router = express_1.default.Router();
// Create a new following relationship
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const following = new Following_1.Following(req.body);
        yield following.save();
        const populatedFollowing = yield Following_1.Following.findById(following._id)
            .populate("byUser")
            .populate("toUsers");
        res.status(201).json(populatedFollowing);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}));
// Get following relationships by user ID (users followed by a specific user)
router.get("/byUser/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const followings = yield Following_1.Following.find({ byUser: req.params.userId })
            .populate("byUser")
            .populate("toUsers");
        res.json({ documents: followings, total: followings.length });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// Get users followed by the current user
router.get("/byCurrentUser/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const followings = yield Following_1.Following.find({ byUser: req.params.userId })
            .populate("toUsers"); // Populate only toUsers for efficiency
        res.json({
            documents: followings,
            total: followings.length,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// Get users follower by the current user
router.get("/followerByCurrentUser/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const followers = yield Following_1.Following.find({ toUsers: req.params.userId })
            .populate("byUser"); // Populate only byUser for efficiency
        res.json({
            documents: followers,
            total: followers.length,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// Delete a following relationship
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const following = yield Following_1.Following.findByIdAndDelete(req.params.id);
        if (!following)
            return res.status(404).json({ error: "Following relationship not found" });
        res.json({ status: "Ok" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
exports.default = router;
