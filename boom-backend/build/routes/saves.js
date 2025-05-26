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
const Save_1 = require("../models/Save");
const router = express_1.default.Router();
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const save = new Save_1.Save(req.body);
        yield save.save();
        res.status(201).json(save);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}));
// Get all saved posts for a user
router.get("/user/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const saves = yield Save_1.Save.find({ user: req.params.userId })
            .populate({
            path: "post",
            populate: { path: "creator" }, // Populate post's creator
        })
            .sort({ createdAt: -1 }); // Sort by most recent saves
        res.json({ documents: saves, total: saves.length });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const save = yield Save_1.Save.findByIdAndDelete(req.params.id);
        if (!save)
            return res.status(404).json({ error: "Save not found" });
        res.json({ status: "Ok" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
exports.default = router;
