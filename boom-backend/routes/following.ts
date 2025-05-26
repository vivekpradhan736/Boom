import express, { Request, Response } from "express";
import { Following } from "../models/Following";

const router = express.Router();

// Create a new following relationship
router.post("/", async (req: Request, res: Response) => {
  try {
    const following = new Following(req.body);
    await following.save();
    const populatedFollowing = await Following.findById(following._id)
      .populate("byUser")
      .populate("toUsers");
    res.status(201).json(populatedFollowing);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Get following relationships by user ID (users followed by a specific user)
router.get("/byUser/:userId", async (req: Request<{ userId: string }>, res: Response) => {
  try {
    const followings = await Following.find({ byUser: req.params.userId })
      .populate("byUser")
      .populate("toUsers");
    res.json({ documents: followings, total: followings.length });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get users followed by the current user
router.get("/byCurrentUser/:userId", async (req: Request<{ userId: string }>, res: Response) => {
  try {
    const followings = await Following.find({ byUser: req.params.userId })
      .populate("toUsers"); // Populate only toUsers for efficiency
    res.json({
      documents: followings,
      total: followings.length,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get users follower by the current user
router.get("/followerByCurrentUser/:userId", async (req: Request<{ userId: string }>, res: Response) => {
  try {
    const followers = await Following.find({ toUsers: req.params.userId })
      .populate("byUser"); // Populate only byUser for efficiency
    res.json({
      documents: followers,
      total: followers.length,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Delete a following relationship
router.delete("/:id", async (req: Request<{ id: string }>, res: Response) => {
  try {
    const following = await Following.findByIdAndDelete(req.params.id);
    if (!following) return res.status(404).json({ error: "Following relationship not found" });
    res.json({ status: "Ok" });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;