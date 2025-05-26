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
const User_1 = require("../models/User");
const Auth_1 = require("../models/Auth");
const router = express_1.default.Router();
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = new User_1.User(req.body);
        yield user.save();
        res.status(201).json(user);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}));
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const users = yield User_1.User.find().sort({ createdAt: -1 }).limit(limit);
        res.json({ documents: users, total: yield User_1.User.countDocuments() });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
router.get("/me", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId; // Assuming middleware sets req.userId from JWT
        const user = yield Auth_1.Auth.findById(userId);
        const fullUserData = yield User_1.User.findOne({ email: user === null || user === void 0 ? void 0 : user.email });
        if (!fullUserData)
            return res.status(404).json({ error: "User not found" });
        res.json(fullUserData);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.User.findById(req.params.id);
        if (!user)
            return res.status(404).json({ error: "User not found" });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        res.json(user);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}));
router.get("/search/:searchTerm", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { searchTerm } = req.params;
        const currentUserId = req.query.currentUserId;
        const users = yield User_1.User.find({
            username: { $regex: searchTerm, $options: "i" },
            _id: { $ne: currentUserId },
        });
        res.json({ documents: users, total: users.length });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
exports.default = router;
