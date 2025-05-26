import express, { Request, Response } from "express";
import { User } from "../models/User";
import { Auth } from "../models/Auth";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const users = await User.find().sort({ createdAt: -1 }).limit(limit);
    res.json({ documents: users, total: await User.countDocuments() });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/me", async (req: Request, res: Response) => {
  try {
    const userId = req.userId; // Assuming middleware sets req.userId from JWT
    const user = await Auth.findById(userId);

    const fullUserData = await User.findOne({ email: user?.email });

    if (!fullUserData) return res.status(404).json({ error: "User not found" });
    res.json(fullUserData);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/:id", async (req: Request<{ id: string }>, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put("/:id", async (req: Request<{ id: string }>, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.get("/search/:searchTerm", async (req: Request<{ searchTerm: string }>, res: Response) => {
  try {
    const { searchTerm } = req.params;
    const currentUserId = req.query.currentUserId as string;
    const users = await User.find({
      username: { $regex: searchTerm, $options: "i" },
      _id: { $ne: currentUserId },
    });
    res.json({ documents: users, total: users.length });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;