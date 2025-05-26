import express, { Request, Response } from "express";
import { Save } from "../models/Save";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const save = new Save(req.body);
    await save.save();
    res.status(201).json(save);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Get all saved posts for a user
router.get("/user/:userId", async (req: Request<{ userId: string }>, res: Response) => {
  try {
    const saves = await Save.find({ user: req.params.userId })
      .populate({
        path: "post",
        populate: { path: "creator" }, // Populate post's creator
      })
      .sort({ createdAt: -1 }); // Sort by most recent saves
    res.json({ documents: saves, total: saves.length });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.delete("/:id", async (req: Request<{ id: string }>, res: Response) => {
  try {
    const save = await Save.findByIdAndDelete(req.params.id);
    if (!save) return res.status(404).json({ error: "Save not found" });
    res.json({ status: "Ok" });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;