import express, { Request, Response } from "express";
import { Message } from "../models/Message";
import { Chat } from "../models/Chat";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const message = new Message(req.body);
    await message.save();

    await Chat.findByIdAndUpdate(req.body.chat, { latestMessage: message._id });

    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const messages = await Message.find().populate("sender").populate("chat");
    res.json({ documents: messages, total: messages.length });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;