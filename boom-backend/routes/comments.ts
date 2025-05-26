import express, { Request, Response } from "express";
import { Comment } from "../models/Comment";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const comment = new Comment(req.body);
    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.get("/post/:postId", async (req: Request<{ postId: string }>, res: Response) => {
  try {
    const comments = await Comment.find({ posts: req.params.postId }).populate("users").populate("posts");
    res.json({ documents: comments, total: comments.length });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;