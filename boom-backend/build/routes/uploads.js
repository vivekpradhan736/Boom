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
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const router = express_1.default.Router();
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        // Convert buffer to data URI
        const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
        const result = yield cloudinary_1.default.uploader.upload(dataUri, {
            folder: "boom_media",
            resource_type: "auto",
        });
        const imageId = (_a = result === null || result === void 0 ? void 0 : result.public_id) === null || _a === void 0 ? void 0 : _a.split("/")[1];
        const imageUrl = result.secure_url;
        res.json({ id: imageId, url: imageUrl });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield cloudinary_1.default.uploader.destroy(req.params.id);
        res.json({ status: "Ok" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
exports.default = router;
