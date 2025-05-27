"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoPurchase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const videoPurchaseSchema = new mongoose_1.default.Schema({
    videoId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Video",
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    purchaseDate: {
        type: Date,
        default: Date.now,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "completed", // Simplified for mock; real payment would set "pending" initially
        required: true,
    },
    transactionId: {
        type: String,
        unique: true,
        default: () => `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, // Mock transaction ID
    },
});
exports.VideoPurchase = mongoose_1.default.model("VideoPurchase", videoPurchaseSchema);
