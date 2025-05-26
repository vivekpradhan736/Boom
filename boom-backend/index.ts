import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { connectDB } from "./config/db";
import userRoutes from "./routes/users";
import postRoutes from "./routes/posts";
import followingRoutes from "./routes/following";
import commentRoutes from "./routes/comments";
import saveRoutes from "./routes/saves";
import chatRoutes from "./routes/chats";
import messageRoutes from "./routes/messages";
import authRoutes from "./routes/auth";
import uploadRoutes from "./routes/uploads";
import videoRoutes from "./routes/videos";
import multer from "multer";

dotenv.config();

const app = express();

// app.use(cors());
app.use(express.json());

const allowedOrigins = ['http://localhost:5173'];
app.use(cors({
  origin: (origin : any, callback) => {
    // Check if the incoming origin is in the allowedOrigins array
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

const storage = multer.memoryStorage();
const upload = multer({ storage });
app.use("/api/uploads", upload.single("file"), uploadRoutes);

// JWT Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      req.userId = decoded.userId;
    } catch (error) {
      console.error("JWT verification failed:", error);
    }
  }
  next();
});

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/following", followingRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/saves", saveRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();