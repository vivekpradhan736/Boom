import express, { Request, Response } from "express";
import { Post } from "../models/Post";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const post = new Post(req.body);
    await post.save();
    const populatedPost = await Post.findById(post._id).populate("creator").populate("likes");
    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 9;
    const skip = (page - 1) * limit;
    const posts = await Post.find()
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("creator")
      .populate("likes");
    res.json({ documents: posts, total: await Post.countDocuments() });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/search/:searchTerm", async (req: Request<{ searchTerm: string }>, res: Response) => {
  try {
    const { searchTerm } = req.params;
    const posts = await Post.find({
      caption: { $regex: searchTerm, $options: "i" },
    })
      .populate("creator")
      .populate("likes");
    res.json({ documents: posts, total: posts.length });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/user/:userId", async (req: Request<{ userId: string }>, res: Response) => {
  try {
    const posts = await Post.find({ creator: req.params.userId })
      .sort({ createdAt: -1 })
      .populate("creator")
      .populate("likes");
      
    console.log("posts",posts)
    res.json({ documents: posts, total: posts.length });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/recent", async (req: Request, res: Response) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("creator")
      .populate("likes");
    res.json({ documents: posts, total: posts.length });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/:id", async (req: Request<{ id: string }>, res: Response) => {
  try {
    const post = await Post.findById(req.params.id).populate("creator").populate("likes");
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put("/:id", async (req: Request<{ id: string }>, res: Response) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("creator")
      .populate("likes");
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.delete("/:id", async (req: Request<{ id: string }>, res: Response) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json({ status: "Ok" });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/:id/like", async (req: Request<{ id: string }>, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    post.likes = req.body.likes;
    await post.save();
    const populatedPost = await Post.findById(post._id).populate("creator").populate("likes");
    res.json(populatedPost);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;