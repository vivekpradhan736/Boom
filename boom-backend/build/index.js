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
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("./config/db");
const users_1 = __importDefault(require("./routes/users"));
const posts_1 = __importDefault(require("./routes/posts"));
const following_1 = __importDefault(require("./routes/following"));
const comments_1 = __importDefault(require("./routes/comments"));
const saves_1 = __importDefault(require("./routes/saves"));
const chats_1 = __importDefault(require("./routes/chats"));
const messages_1 = __importDefault(require("./routes/messages"));
const auth_1 = __importDefault(require("./routes/auth"));
const uploads_1 = __importDefault(require("./routes/uploads"));
const videos_1 = __importDefault(require("./routes/videos"));
const multer_1 = __importDefault(require("multer"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// app.use(cors());
app.use(express_1.default.json());
const allowedOrigins = ['http://localhost:5173'];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Check if the incoming origin is in the allowedOrigins array
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
app.use("/api/uploads", upload.single("file"), uploads_1.default);
// JWT Middleware
app.use((req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            req.userId = decoded.userId;
        }
        catch (error) {
            console.error("JWT verification failed:", error);
        }
    }
    next();
});
app.use("/api/users", users_1.default);
app.use("/api/posts", posts_1.default);
app.use("/api/videos", videos_1.default);
app.use("/api/following", following_1.default);
app.use("/api/comments", comments_1.default);
app.use("/api/saves", saves_1.default);
app.use("/api/chats", chats_1.default);
app.use("/api/messages", messages_1.default);
app.use("/api/auth", auth_1.default);
const PORT = process.env.PORT || 5000;
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, db_1.connectDB)();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
startServer();
